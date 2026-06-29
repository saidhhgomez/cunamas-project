import React from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { useAuth } from '../context/AuthContext'; 
// Importamos tus pantallas directamente (Ajusta las rutas de las carpetas si es necesario)
import LoginScreen from './auth/login'; 
import InicioCuidadora from './cuidadora/inicio';

export default function IndexScreen() {
  const { user, isLoading } = useAuth();

  // 1. Mientras revisa el AsyncStorage del celular, muestra la carga
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00AEEF" />
        <Text style={styles.text}>Cargando Cuna Más...</Text>
      </View>
    );
  }

  // 2. Control de pantallas directo sin redirecciones complejas
  if (!user) {
    return <LoginScreen />;
  }

  if (user.rol === 'cuidadora') {
    return <InicioCuidadora />;
  }

  // Retorno seguro por defecto en caso de que no tenga rol asignado
  return <LoginScreen />;
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