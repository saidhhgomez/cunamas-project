// context/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginService, cerrarSesionService } from '../service/authService'; // 👈 Importamos cerrarSesionService

interface UserSession {
  token: string;
  refreshToken: string;
  idPersona: number;
  nombre: string;
  roles: string[]; 
  distrito: string | null;
}

interface AuthContextType {
  user: UserSession | null;
  login: (numeroDocumento: string, contrasena: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 1. Restaurar Sesión al abrir la app
  useEffect(() => {
    const checkPersistedUser = async () => {
      try {
        // 🌟 CORREGIDO: Ahora busca 'accessToken' en sincronía con tu api.ts
        const token = await SecureStore.getItemAsync('accessToken');
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        const idPersona = await SecureStore.getItemAsync('idPersona');
        const roles = await SecureStore.getItemAsync('userRoles');
        const distrito = await SecureStore.getItemAsync('userDistrito');
        const nombre = await SecureStore.getItemAsync('userName');

        if (token && refreshToken && idPersona && roles && nombre) {
          setUser({
            token,
            refreshToken,
            idPersona: Number(idPersona),
            nombre,
            roles: JSON.parse(roles),
            distrito: distrito || null,
          });
        }
      } catch (error) {
        console.error('Error al restaurar la sesión:', error);
      } finally {
        setIsLoading(false);
      }
    };
    checkPersistedUser();
  }, []);

  // 🚀 2. Login REAL conectado a tu API
  const login = async (numeroDocumento: string, contrasena: string) => {
    setIsLoading(true);
    try {
      const datosAPI = await loginService(numeroDocumento, contrasena);

      // 🌟 CORREGIDO: Guardamos físicamente como 'accessToken' para que el interceptor de Axios lo detecte
      await SecureStore.setItemAsync('accessToken', datosAPI.token);
      await SecureStore.setItemAsync('refreshToken', datosAPI.refreshToken);
      await SecureStore.setItemAsync('idPersona', String(datosAPI.idPersona));
      await SecureStore.setItemAsync('userRoles', JSON.stringify(datosAPI.roles));
      await SecureStore.setItemAsync('userName', datosAPI.nombre || '');
      await SecureStore.setItemAsync('userDistrito', datosAPI.distrito || '');

      setUser({
        token: datosAPI.token,
        refreshToken: datosAPI.refreshToken,
        idPersona: datosAPI.idPersona,
        nombre: datosAPI.nombre,
        roles: datosAPI.roles,
        distrito: datosAPI.distrito || null,
      });

    } catch (error: any) {
      const mensaje = error.response?.data?.message || 'No se pudo iniciar sesión. Verifica tu red o datos.';
      throw new Error(mensaje);
    } finally {
      setIsLoading(false);
    }
  };

  // 🚪 3. Logout Real
  const logout = async () => {
    setIsLoading(true);
    try {
      // 🌟 CORREGIDO: Delegamos el logout a tu servicio. Él se encarga de avisar al backend 
      // vía POST /auth/logout y de borrar los tokens ('accessToken' y 'refreshToken') del celular.
      await cerrarSesionService();

      // Borramos el resto de datos secundarios que guardaba este contexto
      await SecureStore.deleteItemAsync('idPersona');
      await SecureStore.deleteItemAsync('userRoles');
      await SecureStore.deleteItemAsync('userDistrito');
      await SecureStore.deleteItemAsync('userName');
      
      setUser(null);
    } catch (error) {
      console.error('Error al limpiar la sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  return context;
}