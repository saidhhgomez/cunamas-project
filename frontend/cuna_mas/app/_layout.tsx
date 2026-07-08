import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { Slot, useRouter } from 'expo-router'; 
import { AuthProvider, useAuth } from '../context/AuthContext';

function RootLayoutProtected() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // 1. El useEffect SIEMPRE en el nivel superior
  useEffect(() => {
    if (isLoading) return; // Evitamos acciones mientras valida el token/sesión

    // 🌟 Truco de sincronización: Usamos un micro-timeout para asegurar
    // que Expo Router haya montado completamente la vista antes de redirigir.
    const timer = setTimeout(() => {
      if (!user) {
        // Si no hay sesión, va al login
        router.replace('/auth/login');
      } else {
        // Redirección inicial según el rol del usuario
        if (user.rol === 'cuidadora') {
          router.replace('/cuidadora/inicio');
        } else if (user.rol === 'asistente') {
          router.replace('/asistente');
        }
      }
    }, 0);

    return () => clearTimeout(timer); // Limpieza de timer
  }, [user, isLoading]); 

  // 2. Retorno condicional de UI de carga (después de los Hooks)
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00AEEF" />
        <Text style={styles.text}>Cargando Cuna Más...</Text>
      </View>
    );
  }

  // 3. Renderiza las pantallas hijas de las carpetas internas
  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutProtected />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  text: {
    marginTop: 15,
    fontSize: 16,
    color: '#00AEEF',
    fontWeight: '600',
  },
});