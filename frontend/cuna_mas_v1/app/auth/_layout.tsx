import { Stack } from 'expo-router';
// 🌟 IMPORTANTE: Importamos el proveedor de área segura
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function AuthLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        {/* No es obligatorio declarar "registro" aquí si mantienes el headerShown: false general, 
            pero el SafeAreaProvider arriba es lo que activa la magia */}
      </Stack>
    </SafeAreaProvider>
  );
}