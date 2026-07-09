// app/_layout.tsx
import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { Slot, useRouter } from 'expo-router'; 
import { AuthProvider, useAuth } from '../context/AuthContext';

function RootLayoutProtected() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Evitamos acciones mientras valida el token

    // Si el usuario da click en cerrar sesión o se vence el token, 
    // el layout detecta que 'user' es null y lo expulsa al login de inmediato
    if (!user) {
      router.replace('/auth/login');
    }
  }, [user, isLoading]); 

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00AEEF" />
        <Text style={styles.text}>Cargando Cuna Más...</Text>
      </View>
    );
  }

  // Renderiza el árbol de vistas (donde tu index.tsx tomará el control principal)
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