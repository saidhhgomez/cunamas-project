// services/api.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform, DeviceEventEmitter } from 'react-native'; // 🌟 Importamos DeviceEventEmitter
import * as SecureStore from 'expo-secure-store';

interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
}

const getBaseUrl = () => 
  Platform.OS === 'web' ? 'https://cunamas-project.onrender.com/api' : 'https://cunamas-project.onrender.com/api';

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

let isRefreshing = false;
let failedQueue: any[] = [];

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
    const { accessToken, refreshToken: nuevoRefreshToken } = respuesta.data;

    await SecureStore.setItemAsync('accessToken', accessToken);
    if (nuevoRefreshToken) {
      await SecureStore.setItemAsync('refreshToken', nuevoRefreshToken);
    }

    return accessToken;
  } catch (error) {
    console.log('====== ❌ ERROR AL REFRESCAR TOKEN ======', error);
    return null;
  }
};

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Respuesta con Emisión de Eventos
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    // 🔴 CASO 1: El servidor responde directamente con 403 (Sesión inválida / Sin permisos)
    if (status === 403) {
      console.log('====== 🔒 ACCESO PROHIBIDO (403) - DISPARANDO EVENTO ======');
      
      DeviceEventEmitter.emit('EXPIRAR_SESION_GLOBAL', {
        titulo: "Sesión Vencida",
        mensaje: "Tu sesión de administrador no es válida o ha caducado. Por favor, vuelve a iniciar sesión."
      });

      return Promise.reject(error);
    }

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const nuevoToken = await ejecutarRefrescoInterno();
      
      // 🔴 CASO 2: El refresh token no funcionó (venció o fue rechazado)
      if (!nuevoToken) {
        processQueue(new Error('Sesión expirada'));
        console.log('====== ❌ REFRESH TOKEN NO FUNCIONÓ - DISPARANDO EVENTO ======');
        
        DeviceEventEmitter.emit('EXPIRAR_SESION_GLOBAL', {
          titulo: "Sesión Expirada",
          mensaje: "Tu sesión ha vencido porque no se pudo renovar la autenticación. Por favor, inicia sesión de nuevo."
        });
        
        return Promise.reject(error);
      }

      processQueue(null, nuevoToken);
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${nuevoToken}`;
      }
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      
      // 🔴 CASO 3: Error de red durante el refresco de sesión
      DeviceEventEmitter.emit('EXPIRAR_SESION_GLOBAL', {
        titulo: "Error de Conexión",
        mensaje: "No se pudo verificar tu sesión. Por favor, ingresa tus credenciales nuevamente."
      });
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);