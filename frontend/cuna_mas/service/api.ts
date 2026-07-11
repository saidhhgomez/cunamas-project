// services/api.ts
import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { refrescarTokenService } from './authService'; // 👈 Importamos tu función de refresco

const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8080/api';
  }
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

// 🔒 1. Interceptor de Petición: Inyecta el Access Token automáticamente
api.interceptors.request.use(
  async (config) => {
    try {
      // 💡 Cambié 'userToken' a 'accessToken' para que coincida con tu authService
      const token = await SecureStore.getItemAsync('accessToken');
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

// 🔄 2. 🌟 NUEVO Interceptor de Respuesta: Atrapa el error 401 y refresca el token automáticamente
api.interceptors.response.use(
  (response) => response, // Si la respuesta es exitosa (200, 201), pasa de largo con éxito
  async (error) => {
    const originalRequest = error.config;

    // Si el servidor responde 401 (No autorizado) y no hemos reintentado ya esta misma petición
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Marcamos la petición para no caer en bucles infinitos si falla el refresh

      try {
        // 🔄 Invocamos el servicio que maneja el endpoint /auth/refresh
        const nuevoToken = await refrescarTokenService();

        if (nuevoToken) {
          // Si obtuvimos un nuevo token con éxito, parchamos la cabecera de la petición original
          originalRequest.headers.Authorization = `Bearer ${nuevoToken}`;
          
          // Reejecutamos la petición fallida usando la instancia 'api' modificada
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("No se pudo reintentar la petición tras refrescar el token:", refreshError);
      }
      
      // Si `nuevoToken` fue null, significa que el refresh token también expiró o no existía.
      // Aquí el authService ya limpió el SecureStore, por lo que puedes lanzar un evento global,
      // un redireccionamiento al Login o dejar que el estado de tu app detecte la sesión vacía.
    }

    // Si es cualquier otro tipo de error (400, 404, 500, etc.), lo pasamos al catch del servicio que lo llamó
    return Promise.reject(error);
  }
);