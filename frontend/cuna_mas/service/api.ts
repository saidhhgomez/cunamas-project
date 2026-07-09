// services/api.ts
import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store'; // 🌟 Para leer el token automáticamente en cada petición

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8080/api';
  }
  // 💡 REEMPLAZA '192.168.1.X' por la IP local real de tu computadora
  return 'http://192.168.18.233:8080/api'; 
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 🔒 Interceptor: Inyecta el Token JWT de manera automática si el usuario ya inició sesión
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error al recuperar el token en el interceptor:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);