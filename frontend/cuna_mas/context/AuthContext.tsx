import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';



export type UserRole = 'cuidadora' | 'asistente' | null;



interface UserSession {

  dni: string;

  nombre: string;

  rol: UserRole;

}



interface AuthContextType {

  user: UserSession | null;

  login: (dni: string, contrasena: string) => Promise<void>;

  logout: () => void;

  isLoading: boolean;

}



const AuthContext = createContext<AuthContextType | undefined>(undefined);



export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<UserSession | null>(null);

  // 1. 🌟 IMPORTANTE: Iniciamos en true para que el Layout espere a que la app monte correctamente

  const [isLoading, setIsLoading] = useState(true);



  // 2. 🌟 Simulamos la carga inicial del sistema al encender la app

  useEffect(() => {

    const checkPersistedUser = async () => {

      // Simula el tiempo que tarda en leer el almacenamiento

      await new Promise((resolve) => setTimeout(resolve, 500));

      setIsLoading(false);

    };

    checkPersistedUser();

  }, []);



  const login = async (dni: string, contrasena: string) => {

    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);



    if (dni === '11111111') {

      setUser({

        dni: '11111111',

        nombre: 'María Estela (Cuidadora)',

        rol: 'cuidadora',

      });

    } else if (dni === '22222222') {

      setUser({

        dni: '22222222',

        nombre: 'Ing. Carlos Mendoza',

        rol: 'asistente',

      });

    } else {

      throw new Error('El DNI ingresado no está registrado en Cuna Más.');

    }

  };



  const logout = () => {

    setUser(null);

  };



  return (

    <AuthContext.Provider value={{ user, login, logout, isLoading }}>

      {children}

    </AuthContext.Provider>

  );

}



export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {

    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');

  }

  return context;

}