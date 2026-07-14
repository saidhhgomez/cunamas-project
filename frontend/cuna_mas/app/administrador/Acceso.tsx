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
  ActivityIndicator,
  useWindowDimensions,
  Keyboard
} from 'react-native';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
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

// 📋 Simulación de la tabla de roles mapeados por su ID de Base de Datos
const TABLA_ROLES = [
    { id_rol: 1, nombre_rol: 'Asistente Técnico (AT)' },
  { id_rol: 2, nombre_rol: 'Socia de Cocina Tipo 1' },
  { id_rol: 3, nombre_rol: 'Socia de Cocina Tipo 2' },
  { id_rol: 4, nombre_rol: 'Socia de Cocina Tipo 2' },
  { id_rol: 5, nombre_rol: 'Experta en Nutrición' },
  { id_rol: 6, nombre_rol: 'Madre Cuidadora' },
  { id_rol: 7, nombre_rol: 'Madre Guía' },
];

export default function RegistrAcessoScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;

  const [tecladoVisible, setTecladoVisible] = useState(false);
  const [cargando, setCargando] = useState(false);

  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<typeof TABLA_DOCUMENTO[number] | null>(null);
  const [generoSeleccionado, setGeneroSeleccionado] = useState<typeof TABLA_GENERO[number] | null>(null);
  const [rolSeleccionado, setRolSeleccionado] = useState<typeof TABLA_ROLES[number] | null>(null); // 👈 Estado del Rol
  
  const [numDocumento, setNumDocumento] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');

  const [mostrarMenuDoc, setMostrarMenuDoc] = useState(false);
  const [mostrarMenuGenero, setMostrarMenuGenero] = useState(false);
  const [mostrarMenuRol, setMostrarMenuRol] = useState(false); // 👈 Visibilidad del menú de roles

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

  const manejarRegistro = async () => {
    if (!documentoSeleccionado || !numDocumento || !nombres || !apellidoPaterno || !generoSeleccionado || !rolSeleccionado || !correo || !password) {
      Alert.alert('Campos Incompletos', 'Por favor, completa todos los datos obligatorios, incluyendo el Rol.');
      return;
    }

    // 🚀 Payload estructurado exactamente como lo requiere tu endpoint
    const payloadRegistro: any = {
      persona: {
        idDocumento: documentoSeleccionado.id_documento,
        numeroDocumento: numDocumento,
        nombres: nombres,
        appPaterno: apellidoPaterno,
        apMaterno: apellidoMaterno,
        idGenero: generoSeleccionado.id_genero,
      },
      cuenta: {
        correoElectronico: correo.trim().toLowerCase(),
        password: password,
      },
      roles: [
        rolSeleccionado.id_rol // 👈 Se envía como un array de números tal cual tu JSON de ejemplo
      ]
    };

    try {
      setCargando(true);
      await registerService(payloadRegistro);
      Alert.alert(
        "¡Registro Exitoso!", 
        "Tu cuenta ha sido creada correctamente.",
        "Aceptar",
        [{ text: "OK", onPress: () => router.replace('/login') }]
      );
    } catch (error: any) {
      const mensajeError = error.response?.data?.mensaje || "No se pudo completar el registro.";
      Alert.alert("Error en el Registro", mensajeError);
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        style={styles.flexible}
      >
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
            <TouchableOpacity style={[styles.pickerField, mostrarMenuDoc && styles.pickerAbierto]} onPress={() => { setMostrarMenuDoc(!mostrarMenuDoc); setMostrarMenuGenero(false); setMostrarMenuRol(false); }}>
              <Text style={[styles.pickerText, !documentoSeleccionado && { color: '#94A3B8' }]}>
                {documentoSeleccionado ? documentoSeleccionado.nombre_documento : 'Tipo de Documento'}
              </Text>
              {mostrarMenuDoc ? <ChevronUp color="#00AEEF" size={22} /> : <ChevronDown color="#94A3B8" size={22} />}
            </TouchableOpacity>

            {mostrarMenuDoc && (
              <View style={styles.dropdownContainer}>
                {TABLA_DOCUMENTO.map((item) => (
                  <TouchableOpacity key={item.id_documento} style={styles.dropdownOption} onPress={() => { setDocumentoSeleccionado(item); setMostrarMenuDoc(false); }}>
                    <Text style={styles.dropdownOptionText}>{item.nombre_documento}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.inputWrapper}><TextInput style={styles.input} placeholder="N° de Documento" keyboardType="numeric" value={numDocumento} onChangeText={setNumDocumento} editable={!!documentoSeleccionado} /></View>
            <View style={styles.inputWrapper}><TextInput style={styles.input} placeholder="Nombres" value={nombres} onChangeText={setNombres} /></View>
            <View style={styles.inputWrapper}><TextInput style={styles.input} placeholder="Apellido Paterno" value={apellidoPaterno} onChangeText={setApellidoPaterno} /></View>
            <View style={styles.inputWrapper}><TextInput style={styles.input} placeholder="Apellido Materno" value={apellidoMaterno} onChangeText={setApellidoMaterno} /></View>

            {/* Género */}
            <TouchableOpacity style={[styles.pickerField, mostrarMenuGenero && styles.pickerAbierto]} onPress={() => { setMostrarMenuGenero(!mostrarMenuGenero); setMostrarMenuDoc(false); setMostrarMenuRol(false); }}>
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

            {/* 🆕 Selector de Rol Solicitado */}
            <TouchableOpacity style={[styles.pickerField, mostrarMenuRol && styles.pickerAbierto]} onPress={() => { setMostrarMenuRol(!mostrarMenuRol); setMostrarMenuDoc(false); setMostrarMenuGenero(false); }}>
              <Text style={[styles.pickerText, !rolSeleccionado && { color: '#94A3B8' }]}>
                {rolSeleccionado ? rolSeleccionado.nombre_rol : 'Selecciona tu Rol'}
              </Text>
              {mostrarMenuRol ? <ChevronUp color="#00AEEF" size={22} /> : <ChevronDown color="#94A3B8" size={22} />}
            </TouchableOpacity>

            {mostrarMenuRol && (
              <View style={styles.dropdownContainer}>
                {TABLA_ROLES.map((item) => (
                  <TouchableOpacity key={item.id_rol} style={styles.dropdownOption} onPress={() => { setRolSeleccionado(item); setMostrarMenuRol(false); }}>
                    <Text style={styles.dropdownOptionText}>{item.nombre_rol}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.separator} />
            <View style={styles.inputWrapper}><TextInput style={styles.input} placeholder="Correo Electrónico" keyboardType="email-address" autoCapitalize="none" value={correo} onChangeText={setCorreo} /></View>
            <View style={styles.inputWrapper}><TextInput style={styles.input} placeholder="Contraseña" secureTextEntry value={password} onChangeText={setPassword} /></View>
          </View>
        </ScrollView>

        {!tecladoVisible && (
          <View style={[styles.fixedFooter, esPantallaGrande && styles.tabletContent]}>
            <TouchableOpacity style={styles.registerButton} onPress={manejarRegistro} disabled={cargando}>
              {cargando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.registerButtonText}>REGISTRAR</Text>}
            </TouchableOpacity>
          </View>
        )}
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
  scrollContent: { paddingHorizontal: 24, paddingTop: 30, paddingBottom: 120 }, 
  tabletContent: { maxWidth: 480, alignSelf: 'center', width: '100%' },
  title: { fontWeight: '900', color: '#00AEEF', textAlign: 'center', marginBottom: 35 },
  form: { width: '100%' },
  inputWrapper: { backgroundColor: '#FFF', borderRadius: 14, marginBottom: 14, borderWidth: 1.5, borderColor: '#E2E8F0', elevation: 1 },
  input: { width: '100%', height: 50, paddingHorizontal: 16, color: '#1E293B', fontWeight: '600' },
  pickerField: { backgroundColor: '#FFF', borderRadius: 14, marginBottom: 14, borderWidth: 1.5, borderColor: '#E2E8F0', height: 50, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerAbierto: { borderColor: '#00AEEF', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, marginBottom: 0 },
  pickerText: { color: '#1E293B', fontWeight: '600' },
  dropdownContainer: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#00AEEF', borderTopWidth: 0, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, marginBottom: 14, paddingHorizontal: 4 },
  dropdownOption: { paddingVertical: 12, paddingHorizontal: 12 },
  dropdownOptionText: { color: '#334155', fontWeight: '600', fontSize: 15 },
  separator: { height: 2, backgroundColor: '#E2E8F0', marginVertical: 18 },
  fixedFooter: { backgroundColor: '#F8FAFC', paddingHorizontal: 24, paddingTop: 10, paddingBottom: 30, width: '100%' },
  registerButton: { backgroundColor: '#C5D800', width: '100%', height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  registerButtonText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});