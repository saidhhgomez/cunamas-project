// services/authService.ts
import { api } from './api'; 
import * as Device from 'expo-device'; 

// --- Interfaces para el Login (Existentes) ---
interface LoginResponse {
  token: string;
  refreshToken: string;
  idPersona: number;
  nombre: string;
  roles: string[]; 
  distrito: string | null;
}

// --- 🌟 Nuevas Interfaces para el Registro (POST /auth/register) ---
export interface RegisterPayload {
  persona: {
    idDocumento: number;     // ID del tipo de documento (DNI generalmente es 1)
    numeroDocumento: string; // El número de DNI ingresado
    nombres: string;
    appPaterno: string;
    apMaterno: string;
    idGenero: number;        // ID numérico del género
  };
  cuenta: {
    correoElectronico: string;
    password: string;
  };
}

/**
 * Servicio de Autenticación - Cuna Más
 */

// 🚪 Petición de Login (Existente)
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
  console.log(JSON.stringify(payload, null, 2));

  try {
    const respuesta = await api.post<LoginResponse>('/auth/login', payload);
    console.log('====== 📥 RESPUESTA LOGIN ======');
    console.log(JSON.stringify(respuesta.data, null, 2));
    return respuesta.data; 
  } catch (error) {
    console.log('====== ❌ ERROR LOGIN ======', error);
    throw error;
  }
};

// 📝 Petición de Registro Real (POST /auth/register)
export const registerService = async (datosRegistro: RegisterPayload): Promise<void> => {
  
  // Limpiamos espacios innecesarios antes de enviar el DNI
  if (datosRegistro.persona?.numeroDocumento) {
    datosRegistro.persona.numeroDocumento = datosRegistro.persona.numeroDocumento.trim();
  }

  console.log('====== 🚀 ENVIANDO REGISTRO (POST /auth/register) ======');
  console.log(JSON.stringify(datosRegistro, null, 2));

  try {
    const respuesta = await api.post('/auth/register', datosRegistro);
    
    console.log('====== 📥 REGISTRO EXITOSO ======');
    console.log(JSON.stringify(respuesta.data, null, 2));
    
    return respuesta.data;
} catch (error: any) {
    console.log('====== ❌ ERROR EN REGISTRO ======');
    if (error.response) {
      // 🌟 Imprimimos el código de estado (ej: 500, 400) para saber qué pasa
      console.log('Código Estado HTTP:', error.response.status);
      
      // 🌟 Imprimimos el objeto completo sin formatear por si viene un string plano
      console.log('Detalle crudo:', error.response.data);
    } else if (error.request) {
      console.log('El servidor no respondió nada (Request sent, no response)');
    } else {
      console.log('Error al configurar la petición:', error.message);
    }
    throw error;
  }
};