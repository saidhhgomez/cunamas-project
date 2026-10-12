// app/administrador/_layout.tsx
import React, { useEffect } from 'react';
import { Stack, Redirect } from 'expo-router';
import { BackHandler } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function AdministradorLayout() {
  const { user } = useAuth();

  // 🔒 Bloqueo del botón de retroceso físico/gesto en toda esta sección
  useEffect(() => {
    const onBackPress = () => {
      return true; // bloquea el comportamiento por defecto
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );

    return () => subscription.remove();
  }, []);

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
        headerShown: false,
        headerTintColor: '#006080',
        headerTitleStyle: { fontWeight: '700' },
        gestureEnabled: false, // 🔒 bloquea el swipe-back en iOS
      }}
    >
      {/* 👥 Primera Pantalla: Lista de usuarios en estado Pendiente */}
      <Stack.Screen name="inicio" />

      {/* 🔑 Segunda Pantalla: Detalle y Asignación de Roles por ID */}
      <Stack.Screen name="aprobacion" />

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