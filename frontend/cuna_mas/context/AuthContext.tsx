// context/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DeviceEventEmitter, Alert } from 'react-native'; // 🌟 Importamos DeviceEventEmitter y Alert
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router'; // 🌟 Importamos useRouter
import { loginService, cerrarSesionService } from '../service/authService';

interface UserSession {
  token: string;
  refreshToken: string;
  idPersona: number;
  nombre: string;
  roles: string[]; 
  distrito: string | null;
  tieneDireccion: boolean;
}

interface AuthContextType {
  user: UserSession | null;
  login: (numeroDocumento: string, contrasena: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (newData: Partial<UserSession>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter(); // 🌟 Instanciamos el router aquí dentro del ciclo de React

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
            distrito: (distrito === '' || distrito === 'null') ? null : distrito,
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

  // 🌟 ESCUCHADOR GLOBAL DE EXPIRACIÓN DE SESIÓN (Cierre de sesión forzado desde Axios)
  useEffect(() => {
    const logoutLimpiezaLocal = async () => {
      try {
        // Borramos todos los datos del almacenamiento local de inmediato
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('idPersona');
        await SecureStore.deleteItemAsync('userRoles');
        await SecureStore.deleteItemAsync('userDistrito');
        await SecureStore.deleteItemAsync('userName');
        await SecureStore.deleteItemAsync('userTieneDireccion');
      } catch (err) {
        console.error("Error al limpiar persistencia en logout forzado:", err);
      } finally {
        // 🌟 CLAVE: Seteamos el estado de React a null para que los Layouts detecten que ya no hay usuario
        setUser(null);
        router.replace('/(auth)/login');
      }
    };

    const subscripcion = DeviceEventEmitter.addListener('EXPIRAR_SESION_GLOBAL', (data) => {
      Alert.alert(
        data?.titulo || "Sesión Expirada",
        data?.mensaje || "Por favor, vuelve a iniciar sesión.",
        [{ text: "Entendido", onPress: () => logoutLimpiezaLocal() }],
        { cancelable: false }
      );
    });

    return () => subscripcion.remove();
  }, []);

  // ... (Tu código existente de updateUser, login y logout permanece igual)
  const updateUser = async (newData: Partial<UserSession>) => {
    if (!user) return;
    const updatedUser = { ...user, ...newData };
    if (newData.tieneDireccion !== undefined) {
      await SecureStore.setItemAsync('userTieneDireccion', String(newData.tieneDireccion));
    }
    if (newData.distrito !== undefined) {
      await SecureStore.setItemAsync('userDistrito', newData.distrito || '');
    }
    setUser(updatedUser);
  };

  const login = async (numeroDocumento: string, contrasena: string) => {
    setIsLoading(true);
    try {
      const datosAPI = await loginService(numeroDocumento, contrasena);
      const distritoString = datosAPI.distrito !== null ? String(datosAPI.distrito) : '';

      await SecureStore.setItemAsync('accessToken', datosAPI.token);
      await SecureStore.setItemAsync('refreshToken', datosAPI.refreshToken);
      await SecureStore.setItemAsync('idPersona', String(datosAPI.idPersona));
      await SecureStore.setItemAsync('userRoles', JSON.stringify(datosAPI.roles));
      await SecureStore.setItemAsync('userName', datosAPI.nombre || '');
      await SecureStore.setItemAsync('userDistrito', distritoString);
      await SecureStore.setItemAsync('userTieneDireccion', String(datosAPI.tieneDireccion));

      setUser({
        token: datosAPI.token,
        refreshToken: datosAPI.refreshToken,
        idPersona: datosAPI.idPersona,
        nombre: datosAPI.nombre,
        roles: datosAPI.roles,
        distrito: datosAPI.distrito || null,
        tieneDireccion: datosAPI.tieneDireccion,
      });
    } catch (error: any) {
      const mensaje = error.response?.data?.message || 'No se pudo iniciar sesión. Verifica tu red o datos.';
      throw new Error(mensaje);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await cerrarSesionService();
      await SecureStore.deleteItemAsync('idPersona');
      await SecureStore.deleteItemAsync('userRoles');
      await SecureStore.deleteItemAsync('userDistrito');
      await SecureStore.deleteItemAsync('userName');
      await SecureStore.deleteItemAsync('userTieneDireccion');
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      
      setUser(null);
    } catch (error) {
      console.error('Error al limpiar la sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  return context;
}