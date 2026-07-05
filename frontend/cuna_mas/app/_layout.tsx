import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { Slot, useRouter } from 'expo-router'; 
import { AuthProvider, useAuth } from '../context/AuthContext';

function RootLayoutProtected() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // 1. Mientras lee el AsyncStorage, muestra el Spinner de carga
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00AEEF" />
        <Text style={styles.text}>Cargando Cuna Más...</Text>
      </View>
    );
  }

  // 2. Control de Roles y Redirección en un useEffect (Evita el bucle infinito)
  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // Si no hay sesión, al login
      router.replace('/auth/login');
    } else {
      // Redirección inicial única según el rol
      if (user.rol === 'cuidadora') {
        router.replace('/cuidadora/inicio');
      } else if (user.rol === 'asistente') {
        router.replace('/asistente');
      }
    }
  }, [user, isLoading]); // 💡 Solo se ejecuta cuando el usuario cambia o inicia sesión

  // 3. Renderiza el contenedor nativo para que 'router.push' funcione sin problemas
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