import { Tabs, useRouter } from 'expo-router'; 
import { Home, User, LogOut, ArrowLeft } from 'lucide-react-native';
import { View, Text, useWindowDimensions, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useAuth } from '../../context/AuthContext'; 

export default function CuidadoraLayout() {
return (
    <Tabs
      screenOptions={{
        headerShown: false, // Quitamos cualquier header por defecto
      }}
      // Ocultamos completamente la barra de pestañas nativa 
      // para que cada pantalla dibuje sus propios botones abajo si quiere
      tabBar={() => null} 
    >
      <Tabs.Screen name="inicio" />
      <Tabs.Screen name="categoriaCalculadora" />
      <Tabs.Screen name="locales" />
      <Tabs.Screen name="modulo" />
      <Tabs.Screen name="control_lista" />
    </Tabs>
  );
}