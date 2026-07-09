// app/administrador/_layout.tsx
import React from 'react';
import { Stack, Redirect } from 'expo-router'; 
import { useAuth } from '../../context/AuthContext'; 

export default function AdministradorLayout() {
  const { user } = useAuth();

  // 🚨 CANDADO DE SEGURIDAD EXCLUSIVO PARA ADMINISTRADOR
  if (!user || !user.roles.includes('ADMINISTRADOR SISTEMA')) {
    // Si intenta colarse otro rol, lo rebotamos dinámicamente a su zona
    if (user?.roles.includes('Cuidadora')) return <Redirect href="/cuidadora/inicio" />;
    if (user?.roles.includes('Asistente Técnico (AT)')) return <Redirect href="/asistente/inicio" />;
    return <Redirect href="/auth/login" />;
  }

  // Si pasa el filtro, le damos acceso al Stack de administración
  return (
    <Stack 
      screenOptions={{ 
        headerShown: true, 
        headerTintColor: '#D97706',
        headerTitleStyle: { fontWeight: '700' }
      }}
    >
      <Stack.Screen name="inicio" options={{ title: 'Panel Central 👑' }} />
      {/* Registra aquí abajo más sub-pantallas administrativas si las necesitas */}
    </Stack>
  );
}