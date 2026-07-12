// context/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginService, cerrarSesionService } from '../service/authService';

interface UserSession {
  token: string;
  refreshToken: string;
  idPersona: number;
  nombre: string;
  roles: string[]; 
  distrito: string | null;
  tieneDireccion: boolean; // 👈 Registrado correctamente en la interfaz
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
        const token = await SecureStore.getItemAsync('accessToken');
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        const idPersona = await SecureStore.getItemAsync('idPersona');
        const roles = await SecureStore.getItemAsync('userRoles');
        const nombre = await SecureStore.getItemAsync('userName');
        const distrito = await SecureStore.getItemAsync('userDistrito');
        const tieneDireccion = await SecureStore.getItemAsync('userTieneDireccion');

        if (token && refreshToken && idPersona && roles && nombre) {
          setUser({
            token,
            refreshToken,
            idPersona: Number(idPersona),
            nombre,
            roles: JSON.parse(roles),
            // Si en SecureStore se guardó un string vacío o la palabra "null", lo restauramos como null real
            distrito: (distrito === '' || distrito === 'null') ? null : distrito,
            // Recuperamos el booleano (si es el string "true" será true, de lo contrario false)
            tieneDireccion: tieneDireccion === 'true',
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

      // 🛠️ Tratamiento preventivo para el distrito si viene null de tu servidor
      const distritoString = datosAPI.distrito !== null ? String(datosAPI.distrito) : '';

      // 🌟 Guardamos todos los datos físicamente en el SecureStore como Strings
      await SecureStore.setItemAsync('accessToken', datosAPI.token);
      await SecureStore.setItemAsync('refreshToken', datosAPI.refreshToken);
      await SecureStore.setItemAsync('idPersona', String(datosAPI.idPersona));
      await SecureStore.setItemAsync('userRoles', JSON.stringify(datosAPI.roles));
      await SecureStore.setItemAsync('userName', datosAPI.nombre || '');
      await SecureStore.setItemAsync('userDistrito', distritoString);
      await SecureStore.setItemAsync('userTieneDireccion', String(datosAPI.tieneDireccion)); // Guardará "true" o "false"

      // Actualizamos el estado global de la sesión
      setUser({
        token: datosAPI.token,
        refreshToken: datosAPI.refreshToken,
        idPersona: datosAPI.idPersona,
        nombre: datosAPI.nombre,
        roles: datosAPI.roles,
        distrito: datosAPI.distrito || null, // Guardamos null real en el estado de memoria de JS
        tieneDireccion: datosAPI.tieneDireccion,
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
      // Avisa al backend y remueve 'accessToken' y 'refreshToken'
      await cerrarSesionService();

      // Borramos el resto de datos secundarios del almacenamiento del celular
      await SecureStore.deleteItemAsync('idPersona');
      await SecureStore.deleteItemAsync('userRoles');
      await SecureStore.deleteItemAsync('userDistrito');
      await SecureStore.deleteItemAsync('userName');
      await SecureStore.deleteItemAsync('userTieneDireccion'); // 👈 Limpieza del nuevo campo
      
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