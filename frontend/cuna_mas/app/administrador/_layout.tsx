// app/administrador/_layout.tsx
import React from 'react';
import { Stack, Redirect } from 'expo-router'; 
import { useAuth } from '../../context/AuthContext'; 

export default function AdministradorLayout() {
  const { user } = useAuth();

  // 🚨 CANDADO DE SEGURIDAD EXCLUSIVO PARA ADMINISTRADOR
if (!user || !(
  user.roles.includes('Asistente Técnico (AT)') || 
  user.roles.includes('Experta en Nutrición')
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
      <Stack.Screen name="inicio" />

      {/* 🔑 Segunda Pantalla: Detalle y Asignación de Roles por ID */}
      <Stack.Screen name="aprobacion" />

            {/* 🔑 Segunda Pantalla: Detalle y Asignación de Roles por ID */}
      <Stack.Screen name="consultas" />

            <Stack.Screen name="consultasLocales" />

      <Stack.Screen name="consultasModulo" />
      <Stack.Screen name="resumen" />
      <Stack.Screen name="agregarservicioA" />
      <Stack.Screen name="agregarCentro" />
      <Stack.Screen name="agregarLocal" />
      <Stack.Screen name="agregarModulo" />
            <Stack.Screen name="calculadora" />






    </Stack>
  );
}