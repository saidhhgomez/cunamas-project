
  // app/administrador/_layout.tsx
import React from 'react';
import { Stack, Redirect } from 'expo-router'; 
import { useAuth } from '../../context/AuthContext'; 

export default function AdministradorLayout() {
  const { user } = useAuth();

  // 🚨 CANDADO DE SEGURIDAD EXCLUSIVO PARA ADMINISTRADOR
if (!user || !(
  user.roles.includes('Socia de Cocina Tipo 1') || 
  user.roles.includes('Socia de Cocina Tipo 2')
)) {
  return <Redirect href="/auth/login" />;
}




  // Si pasa el filtro, le damos acceso al Stack de administración
  return (
    <Stack 
      screenOptions={{ 
        // ✅ Cambiado a false para usar tus cabeceras personalizadas y evitar doble barra superior
        headerShown: false, 
        headerTintColor: '#006080',
        headerTitleStyle: { fontWeight: '700' }
      }}
    >

      {/* 👥 Primera Pantalla: Lista de usuarios en estado Pendiente */}
      <Stack.Screen name="index" />
      <Stack.Screen name="calculadora/calculadoraDosificadora" />
      <Stack.Screen name="servicioAlimentario" />
      <Stack.Screen name="resumenIA" />
    </Stack>
  );
}
  
  

