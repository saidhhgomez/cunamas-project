// app/cuidadora/_layout.tsx
import React from 'react';
import { Tabs, Redirect } from 'expo-router'; 
import { useAuth } from '../../context/AuthContext'; 

export default function CuidadoraLayout() {
  const { user } = useAuth();

  // 🚨 SEGURIDAD: Si un asistente intenta forzar la entrada a una sub-pantalla de cuidadora, lo rebota
  if (!user || !user.roles.includes('Madre Guía')  || !user.roles.includes('Madre Guía') || 
  !user.roles.includes('Madre Cuidadora') ||
  !user.roles.includes('Socia de Cocina Tipo 2') ||
  !user.roles.includes('Socia de Cocina Tipo 1') ) {
    return <Redirect href={user?.roles.includes('asistente') ? "/asistente/inicio" : "/auth/login"} />;
  }

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={() => null}>
      <Tabs.Screen name="inicio" />
      <Tabs.Screen name="categoriaCalculadora" />
      <Tabs.Screen name="locales" />
      <Tabs.Screen name="modulo" />
      <Tabs.Screen name="control_lista" />
    </Tabs>
  );
}