// services/authService.ts
import { api } from './api'; 
import * as Device from 'expo-device'; 
import * as SecureStore from 'expo-secure-store'; 

// --- Interfaces Existentes ---
interface LoginResponse {
  token: string;
  refreshToken: string;
  idPersona: number;
  nombre: string;
  roles: string[]; 
  distrito: string | null;
  tieneDireccion: boolean; 
}

export interface RegisterPayload {
  persona: {
    idDocumento: number;     
    numeroDocumento: string; 
    nombres: string;
    appPaterno: string;      
    apMaterno: string;
    idGenero: number;        
  };
  cuenta: {
    correoElectronico: string;
    password: string;
  };
}

/**
 * Servicio de Autenticación - Cuna Más
 */

// 🚪 Petición de Login
export const loginService = async (numeroDocumento: string, password: string): Promise<LoginResponse> => {
  const nombreDispositivo = Device.modelName || `${Device.brand} ${Device.designName}` || 'Dispositivo Móvil';
  const uuidDispositivo = Device.osBuildId || 'dev-react-native-uuid';

  const payload = {
    numeroDocumento: numeroDocumento.trim(),
    password: password,
    dispositivo: {
      nombreDispositivo,
      uuidDispositivo,
    },
  };

  console.log('====== 🚀 ENVIANDO LOGIN ======');
  try {
    const respuesta = await api.post<LoginResponse>('/auth/login', payload);
    return respuesta.data; 
  } catch (error) {
    console.log('====== ❌ ERROR LOGIN ======', error);
    throw error;
  }
};

// 🚪 Cierra la sesión de manera segura tanto en el backend como en el dispositivo
export const cerrarSesionService = async (): Promise<boolean> => { 
  try {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');

    if (refreshToken) {
      console.log('====== 🚀 ENVIANDO LOGOUT (POST /auth/logout) ======');
      await api.post('/auth/logout', {
        refreshToken: refreshToken
      });
      console.log('Sesión invalidada con éxito en el servidor.');
    }
  } catch (error) {
    console.warn('El servidor no pudo procesar el logout o el token ya era inválido:', error);
  } finally {
    // Limpieza absoluta de almacenamiento local
    await SecureStore.deleteItemAsync('accessToken'); 
    await SecureStore.deleteItemAsync('refreshToken');
    console.log('Tokens borrados del almacenamiento local.');
  }
  
  return true;
};

// 📝 Petición de Registro Real (POST /auth/register)
export const registerService = async (datosRegistro: RegisterPayload): Promise<any> => { 
  if (datosRegistro.persona?.numeroDocumento) {
    datosRegistro.persona.numeroDocumento = datosRegistro.persona.numeroDocumento.trim();
  }

  console.log('====== 🚀 ENVIANDO REGISTRO ======');
  try {
    const respuesta = await api.post('/auth/register', datosRegistro);
    return respuesta.data;
  } catch (error: any) {
    console.log('====== ❌ ERROR EN REGISTRO ======');
    throw error;
  }
};