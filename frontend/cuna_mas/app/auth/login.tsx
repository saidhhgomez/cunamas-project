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

export default function LoginScreen() {
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { width } = useWindowDimensions();
  
  const esPantallaGrande = width > 600;
  // 🚀 Círculo notablemente más grande y con más presencia visual
  const tamañoLogo = esPantallaGrande ? 260 : width * 0.55; 

  const handleIngresar = async () => {
    if (!dni || !password) {
      Alert.alert('Error', 'Por favor, complete todos los campos');
      return;
    }

    setLoading(true);
    try {
      await login(dni, password);
    } catch (error: any) {
      Alert.alert('Error de Inicio de Sesión', error.message || 'DNI o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexible}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Contenedor principal unificado */}
          <View style={[styles.mainContent, esPantallaGrande && styles.formMaxWith]}>
            
            {/* Logo Central más imponente */}
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

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="CONTRASEÑA"
                  placeholderTextColor="#A9A9A9"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
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

          {/* Footer de Registro */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿No estás registrado? </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.registerLink}>Regístrate Aquí</Text>
            </TouchableOpacity>
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
    paddingBottom: 20,
    justifyContent: 'space-between'
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center', 
    width: '100%',
    alignSelf: 'center',
    marginTop: 15
  },
  formMaxWith: {
    maxWidth: 400 
  },
  logoContainer: { 
    alignItems: 'center', 
    marginBottom: 25 // Ajustado un poco más corto para equilibrar el tamaño del logo nuevo
  },
  logoCircle: { 
    borderWidth: 5, // Aumentado ligeramente el grosor del borde para acompañar el tamaño
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
    paddingVertical: 15
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