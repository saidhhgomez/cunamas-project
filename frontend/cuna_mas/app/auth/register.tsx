import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, ChevronUp, ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { registerService, RegisterPayload } from '../../service/authService'; 

const TABLA_DOCUMENTO = [
  { id_documento: 1, nombre_documento: 'DNI', longitudMaxima: 8, soloNumeros: true },
  { id_documento: 2, nombre_documento: 'CE', longitudMaxima: 9, soloNumeros: false },
  { id_documento: 3, nombre_documento: 'Pasaporte', longitudMaxima: 12, soloNumeros: false },
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
  const insets = useSafeAreaInsets(); // Detecta la barra de gestos/botones inferior del celular

  const [cargando, setCargando] = useState(false);

  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<typeof TABLA_DOCUMENTO[number] | null>(null);
  const [generoSeleccionado, setGeneroSeleccionado] = useState<typeof TABLA_GENERO[number] | null>(null);
  
  const [numDocumento, setNumDocumento] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [ocultarPassword, setOcultarPassword] = useState(true);

  const [mostrarMenuDoc, setMostrarMenuDoc] = useState(false);
  const [mostrarMenuGenero, setMostrarMenuGenero] = useState(false);

  const manejarTextoDocumento = (texto: string) => {
    if (!documentoSeleccionado) return;

    let textoFiltrado = texto;
    if (documentoSeleccionado.soloNumeros) {
      textoFiltrado = texto.replace(/[^0-9]/g, '');
    }
    
    if (textoFiltrado.length <= documentoSeleccionado.longitudMaxima) {
      setNumDocumento(textoFiltrado);
    }
  };

  const seleccionarDocumento = (doc: typeof TABLA_DOCUMENTO[number]) => {
    setDocumentoSeleccionado(doc);
    setNumDocumento('');
    setMostrarMenuDoc(false);
  };

  const manejarRegistro = async () => {
    if (!documentoSeleccionado || !numDocumento || !nombres || !apellidoPaterno || !generoSeleccionado || !correo || !password) {
      Alert.alert('Campos Incompletos', 'Por favor, completa todos los datos obligatorios.');
      return;
    }

    if (numDocumento.length !== documentoSeleccionado.longitudMaxima && documentoSeleccionado.id_documento === 1) {
      Alert.alert('Documento Inválido', `El DNI debe tener exactamente ${documentoSeleccionado.longitudMaxima} dígitos.`);
      return;
    }

    const payloadRegistro: RegisterPayload = {
      persona: {
        idDocumento: documentoSeleccionado.id_documento,
        numeroDocumento: numDocumento.trim(),
        nombres: nombres.trim(),
        apPaterno: apellidoPaterno.trim(),
        apMaterno: apellidoMaterno.trim(),
        idGenero: generoSeleccionado.id_genero,
      },
      cuenta: {
        correoElectronico: correo.trim().toLowerCase(),
        password: password,
      },
    };

    try {
      setCargando(true);
      // Guardamos la respuesta del backend
      const respuesta = await registerService(payloadRegistro);
      
      // Extraemos el mensaje de éxito que viene del backend (ajusta 'respuesta?.data?.mensaje' según la estructura de tu axios/fetch)
      const mensajeExito = respuesta?.data?.mensaje || "Tu cuenta ha sido creada correctamente.";

      Alert.alert(
        "¡Registro Exitoso!", 
        mensajeExito,
        [{ text: "OK", onPress: () => router.replace('/') }]
      );
    } catch (error: any) {
      const mensajeError = error.response?.data?.mensaje || "No se pudo completar el registro.";
      Alert.alert("Error en el Registro", mensajeError);
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* 
        pointerEvents="none" bloquea de forma nativa cualquier interacción táctil (inputs, botones, scrolls) 
        en toda la pantalla mientras la variable 'cargando' sea verdadera.
      */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexible}
        pointerEvents={cargando ? "none" : "auto"}
      >
        {/* Cabecera */}
        <View style={[styles.header, { height: esPantallaGrande ? 130 : 110 }]}>
          <TouchableOpacity 
            style={[styles.backButton, { width: esPantallaGrande ? 150 : 125, height: esPantallaGrande ? 46 : 40 }]} 
            onPress={() => router.back()}
            disabled={cargando}
          >
            <View style={styles.backContent}>
              <ArrowLeft color="#FFF" size={esPantallaGrande ? 22 : 18} strokeWidth={3} />
              <Text style={[styles.backText, { fontSize: esPantallaGrande ? 15 : 13 }]}>VOLVER</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Formulario Scrolleable sin el botón */}
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
            {/* Tipo Documento */}
            <View style={[styles.pickerContainer, { zIndex: 10 }]}>
              <TouchableOpacity 
                style={[styles.pickerField, mostrarMenuDoc && styles.pickerAbierto]} 
                onPress={() => {
                  setMostrarMenuDoc(!mostrarMenuDoc);
                  setMostrarMenuGenero(false);
                }}
              >
                <Text style={[styles.pickerText, !documentoSeleccionado && { color: '#94A3B8' }]}>
                  {documentoSeleccionado ? documentoSeleccionado.nombre_documento : 'Tipo de Documento'}
                </Text>
                {mostrarMenuDoc ? <ChevronUp color="#00AEEF" size={22} /> : <ChevronDown color="#94A3B8" size={22} />}
              </TouchableOpacity>

              {mostrarMenuDoc && (
                <View style={styles.dropdownContainer}>
                  {TABLA_DOCUMENTO.map((item) => (
                    <TouchableOpacity key={item.id_documento} style={styles.dropdownOption} onPress={() => seleccionarDocumento(item)}>
                      <Text style={styles.dropdownOptionText}>{item.nombre_documento}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* N° Documento */}
            <View style={[styles.inputWrapper, !documentoSeleccionado && styles.inputDeshabilitado]}>
              <TextInput 
                style={styles.input} 
                placeholder={documentoSeleccionado ? `N° de Documento (${documentoSeleccionado.longitudMaxima} caracteres)` : "Selecciona un tipo de documento"} 
                keyboardType={documentoSeleccionado?.soloNumeros ? "numeric" : "default"} 
                value={numDocumento} 
                onChangeText={manejarTextoDocumento} 
                editable={!!documentoSeleccionado} 
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput style={styles.input} placeholder="Nombres" value={nombres} onChangeText={setNombres} placeholderTextColor="#94A3B8" />
            </View>
            <View style={styles.inputWrapper}>
              <TextInput style={styles.input} placeholder="Apellido Paterno" value={apellidoPaterno} onChangeText={setApellidoPaterno} placeholderTextColor="#94A3B8" />
            </View>
            <View style={styles.inputWrapper}>
              <TextInput style={styles.input} placeholder="Apellido Materno" value={apellidoMaterno} onChangeText={setApellidoMaterno} placeholderTextColor="#94A3B8" />
            </View>

            {/* Género */}
            <View style={[styles.pickerContainer, { zIndex: 5 }]}>
              <TouchableOpacity 
                style={[styles.pickerField, mostrarMenuGenero && styles.pickerAbierto]} 
                onPress={() => {
                  setMostrarMenuGenero(!mostrarMenuGenero);
                  setMostrarMenuDoc(false);
                }}
              >
                <Text style={[styles.pickerText, !generoSeleccionado && { color: '#94A3B8' }]}>
                  {generoSeleccionado ? generoSeleccionado.nombre_genero : 'Género'}
                </Text>
                {mostrarMenuGenero ? <ChevronUp color="#00AEEF" size={22} /> : <ChevronDown color="#94A3B8" size={22} />}
              </TouchableOpacity>

              {mostrarMenuGenero && (
                <View style={styles.dropdownContainer}>
                  {TABLA_GENERO.map((item) => (
                    <TouchableOpacity key={item.id_genero} style={styles.dropdownOption} onPress={() => { setGeneroSeleccionado(item); setMostrarMenuGenero(false); }}>
                      <Text style={styles.dropdownOptionText}>{item.nombre_genero}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.separator} />

            {/* Correo Electrónico */}
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.input} 
                placeholder="Correo Electrónico" 
                keyboardType="email-address" 
                autoCapitalize="none" 
                value={correo} 
                onChangeText={setCorreo} 
                placeholderTextColor="#94A3B8"
              />
            </View>

            {/* Contraseña con Toggle */}
            <View style={styles.inputWrapper}>
              <TextInput 
                style={[styles.input, styles.inputPassword]} 
                placeholder="Contraseña" 
                secureTextEntry={ocultarPassword} 
                value={password} 
                onChangeText={setPassword} 
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setOcultarPassword(!ocultarPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {ocultarPassword ? <EyeOff color="#94A3B8" size={22} /> : <Eye color="#00AEEF" size={22} />}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* SECCIÓN ESTÁTICA INFERIOR: El botón flota aquí de forma fija */}
        <View style={[
          styles.footerContainer,
          { 
            // Esto asegura que el botón flote de forma segura arriba de los botones de Android / barra gestos de iOS
            paddingBottom: Math.max(insets.bottom, 16), 
          }
        ]}>
          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={manejarRegistro} 
            disabled={cargando}
          >
            {cargando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.registerButtonText}>REGISTRAR</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  flexible: { flex: 1 },
  header: { backgroundColor: '#C5D800', borderBottomLeftRadius: 35, borderBottomRightRadius: 35, justifyContent: 'center', paddingHorizontal: 24, elevation: 3 },
  backButton: { backgroundColor: '#FF007A', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  backContent: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: '#FFF', fontWeight: '800', marginLeft: 4 },
  
  // padding bottom para que los últimos inputs no queden tapados por el footer estático
  scrollContent: { paddingHorizontal: 24, paddingTop: 30, paddingBottom: 100 }, 
  tabletContent: { maxWidth: 480, alignSelf: 'center', width: '100%' },
  title: { fontWeight: '900', color: '#00AEEF', textAlign: 'center', marginBottom: 35 },
  form: { width: '100%' },
  
  pickerContainer: { position: 'relative', marginBottom: 14 },
  
  inputWrapper: { backgroundColor: '#FFF', borderRadius: 14, marginBottom: 14, borderWidth: 1.5, borderColor: '#E2E8F0', elevation: 1, flexDirection: 'row', alignItems: 'center', position: 'relative' },
  inputDeshabilitado: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
  input: { flex: 1, height: 50, paddingHorizontal: 16, color: '#1E293B', fontWeight: '600' },
  inputPassword: { paddingRight: 50 }, 
  eyeIcon: { position: 'absolute', right: 16, height: '100%', justifyContent: 'center' },
  
  pickerField: { backgroundColor: '#FFF', borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', height: 50, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerAbierto: { borderColor: '#00AEEF', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  pickerText: { color: '#1E293B', fontWeight: '600' },
  
  dropdownContainer: { 
    backgroundColor: '#FFF', 
    borderWidth: 1.5, 
    borderColor: '#00AEEF', 
    borderTopWidth: 0, 
    borderBottomLeftRadius: 14, 
    borderBottomRightRadius: 14, 
    position: 'absolute', 
    top: 50, 
    left: 0, 
    right: 0, 
    zIndex: 999, 
    elevation: 5, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingHorizontal: 4 
  },
  dropdownOption: { paddingVertical: 12, paddingHorizontal: 12 },
  dropdownOptionText: { color: '#334155', fontWeight: '600', fontSize: 15 },
  separator: { height: 2, backgroundColor: '#E2E8F0', marginVertical: 18 },

  // Contenedor estático al final de la pantalla
  footerContainer: {
    backgroundColor: '#F8FAFC', // Mismo fondo para disimular la integración
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9', // Opcional: línea sutil divisoria
  },
  registerButton: { backgroundColor: '#C5D800', width: '100%', height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  registerButtonText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});