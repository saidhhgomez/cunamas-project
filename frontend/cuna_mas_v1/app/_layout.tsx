// app/_layout.tsx
import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { Slot, useRouter } from 'expo-router'; 
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/AuthContext';

function RootLayoutProtected() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Evitamos acciones mientras valida el token

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

  return <Slot />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutProtected />
      </AuthProvider>
    </SafeAreaProvider>
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