import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform, DeviceEventEmitter } from 'react-native'; 
import * as SecureStore from 'expo-secure-store';

interface RefreshResponse {
  token: string;          
  refreshToken: string;
  tipo: string;
  expiraEn: number;
  idPersona: number;
  nombre: string;
  roles: string[];
  distrito: string | null;
  tieneDireccion: boolean;
}

const getBaseUrl = () => 
  Platform.OS === 'web' ? 'http://localhost:8080/api' : 'http://192.168.18.233:8080/api';

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

let isRefreshing = false;
let failedQueue: any[] = [];
let sesionYaExpirada = false;

export const resetSesionExpirada = () => {
  sesionYaExpirada = false;
};

const dispararExpiracion = async (data: { titulo: string; mensaje: string }) => {
  if (sesionYaExpirada) return;
  sesionYaExpirada = true;

  try {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('idPersona');
    await SecureStore.deleteItemAsync('userRoles');
    await SecureStore.deleteItemAsync('userDistrito');
    await SecureStore.deleteItemAsync('userName');
    await SecureStore.deleteItemAsync('userTieneDireccion');
  } catch (err) {
    console.log('====== ⚠️ ERROR LIMPIANDO TOKENS LOCALES ======', err);
  }

  DeviceEventEmitter.emit('EXPIRAR_SESION_GLOBAL', data);
};

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const ejecutarRefrescoInterno = async (): Promise<string | null> => {
  try {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    if (!refreshToken) {
      console.log('No se encontró un Refresh Token local.');
      return null;
    }

    console.log('====== 🔄 ENVIANDO REFRESH TOKEN (POST /auth/refresh) ======');
    
    const respuesta = await axios.post<RefreshResponse>(
      `${getBaseUrl()}/auth/refresh`, 
      { refreshToken }
    );

    console.log('====== 📥 REFRESH EXITOSO ======');
    
    const datosNuevos = respuesta.data;

    if (!datosNuevos.token || typeof datosNuevos.token !== 'string') {
      throw new Error('El token de acceso recibido no es válido o está vacío.');
    }

    const distritoString = datosNuevos.distrito !== null ? String(datosNuevos.distrito) : '';

    await SecureStore.setItemAsync('accessToken', datosNuevos.token);
    await SecureStore.setItemAsync('refreshToken', datosNuevos.refreshToken);
    await SecureStore.setItemAsync('idPersona', String(datosNuevos.idPersona));
    await SecureStore.setItemAsync('userRoles', JSON.stringify(datosNuevos.roles));
    await SecureStore.setItemAsync('userName', datosNuevos.nombre || '');
    await SecureStore.setItemAsync('userDistrito', distritoString);
    await SecureStore.setItemAsync('userTieneDireccion', String(datosNuevos.tieneDireccion));

    DeviceEventEmitter.emit('TOKEN_REFRESCADO', {
      token: datosNuevos.token,
      refreshToken: datosNuevos.refreshToken,
      idPersona: datosNuevos.idPersona,
      nombre: datosNuevos.nombre,
      roles: datosNuevos.roles,
      distrito: datosNuevos.distrito,
      tieneDireccion: datosNuevos.tieneDireccion,
    });

    return datosNuevos.token;
  } catch (error) {
    console.log('====== ❌ ERROR AL REFRESCAR TOKEN ======', error);
    return null;
  }
};

// =========================================================================
// INTERCEPTOR DE PETICIÓN (Request)
// =========================================================================
api.interceptors.request.use(
  async (config: any) => {
    // Si la petición es un reintento del interceptor de errores, no modificamos nada
    if (config._isRetry) {
      return config;
    }

    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        config.headers = config.headers || {};
        if (typeof config.headers.set === 'function') {
          config.headers.set('Authorization', `Bearer ${token}`);
        } else {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.log('====== ⚠️ ERROR OBTENIENDO ACCESS_TOKEN EN PETICIÓN ======', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =========================================================================
// INTERCEPTOR DE RESPUESTA (Response) - MANEJO DE 401 Y 403
// =========================================================================
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    const status = error.response?.status;

    if (!originalRequest || (status !== 401 && status !== 403) || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest._retry = true;
          originalRequest._isRetry = true; 

          // Seteo robusto de cabeceras para solicitudes en cola
          originalRequest.headers = {
            ...originalRequest.headers,
            'Authorization': `Bearer ${token}`
          };
          
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const nuevoToken = await ejecutarRefrescoInterno();
      
      if (!nuevoToken) {
        processQueue(new Error('Sesión expirada'));
        console.log('====== ❌ REFRESH TOKEN NO FUNCIONÓ - DISPARANDO EVENTO ======');
        
        await dispararExpiracion({
          titulo: "Sesión Expirada",
          mensaje: "Tu sesión ha vencido porque no se pudo renovar la autenticación. Por favor, inicia sesión de nuevo."
        });
        
        return Promise.reject(error);
      }

      processQueue(null, nuevoToken);
      
      // Construimos una configuración de cabeceras completamente limpia para evitar errores con AxiosHeaders
      originalRequest._isRetry = true;
      const headersLimpios = {
        ...originalRequest.headers,
        'Authorization': `Bearer ${nuevoToken}`
      };
      
      // Si Axios empaquetó headers en formato interno, los aplanamos
      if (originalRequest.headers && typeof originalRequest.headers.toJSON === 'function') {
        originalRequest.headers = {
          ...originalRequest.headers.toJSON(),
          'Authorization': `Bearer ${nuevoToken}`
        };
      } else {
        originalRequest.headers = headersLimpios;
      }
      
         console.log('====== 🚀 REINTENDANDO PETICIÓN ORIGINAL CON CABECERA FORZADA ======');
      console.log('Authorization enviada:', originalRequest.headers['Authorization'] || originalRequest.headers['authorization']);
      
      // 👇 AGREGA ESTO AQUÍ, justo antes del return api(originalRequest);
      console.log('====== 🔍 DEBUG PETICIÓN COMPLETA ======');
      console.log('URL:', originalRequest.url);
      console.log('BaseURL:', originalRequest.baseURL);
      console.log('Method:', originalRequest.method);
      console.log('Headers:', JSON.stringify(originalRequest.headers));
      console.log('Data:', originalRequest.data);
      
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      
      await dispararExpiracion({
        titulo: "Error de Conexión",
        mensaje: "No se pudo verificar tu sesión. Por favor, ingresa tus credenciales nuevamente."
      });
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);