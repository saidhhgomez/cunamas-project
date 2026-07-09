// app/administrador/inicio.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function InicioAdministrador() {
  const { user, logout } = useAuth();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.roleTag}>Rol: Administrador Sistema</Text>
      <Text style={styles.welcome}>Bienvenido, {user?.nombre || 'Admin'}</Text>
      <Text style={styles.subtitle}>Consola de Control Central de Cuna Más</Text>

      {/* Grid de Accesos Rápidos Simulados */}
      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => alert('Módulo de Gestión de Usuarios')}>
          <Text style={styles.cardIcon}>👥</Text>
          <Text style={styles.cardTitle}>Usuarios</Text>
          <Text style={styles.cardDesc}>Cuidadoras y Asistentes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => alert('Módulo de Locales y Comités')}>
          <Text style={styles.cardIcon}>🏠</Text>
          <Text style={styles.cardTitle}>Locales CIAI</Text>
          <Text style={styles.cardDesc}>Estructuras e infraestructura</Text>
        </TouchableOpacity>
      </View>

      {/* Botón de salida */}
      <TouchableOpacity style={styles.buttonLogout} onPress={logout}>
        <Text style={styles.buttonText}>Cerrar Sesión Segura</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F8FAFC', padding: 20, alignItems: 'center', justifyContent: 'center' },
  roleTag: { fontSize: 13, fontWeight: 'bold', color: '#D97706', backgroundColor: '#FEF3C7', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginBottom: 15 },
  welcome: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', textAlign: 'center' },
  subtitle: { fontSize: 15, color: '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 35 },
  
  grid: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  card: { backgroundColor: '#FFF', width: '47%', padding: 20, borderRadius: 16, borderBottomWidth: 4, borderBottomColor: '#D97706', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardIcon: { fontSize: 30, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  cardDesc: { fontSize: 12, color: '#94A3B8', marginTop: 4 },

  buttonLogout: { backgroundColor: '#1E293B', paddingVertical: 14, borderRadius: 12, width: '100%', alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' }
});