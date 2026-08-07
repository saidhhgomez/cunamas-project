import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronDown, ChevronUp, ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle, Check, X as XIcon } from 'lucide-react-native';
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

// Regex simple para validar formato de correo
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type TipoModal = 'exito' | 'error';

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
  const [passwordEnfocado, setPasswordEnfocado] = useState(false);

  const [mostrarMenuDoc, setMostrarMenuDoc] = useState(false);
  const [mostrarMenuGenero, setMostrarMenuGenero] = useState(false);

  // ---- Modal de resultado (éxito / error) ----
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState<TipoModal>('exito');
  const [modalTitulo, setModalTitulo] = useState('');
  const [modalMensaje, setModalMensaje] = useState('');

  const abrirModal = (tipo: TipoModal, titulo: string, mensaje: string) => {
    setModalTipo(tipo);
    setModalTitulo(titulo);
    setModalMensaje(mensaje);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    if (modalTipo === 'exito') {
      router.replace('/');
    }
  };

  // ---- Requisitos de contraseña, evaluados en vivo ----
  const requisitosPassword = useMemo(() => ([
    { clave: 'longitud', label: 'Mínimo 8 caracteres', cumple: password.length >= 8 },
    { clave: 'mayuscula', label: 'Una letra mayúscula', cumple: /[A-Z]/.test(password) },
    { clave: 'minuscula', label: 'Una letra minúscula', cumple: /[a-z]/.test(password) },
    { clave: 'numero', label: 'Un número', cumple: /[0-9]/.test(password) },
    { clave: 'especial', label: 'Un carácter especial (!@#$...)', cumple: /[^A-Za-z0-9]/.test(password) },
  ]), [password]);

  const passwordEsValida = requisitosPassword.every((r) => r.cumple);
  const correoEsValido = REGEX_CORREO.test(correo.trim());

  // ---- Validación global del formulario (habilita/deshabilita el botón) ----
  const formularioCompleto = useMemo(() => {
    if (!documentoSeleccionado || !generoSeleccionado) return false;
    if (numDocumento.trim().length !== documentoSeleccionado.longitudMaxima) return false;
    if (!nombres.trim() || !apellidoPaterno.trim()) return false;
    if (!correoEsValido) return false;
    if (!passwordEsValida) return false;
    return true;
  }, [documentoSeleccionado, generoSeleccionado, numDocumento, nombres, apellidoPaterno, correoEsValido, passwordEsValida]);

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
    // El botón ya está deshabilitado si el formulario no está completo,
    // pero se mantiene esta guarda por seguridad ante llamadas indirectas.
    if (!formularioCompleto || !documentoSeleccionado || !generoSeleccionado) {
      abrirModal('error', 'Campos Incompletos', 'Por favor, completa todos los datos obligatorios correctamente.');
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
      const respuesta = await registerService(payloadRegistro);
      const mensajeExito = respuesta?.data?.mensaje || "Tu cuenta ha sido creada correctamente.";
      abrirModal('exito', '¡Registro Exitoso!', mensajeExito);
    } catch (error: any) {
      const mensajeError = error.response?.data?.mensaje || "No se pudo completar el registro.";
      abrirModal('error', 'Error en el Registro', mensajeError);
    } finally {
      setCargando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#C5D800" />
      {/* 
        pointerEvents="none" bloquea de forma nativa cualquier interacción táctil (inputs, botones, scrolls) 
        en toda la pantalla mientras la variable 'cargando' sea verdadera.
      */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexible}
        pointerEvents={cargando ? "none" : "auto"}
      >
        {/* Header (mismo estilo, con botón VOLVER) */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
              disabled={cargando}
            >
              <View style={styles.backContent}>
                <ArrowLeft color="#FFF" size={18} strokeWidth={3} />
                <Text style={styles.backText}>VOLVER</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Barra de título blanca (mismo diseño, título sin cambios) */}
        <View style={styles.titleBar}>
          <Text style={[styles.title, { fontSize: esPantallaGrande ? 32 : 26 }]}>
            REGISTRO
          </Text>
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
                {mostrarMenuDoc ? <ChevronUp color="#006080" size={22} /> : <ChevronDown color="#94A3B8" size={22} />}
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
                {mostrarMenuGenero ? <ChevronUp color="#006080" size={22} /> : <ChevronDown color="#94A3B8" size={22} />}
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
            <View style={[styles.inputWrapper, correo.length > 0 && !correoEsValido && styles.inputConError]}>
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
            {correo.length > 0 && !correoEsValido && (
              <Text style={styles.textoError}>Ingresa un correo electrónico válido.</Text>
            )}

            {/* Contraseña con Toggle */}
            <View style={styles.inputWrapper}>
              <TextInput 
                style={[styles.input, styles.inputPassword]} 
                placeholder="Contraseña" 
                secureTextEntry={ocultarPassword} 
                value={password} 
                onChangeText={setPassword} 
                onFocus={() => setPasswordEnfocado(true)}
                onBlur={() => setPasswordEnfocado(false)}
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeIcon} 
                onPress={() => setOcultarPassword(!ocultarPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {ocultarPassword ? <EyeOff color="#94A3B8" size={22} /> : <Eye color="#006080" size={22} />}
              </TouchableOpacity>
            </View>

            {/* Checklist de requisitos de contraseña: visible mientras se escribe */}
            {(passwordEnfocado || password.length > 0) && (
              <View style={styles.checklistContainer}>
                {requisitosPassword.map((req) => (
                  <View key={req.clave} style={styles.checklistItem}>
                    {req.cumple ? (
                      <Check color="#16A34A" size={16} strokeWidth={3} />
                    ) : (
                      <View style={styles.checklistDot} />
                    )}
                    <Text style={[styles.checklistText, req.cumple && styles.checklistTextCumplido]}>
                      {req.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}
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
            style={[styles.registerButton, (!formularioCompleto || cargando) && styles.registerButtonDeshabilitado]} 
            onPress={manejarRegistro} 
            disabled={!formularioCompleto || cargando}
            activeOpacity={0.8}
          >
            {cargando ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={[styles.registerButtonText, !formularioCompleto && styles.registerButtonTextDeshabilitado]}>
                REGISTRAR
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Modal personalizado de éxito / error, reemplaza Alert.alert */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={cerrarModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[
              styles.modalIconWrapper,
              modalTipo === 'exito' ? styles.modalIconExito : styles.modalIconError,
            ]}>
              {modalTipo === 'exito' ? (
                <CheckCircle2 color="#16A34A" size={40} strokeWidth={2} />
              ) : (
                <XCircle color="#DC2626" size={40} strokeWidth={2} />
              )}
            </View>

            <Text style={styles.modalTitulo}>{modalTitulo}</Text>
            <Text style={styles.modalMensaje}>{modalMensaje}</Text>

            <TouchableOpacity
              style={[
                styles.modalBoton,
                modalTipo === 'exito' ? styles.modalBotonExito : styles.modalBotonError,
              ]}
              onPress={cerrarModal}
              activeOpacity={0.85}
            >
              <Text style={styles.modalBotonTexto}>
                {modalTipo === 'exito' ? 'CONTINUAR' : 'ENTENDIDO'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  flexible: { flex: 1 },

  // Header (mismo estilo, con botón VOLVER)
  header: { 
    backgroundColor: '#C5D800', 
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: { 
    backgroundColor: '#FF0080', 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center',
    height: 40,
    paddingHorizontal: 16,
  },
  backContent: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: '#FFF', fontWeight: '800', marginLeft: 4, fontSize: 13 },

  // Barra de título blanca
  titleBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  title: { fontWeight: '900', color: '#006080', textAlign: 'center' },
  
  // padding bottom para que los últimos inputs no queden tapados por el footer estático
  scrollContent: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 100 }, 
  tabletContent: { maxWidth: 480, alignSelf: 'center', width: '100%' },
  form: { width: '100%' },
  
  pickerContainer: { position: 'relative', marginBottom: 14 },
  
  inputWrapper: { backgroundColor: '#FFF', borderRadius: 14, marginBottom: 14, borderWidth: 1.5, borderColor: '#E2E8F0', elevation: 1, flexDirection: 'row', alignItems: 'center', position: 'relative' },
  inputDeshabilitado: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
  inputConError: { borderColor: '#DC2626' },
  input: { flex: 1, height: 50, paddingHorizontal: 16, color: '#1E293B', fontWeight: '600' },
  inputPassword: { paddingRight: 50 }, 
  eyeIcon: { position: 'absolute', right: 16, height: '100%', justifyContent: 'center' },

  textoError: { color: '#DC2626', fontSize: 12, fontWeight: '600', marginTop: -8, marginBottom: 14, marginLeft: 4 },
  
  pickerField: { backgroundColor: '#FFF', borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E8F0', height: 50, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerAbierto: { borderColor: '#006080', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  pickerText: { color: '#1E293B', fontWeight: '600' },
  
  dropdownContainer: { 
    backgroundColor: '#FFF', 
    borderWidth: 1.5, 
    borderColor: '#006080', 
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

  // Checklist de requisitos de contraseña
  checklistContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginTop: -4,
    marginBottom: 14,
    gap: 8,
  },
  checklistItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checklistDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5, borderColor: '#CBD5E1' },
  checklistText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  checklistTextCumplido: { color: '#16A34A' },

  // Contenedor estático al final de la pantalla
  footerContainer: {
    backgroundColor: '#F9F9F9', // Mismo fondo para disimular la integración
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9', // Opcional: línea sutil divisoria
  },
  registerButton: { backgroundColor: '#C5D800', width: '100%', height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  registerButtonDeshabilitado: { backgroundColor: '#E2E8F0', elevation: 0 },
  registerButtonText: { color: '#006080', fontWeight: '800', fontSize: 16 },
  registerButtonTextDeshabilitado: { color: '#94A3B8' },

  // Modal de éxito / error
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  modalIconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconExito: { backgroundColor: '#DCFCE7' },
  modalIconError: { backgroundColor: '#FEE2E2' },
  modalTitulo: { fontSize: 19, fontWeight: '900', color: '#1E293B', textAlign: 'center', marginBottom: 8 },
  modalMensaje: { fontSize: 14, fontWeight: '500', color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  modalBoton: { width: '100%', height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  modalBotonExito: { backgroundColor: '#006080' },
  modalBotonError: { backgroundColor: '#DC2626' },
  modalBotonTexto: { color: '#FFF', fontWeight: '800', fontSize: 14 },
});