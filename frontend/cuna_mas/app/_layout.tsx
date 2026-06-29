import { Slot } from 'expo-router';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';
// Importamos tus componentes de pantalla directamente
import LoginScreen from './auth/login'; 
import InicioCuidadora from './cuidadora/inicio';

function RootLayoutProtected() {
  const { user, isLoading } = useAuth();

  // 1. Mientras lee el AsyncStorage del celular, se queda aquí quieto
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#00AEEF" />
        <Text style={styles.text}>Cargando Cuna Más...</Text>
      </View>
    );
  }

  // 2. Control de flujo directo (Sin rutas dinámicas ni vigilantes de posición)
  if (!user) {
    return <LoginScreen />;
  }

  if (user.rol === 'cuidadora') {
    return <InicioCuidadora />;
  }



  // Respaldo por si el usuario no tiene un rol válido
  return <LoginScreen />;
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