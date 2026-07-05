import axios from 'axios';
import { Platform } from 'react-native';

// 🚀 Configuración dinámica de la IP para desarrollo
// - En Web: Usa localhost directamente.
// - En Android/iOS: Debe usar la IP local de tu PC para que el celular se conecte.
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8080/api';
  }
  // 💡 REEMPLAZA '192.168.1.X' por la IP local real de tu computadora
  return 'http://192.168.1.X:8080/api'; 
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000, // 10 segundos de espera máxima
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 🔒 Interceptor opcional (Por si más adelante manejas Tokens de autenticación JWT)
api.interceptors.request.use(
  async (config) => {
    // Aquí puedes jalar el token de AsyncStorage e inyectarlo si tu API lo requiere:
    // const token = await AsyncStorage.getItem('userToken');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);