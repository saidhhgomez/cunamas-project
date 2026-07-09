// app/index.tsx
import React from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { useAuth } from '../context/AuthContext'; 

import LoginScreen from './auth/login'; 
import InicioCuidadora from './cuidadora/inicio';
import ServicioAlimentarioScreen from './asistente/index'; 
import InicioAdministrador from './administrador/inicio'; // Por si usas admin

export default function IndexScreen() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00AEEF" />
        <Text style={styles.text}>Cargando Cuna Más...</Text>
      </View>
    );
  }

  // Si no hay sesión, directo al Login
  if (!user) {
    return <LoginScreen />;
  }

  // 🌟 ADAPTACIÓN CON LOS ROLES REALES DE TU POSTMAN
  
  // 1. Validamos Administrador del Sistema
  if (user.roles.includes('Administrador') || user.roles.includes('ADMINISTRADOR SISTEMA')) {
    return <InicioAdministrador />;
  }

  // 2. Validamos Cuidadora
  if (user.roles.includes('Cuidadora')) {
    return <InicioCuidadora />;
  }

  // 3. Validamos Asistente Técnico mediante el string real de tu Postman
  if (user.roles.includes('Asistente Técnico (AT)')) {
    return <InicioAdministrador />;
  }

  // Si tiene un token válido pero el rol es desconocido
  return <LoginScreen />;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  text: { marginTop: 15, fontSize: 16, color: '#00AEEF', fontWeight: '600', textAlign: 'center' },
});