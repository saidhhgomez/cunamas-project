import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  useWindowDimensions 
} from 'react-native';
import { useAuth } from '../../context/AuthContext'; 
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // 🌟 Estado para controlar la visibilidad de la contraseña
  const [securePassword, setSecurePassword] = useState(true);
  
  const { login } = useAuth();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets(); 
  
  const esPantallaGrande = width > 600;
  const tamañoLogo = esPantallaGrande ? 260 : width * 0.55; 

  const handleIngresar = async () => {
    if (!dni || !password) {
      Alert.alert('Error', 'Por favor, complete todos los campos');
      return;
    }

    setLoading(true);
    try {
      // 🚀 .trim() para evitar los espacios fantasmas que causaban el error de login simulado
      await login(dni.trim(), password.trim());
    } catch (error: any) {
      Alert.alert('Error de Inicio de Sesión', error.message || 'DNI o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} 
        style={styles.flexible}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 16) } 
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.mainContent, esPantallaGrande && styles.formMaxWith]}>
            
            {/* Logo Central */}
            <View style={styles.logoContainer}>
              <View style={[
                styles.logoCircle, 
                { 
                  width: tamañoLogo, 
                  height: tamañoLogo, 
                  borderRadius: tamañoLogo / 2 
                }
              ]}>
                <Image 
                  source={{ uri: 'https://placehold.co/400x400/FFF/00AEEF?text=CUNA+MAS' }} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Formulario */}
            <View style={styles.formContainer}>
              {/* Input DNI */}
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="N° DNI"
                  placeholderTextColor="#A9A9A9"
                  keyboardType="numeric"
                  maxLength={8} 
                  value={dni}
                  onChangeText={setDni}
                  editable={!loading}
                />
              </View>

              {/* Input CONTRASEÑA con Ojo Dinámico */}
              <View style={styles.inputWrapper}>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="CONTRASEÑA"
                    placeholderTextColor="#A9A9A9"
                    secureTextEntry={securePassword} // 🌟 Cambia dinámicamente
                    value={password}
                    onChangeText={setPassword}
                    editable={!loading}
                  />
                  {/* Botón del Ojo */}
                  <TouchableOpacity 
                    style={styles.eyeButton} 
                    onPress={() => setSecurePassword(!securePassword)}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.eyeIcon}>
                      {securePassword ? '👁️' : '🕶️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Botón Ingresar */}
              <TouchableOpacity 
                style={[styles.loginButton, loading && styles.buttonDisabled]}
                onPress={handleIngresar}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={[styles.loginButtonText, { fontSize: esPantallaGrande ? 22 : 18 }]}>
                    INGRESAR
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿No estás registrado? </Text>
            <Link href="/auth/register" asChild>
              <TouchableOpacity activeOpacity={0.7} focusable={true}>
                <Text style={styles.registerLink}>Regístrate Aquí</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF' 
  },
  flexible: {
    flex: 1
  },
  scrollContent: { 
    flexGrow: 1, 
    paddingHorizontal: '8%', 
    justifyContent: 'space-between'
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center', 
    width: '100%',
    alignSelf: 'center',
    marginTop: 35 
  },
  formMaxWith: {
    maxWidth: 400 
  },
  logoContainer: { 
    alignItems: 'center', 
    marginBottom: 25 
  },
  logoCircle: { 
    borderWidth: 5, 
    borderColor: '#00AEEF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    overflow: 'hidden', 
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 4,
  },
  logoImage: { 
    width: '85%', 
    height: '85%' 
  },
  formContainer: { 
    width: '100%'
  },
  inputWrapper: { 
    marginBottom: 16 
  },
  input: { 
    backgroundColor: '#F5F5F5', 
    height: 54, 
    paddingHorizontal: 16, 
    fontSize: 15, 
    color: '#333', 
    fontWeight: '500',
    borderRadius: 10 
  },
  // 🌟 NUEVOS ESTILOS PARA EL CONTENEDOR DE LA CONTRASEÑA Y EL OJO
  passwordInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    height: 54,
    borderRadius: 10,
    alignItems: 'center',
    overflow: 'hidden'
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  eyeButton: {
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  eyeIcon: {
    fontSize: 18,
    color: '#A9A9A9'
  },
  loginButton: { 
    backgroundColor: '#C5D800', 
    height: 56, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10, 
    borderRadius: 10,
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 3 
  },
  buttonDisabled: {
    opacity: 0.7
  },
  loginButtonText: { 
    color: '#FFF', 
    fontWeight: 'bold', 
    letterSpacing: 0.5 
  },
  registerContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    paddingVertical: 20 
  },
  registerText: { 
    color: '#666', 
    fontSize: 14 
  },
  registerLink: { 
    color: '#FF007A', 
    fontSize: 14, 
    fontWeight: '700' 
  },
});