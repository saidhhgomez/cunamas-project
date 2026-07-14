import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { refrescarTokenService } from './authService';

const getBaseUrl = () => (Platform.OS === 'web' ? 'http://localhost:8080/api' : 'http://192.168.137.1:8080/api');

export const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

// Variables para gestionar la cola de refresco
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// 1. Interceptor de Petición
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 2. Interceptor de Respuesta
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Si el error no es 401, simplemente lo rechazamos
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Si ya hay un refresco en curso, añadimos esta petición a la cola
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const nuevoToken = await refrescarTokenService();
      
      if (!nuevoToken) {
        // El refresco falló, probablemente el refresh token también expiró
        processQueue(new Error('Sesión expirada'));
        // Aquí podrías disparar un evento para cerrar sesión globalmente
        return Promise.reject(error);
      }

      // Éxito: refrescamos la cola y reintentamos la petición original
      processQueue(null, nuevoToken);
      if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${nuevoToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);