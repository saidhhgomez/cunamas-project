import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator, // 🌟 Importamos para mostrar estado de carga
  useWindowDimensions,
  Keyboard
} from 'react-native';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
// 🌟 Importamos el servicio y la interfaz que creamos previamente
import { registerService, RegisterPayload } from '../../service/authService'; 

const TABLA_DOCUMENTO = [
  { id_documento: 1, nombre_documento: 'DNI' },
  { id_documento: 2, nombre_documento: 'CE' },
  { id_documento: 3, nombre_documento: 'Pasaporte' },
];

const TABLA_GENERO = [
  { id_genero: 1, nombre_genero: 'Masculino' },
  { id_genero: 2, nombre_genero: 'Femenino' },
  { id_genero: 3, nombre_genero: 'Prefiero No Decirlo' },
];

export default function RegistroScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;

  const [tecladoVisible, setTecladoVisible] = useState(false);
  const [cargando, setCargando] = useState(false); // 🌟 Estado para deshabilitar botones al registrar

  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<typeof TABLA_DOCUMENTO[number] | null>(null);
  const [generoSeleccionado, setGeneroSeleccionado] = useState<typeof TABLA_GENERO[number] | null>(null);
  
  const [numDocumento, setNumDocumento] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  const [mostrarMenuDoc, setMostrarMenuDoc] = useState(false);
  const [mostrarMenuGenero, setMostrarMenuGenero] = useState(false);

  useEffect(() => {
    const tecladoMuestra = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setTecladoVisible(true)
    );
    const tecladoOculta = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setTecladoVisible(false)
    );

    return () => {
      tecladoMuestra.remove();
      tecladoOculta.remove();
    };
  }, []);

  // 🌟 Modificamos la función para que sea asíncrona y llame a la API
  const manejarRegistro = async () => {
    if (!documentoSeleccionado || !numDocumento || !nombres || !apellidoPaterno || !generoSeleccionado || !correo || !password) {
      Alert.alert('Campos Incompletos', 'Por favor, completa todos los datos obligatorios.');
      return;
    }

    // 🌟 Mapeamos y estructuramos los datos exactamente como pide tu Swagger
    const payloadRegistro: RegisterPayload = {
      persona: {
        idDocumento: documentoSeleccionado.id_documento,
        numeroDocumento: numDocumento,
        nombres: nombres,
        appPaterno: apellidoPaterno,
        apMaterno: apellidoMaterno, // Puede ir vacío si no tiene
        idGenero: generoSeleccionado.id_genero,
      },
      cuenta: {
        correoElectronico: correo.trim().toLowerCase(),
        password: password,
      },
    };

    try {
      setCargando(true);
      
      // Enviamos los datos al backend
      await registerService(payloadRegistro);

      // Si todo sale bien:
      Alert.alert(
        "¡Registro Exitoso!", 
        "Tu cuenta ha sido creada correctamente.",
        [{ text: "OK", onPress: () => router.replace('/login') }] // Te redirige al Login
      );

    } catch (error: any) {
      // Manejo amigable de errores desde el backend
      const mensajeError = error.response?.data?.mensaje || "No se pudo completar el registro. Inténtalo de nuevo más tarde.";
      Alert.alert("Error en el Registro", mensajeError);
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.flexible}
      >
        {/* Header */}
        <View style={[styles.header, { height: esPantallaGrande ? 130 : 110 }]}>
          <TouchableOpacity 
            style={[styles.backButton, { width: esPantallaGrande ? 150 : 125, height: esPantallaGrande ? 46 : 40 }]} 
            onPress={() => router.back()}
            activeOpacity={0.85}
            disabled={cargando} // Deshabilitar si está cargando
          >
            <View style={styles.backContent}>
              <ArrowLeft color="#FFF" size={esPantallaGrande ? 22 : 18} strokeWidth={3} />
              <Text style={[styles.backText, { fontSize: esPantallaGrande ? 15 : 13 }]}>VOLVER</Text>
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent, 
            esPantallaGrande && styles.tabletContent
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, { fontSize: esPantallaGrande ? 44 : 36 }]}>
            REGISTRO
          </Text>

          <View style={styles.form}>
            {/* Selector de Tipo de Documento */}
            <TouchableOpacity 
              style={[styles.pickerField, mostrarMenuDoc && styles.pickerAbierto]}
              activeOpacity={0.8}
              disabled={cargando}
              onPress={() => {
                setMostrarMenuDoc(!mostrarMenuDoc);
                setMostrarMenuGenero(false);
              }}
            >
              <Text style={[
                styles.pickerText, 
                { fontSize: esPantallaGrande ? 17 : 15 },
                !documentoSeleccionado && { color: '#94A3B8' }
              ]}>
                {documentoSeleccionado ? documentoSeleccionado.nombre_documento : 'Tipo de Documento'}
              </Text>
              {mostrarMenuDoc ? (
                <ChevronUp color="#00AEEF" size={22} strokeWidth={2.5} />
              ) : (
                <ChevronDown color="#94A3B8" size={22} strokeWidth={2.5} />
              )}
            </TouchableOpacity>

            {/* Opciones Desplegables: Documento */}
            {mostrarMenuDoc && (
              <View style={styles.dropdownContainer}>
                {TABLA_DOCUMENTO.map((item) => (
                  <TouchableOpacity
                    key={item.id_documento}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setDocumentoSeleccionado(item);
                      setMostrarMenuDoc(false);
                      setNumDocumento('');
                    }}
                  >
                    <Text style={styles.dropdownOptionText}>{item.nombre_documento}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Input: N° Documento */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { fontSize: esPantallaGrande ? 17 : 15 }]}
                placeholder={documentoSeleccionado ? `N° de ${documentoSeleccionado.nombre_documento}` : "N° de Documento"}
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                maxLength={documentoSeleccionado?.id_documento === 1 ? 8 : 12}
                value={numDocumento}
                onChangeText={setNumDocumento}
                editable={!!documentoSeleccionado && !cargando}
              />
            </View>

            {/* Input: Nombres */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { fontSize: esPantallaGrande ? 17 : 15 }]}
                placeholder="Nombres"
                placeholderTextColor="#94A3B8"
                value={nombres}
                onChangeText={setNombres}
                editable={!cargando}
              />
            </View>

            {/* Input: Apellido Paterno */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { fontSize: esPantallaGrande ? 17 : 15 }]}
                placeholder="Apellido Paterno"
                placeholderTextColor="#94A3B8"
                value={apellidoPaterno}
                onChangeText={setApellidoPaterno}
                editable={!cargando}
              />
            </View>

            {/* Input: Apellido Materno */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { fontSize: esPantallaGrande ? 17 : 15 }]}
                placeholder="Apellido Materno"
                placeholderTextColor="#94A3B8"
                value={apellidoMaterno}
                onChangeText={setApellidoMaterno}
                editable={!cargando}
              />
            </View>

            {/* Selector de Género */}
            <TouchableOpacity 
              style={[styles.pickerField, mostrarMenuGenero && styles.pickerAbierto]}
              activeOpacity={0.8}
              disabled={cargando}
              onPress={() => {
                setMostrarMenuGenero(!mostrarMenuGenero);
                setMostrarMenuDoc(false);
              }}
            >
              <Text style={[
                styles.pickerText, 
                { fontSize: esPantallaGrande ? 17 : 15 },
                !generoSeleccionado && { color: '#94A3B8' }
              ]}>
                {generoSeleccionado ? generoSeleccionado.nombre_genero : 'Género'}
              </Text>
              {mostrarMenuGenero ? (
                <ChevronUp color="#00AEEF" size={22} strokeWidth={2.5} />
              ) : (
                <ChevronDown color="#94A3B8" size={22} strokeWidth={2.5} />
              )}
            </TouchableOpacity>

            {/* Opciones Desplegables: Género */}
            {mostrarMenuGenero && (
              <View style={styles.dropdownContainer}>
                {TABLA_GENERO.map((item) => (
                  <TouchableOpacity
                    key={item.id_genero}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setGeneroSeleccionado(item);
                      setMostrarMenuGenero(false);
                    }}
                  >
                    <Text style={styles.dropdownOptionText}>{item.nombre_genero}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Línea Divisoria */}
            <View style={styles.separator} />

            {/* Input: Correo Electrónico */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { fontSize: esPantallaGrande ? 17 : 15 }]}
                placeholder="Correo Electrónico"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={correo}
                onChangeText={setCorreo}
                editable={!cargando}
              />
            </View>

            {/* Input: Contraseña */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, { fontSize: esPantallaGrande ? 17 : 15 }]}
                placeholder="Contraseña"
                placeholderTextColor="#94A3B8"
                secureTextEntry={true}
                value={password}
                onChangeText={setPassword}
                editable={!cargando}
              />
            </View>
          </View>
        </ScrollView>

        {/* Footer fijo con botón: Oculto si el teclado se activa */}
        {!tecladoVisible && (
          <View style={[
            styles.fixedFooter, 
            esPantallaGrande && styles.tabletContent
          ]}>
            <TouchableOpacity 
              style={[styles.registerButton, { height: esPantallaGrande ? 56 : 52 }]}
              onPress={manejarRegistro}
              activeOpacity={0.85}
              disabled={cargando} // 🌟 Evita doble envío accidental
            >
              {cargando ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={[styles.registerButtonText, { fontSize: esPantallaGrande ? 18 : 16 }]}>
                  REGISTRAR
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ... Tus estilos se quedan exactamente iguales a como los tenías ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  flexible: {
    flex: 1,
  },
  header: {
    backgroundColor: '#C5D800',
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    justifyContent: 'center',
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    backgroundColor: '#FF007A',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#FFF',
    fontWeight: '800',
    marginLeft: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 20,
  },
  tabletContent: { 
    maxWidth: 480, 
    alignSelf: 'center',
    width: '100%'
  },
  title: {
    fontWeight: '900',
    color: '#00AEEF',
    textAlign: 'center',
    marginBottom: 35,
    letterSpacing: 0.5,
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  input: {
    width: '100%',
    height: 50,
    paddingHorizontal: 16,
    color: '#1E293B',
    fontWeight: '600',
  },
  pickerField: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    height: 50,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  pickerAbierto: {
    borderColor: '#00AEEF',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  },
  pickerText: {
    color: '#1E293B',
    fontWeight: '600',
  },
  dropdownContainer: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#00AEEF',
    borderTopWidth: 0,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    marginBottom: 14,
    paddingHorizontal: 4,
    paddingBottom: 4,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dropdownOptionText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 15,
  },
  separator: {
    height: 2,
    backgroundColor: '#E2E8F0',
    marginVertical: 18,
    width: '100%',
    borderRadius: 1,
  },
  fixedFooter: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 50,
    width: '100%',
  },
  registerButton: {
    backgroundColor: '#C5D800',
    width: '100%',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C5D800',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  registerButtonText: {
    color: '#FFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});