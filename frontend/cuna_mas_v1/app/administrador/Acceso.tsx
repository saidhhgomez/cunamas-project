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
  ActivityIndicator,
  useWindowDimensions,
  Keyboard
} from 'react-native';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard'; // 🌟 Importación moderna y recomendada para Expo
import { usuarioService, RegisterAdminPayload } from '../../service/adminService'; 
// Ajusta esta ruta a donde tengas guardado el componente ModalMensaje
import ModalMensaje, { TipoModalMensaje } from '../../app/components/ModalMensaje';

const TABLA_DOCUMENTO = [
  { id_documento: 1, nombre_documento: 'DNI', longitud: 8, teclado: 'numeric' as const },
  { id_documento: 2, nombre_documento: 'CE', longitud: 9, teclado: 'default' as const },
  { id_documento: 3, nombre_documento: 'Pasaporte', longitud: 9, teclado: 'default' as const },
];

const TABLA_GENERO = [
  { id_genero: 1, nombre_genero: 'Masculino' },
  { id_genero: 2, nombre_genero: 'Femenino' },
  { id_genero: 3, nombre_genero: 'Prefiero No Decirlo' },
];

const TABLA_ROLES = [
  { id_rol: 1, nombre_rol: 'Asistente Técnico (AT)' },
  { id_rol: 2, nombre_rol: 'Socia de Cocina Tipo 1' },
  { id_rol: 3, nombre_rol: 'Socia de Cocina Tipo 2' },
  { id_rol: 4, nombre_rol: 'Experta en Nutrición' },
  { id_rol: 5, nombre_rol: 'Madre Cuidadora' },
  { id_rol: 6, nombre_rol: 'Madre Guía' },
];

export default function RegisterAdminScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;

  const [tecladoVisible, setTecladoVisible] = useState(false);
  const [cargando, setCargando] = useState(false);

  const [documentoSeleccionado, setDocumentoSeleccionado] = useState<typeof TABLA_DOCUMENTO[number] | null>(null);
  const [generoSeleccionado, setGeneroSeleccionado] = useState<typeof TABLA_GENERO[number] | null>(null);
  const [rolSeleccionado, setRolSeleccionado] = useState<typeof TABLA_ROLES[number] | null>(null); 
  
  const [numDocumento, setNumDocumento] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [correo, setCorreo] = useState('');

  const [mostrarMenuDoc, setMostrarMenuDoc] = useState(false);
  const [mostrarMenuGenero, setMostrarMenuGenero] = useState(false);
  const [mostrarMenuRol, setMostrarMenuRol] = useState(false);

  // Estado del modal reutilizable de éxito/error
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState<TipoModalMensaje>('error');
  const [modalTitulo, setModalTitulo] = useState('');
  const [modalMensaje, setModalMensaje] = useState('');
  // Guarda la contraseña temporal solo cuando el registro fue exitoso,
  // para poder copiarla al cerrar el modal.
  const [passwordTemporalPendiente, setPasswordTemporalPendiente] = useState('');

  const mostrarModal = (tipo: TipoModalMensaje, titulo: string, mensaje: string) => {
    setModalTipo(tipo);
    setModalTitulo(titulo);
    setModalMensaje(mensaje);
    setModalVisible(true);
  };

  // Al cerrar el modal: si fue un registro exitoso, copia la contraseña
  // temporal (si existe) y vuelve a la pantalla anterior. Si fue un error
  // de validación o del backend, simplemente cierra el modal.
  const cerrarModal = async () => {
    setModalVisible(false);
    if (modalTipo === 'exito') {
      if (passwordTemporalPendiente) {
        await Clipboard.setStringAsync(passwordTemporalPendiente);
      }
      setPasswordTemporalPendiente('');
      router.back();
    }
  };

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

  // Limpia el input del número si cambian de tipo de documento
  const seleccionarTipoDocumento = (doc: typeof TABLA_DOCUMENTO[number]) => {
    setDocumentoSeleccionado(doc);
    setNumDocumento(''); 
    setMostrarMenuDoc(false);
  };

  // --- CAMBIO 1: cálculo de si el formulario está completo ---
  // Apellido materno queda como opcional, igual que en la validación original.
  const formularioCompleto = Boolean(
    documentoSeleccionado &&
    numDocumento.trim().length === documentoSeleccionado.longitud &&
    nombres.trim().length > 0 &&
    apellidoPaterno.trim().length > 0 &&
    generoSeleccionado &&
    rolSeleccionado &&
    correo.trim().length > 0
  );

  const manejarRegistroAdmin = async () => {
    if (!documentoSeleccionado || !numDocumento || !nombres || !apellidoPaterno || !generoSeleccionado || !rolSeleccionado || !correo) {
      mostrarModal('error', 'Campos Incompletos', 'Por favor, completa todos los datos obligatorios.');
      return;
    }

    // Validación estricta de longitud por tipo de documento
    const longitudCorrecta = documentoSeleccionado.longitud;
    if (numDocumento.length !== longitudCorrecta) {
      mostrarModal(
        'error',
        'Documento Inválido',
        `El ${documentoSeleccionado.nombre_documento} debe tener exactamente ${longitudCorrecta} caracteres.`
      );
      return;
    }

    const payloadRegistroAdmin: RegisterAdminPayload = {
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
      },
      roles: [
        rolSeleccionado.id_rol 
      ]
    };

    try {
      setCargando(true);

      // --- CAMBIO 3: logs solo visibles en desarrollo, nunca en producción ---
      if (__DEV__) {
        console.log('Payload de Registro Admin:', payloadRegistroAdmin);
      }

      const respuesta = await usuarioService.registrarUsuarioAdmin(payloadRegistroAdmin);
      
      const data = respuesta?.data || respuesta;
      
      const mensajeBack = data?.mensaje || "Usuario registrado correctamente.";
      const passTemporal = data?.passwordTemporal || "";

      // Guarda la contraseña para copiarla cuando el usuario cierre el modal.
      // El mensaje ya NO incluye la contraseña en texto plano: se muestra
      // aparte, en una caja destacada (ver children del ModalMensaje).
      setPasswordTemporalPendiente(passTemporal);
      mostrarModal(
        'exito',
        '¡Registro Exitoso!',
        mensajeBack
      );

    } catch (error: any) {
      // --- CAMBIO 3: detalle técnico del error solo en desarrollo ---
      if (__DEV__) {
        console.log('Error de registro (debug):', error);
      }

      // --- CAMBIO 4: si el backend no entrega un mensaje específico
      // (p. ej. "El DNI ya existe"), no hay forma de detectarlo desde el
      // frontend; se muestra el mensaje genérico ya controlado. En cuanto
      // el backend agregue ese mensaje en error.response.data.mensaje,
      // se mostrará automáticamente sin tocar este código.
      const mensajeError = error.response?.data?.mensaje || "No se pudo completar el registro.";
      mostrarModal('error', 'Error en el Registro', mensajeError);
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
            style={[styles.backButton, { width: esPantallaGrande ? 165 : 140, height: esPantallaGrande ? 52 : 46 }]} 
            onPress={() => router.back()}
            disabled={cargando}
          >
            <View style={styles.backContent}>
              <ArrowLeft color="#FFF" size={esPantallaGrande ? 24 : 20} strokeWidth={3} />
              <Text style={[styles.backText, { fontSize: esPantallaGrande ? 18 : 16 }]} allowFontScaling={false}>VOLVER</Text>
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
          scrollEnabled={!cargando}
        >
          <Text style={[styles.title, { fontSize: esPantallaGrande ? 28 : 22 }]} allowFontScaling={false}>
            CREAR USUARIO (ADMIN)
          </Text>

          {/* --- CAMBIO 2: aviso de campos obligatorios --- */}
          <Text style={styles.notaObligatorio}>Los campos marcados con * son obligatorios</Text>

          <View style={styles.form}>
            {/* Tipo Documento */}
            <TouchableOpacity style={[styles.pickerField, mostrarMenuDoc && styles.pickerAbierto]} onPress={() => { setMostrarMenuDoc(!mostrarMenuDoc); setMostrarMenuGenero(false); setMostrarMenuRol(false); }}>
              <Text style={[styles.pickerText, !documentoSeleccionado && { color: '#94A3B8' }]}>
                {documentoSeleccionado ? documentoSeleccionado.nombre_documento : 'Tipo de Documento *'}
              </Text>
              {mostrarMenuDoc ? <ChevronUp color="#00AEEF" size={22} /> : <ChevronDown color="#94A3B8" size={22} />}
            </TouchableOpacity>

            {mostrarMenuDoc && (
              <View style={styles.dropdownContainer}>
                {TABLA_DOCUMENTO.map((item) => (
                  <TouchableOpacity key={item.id_documento} style={styles.dropdownOption} onPress={() => seleccionarTipoDocumento(item)}>
                    <Text style={styles.dropdownOptionText}>{item.nombre_documento}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Input de Documento Dinámico */}
            <View style={styles.inputWrapper}>
              <TextInput 
                style={styles.input} 
                placeholder={documentoSeleccionado ? `N° de Documento * (${documentoSeleccionado.longitud} dígitos)` : 'N° de Documento *'}
                keyboardType={documentoSeleccionado ? documentoSeleccionado.teclado : 'default'} 
                value={numDocumento} 
                onChangeText={setNumDocumento} 
                editable={!!documentoSeleccionado} 
                maxLength={documentoSeleccionado ? documentoSeleccionado.longitud : undefined}
                autoCapitalize={documentoSeleccionado?.id_documento !== 1 ? 'characters' : 'none'}
              />
            </View>

            <View style={styles.inputWrapper}><TextInput style={styles.input} placeholder="Nombres *" value={nombres} onChangeText={setNombres} /></View>
            <View style={styles.inputWrapper}><TextInput style={styles.input} placeholder="Apellido Paterno *" value={apellidoPaterno} onChangeText={setApellidoPaterno} /></View>
            <View style={styles.inputWrapper}><TextInput style={styles.input} placeholder="Apellido Materno" value={apellidoMaterno} onChangeText={setApellidoMaterno} /></View>

            {/* Género */}
            <TouchableOpacity style={[styles.pickerField, mostrarMenuGenero && styles.pickerAbierto]} onPress={() => { setMostrarMenuGenero(!mostrarMenuGenero); setMostrarMenuDoc(false); setMostrarMenuRol(false); }}>
              <Text style={[styles.pickerText, !generoSeleccionado && { color: '#94A3B8' }]}>
                {generoSeleccionado ? generoSeleccionado.nombre_genero : 'Género *'}
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

            {/* Selector de Rol */}
            <TouchableOpacity style={[styles.pickerField, mostrarMenuRol && styles.pickerAbierto]} onPress={() => { setMostrarMenuRol(!mostrarMenuRol); setMostrarMenuDoc(false); setMostrarMenuGenero(false); }}>
              <Text style={[styles.pickerText, !rolSeleccionado && { color: '#94A3B8' }]}>
                {rolSeleccionado ? rolSeleccionado.nombre_rol : 'Asignar Rol Directo *'}
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
            <View style={styles.inputWrapper}><TextInput style={styles.input} placeholder="Correo Electrónico *" keyboardType="email-address" autoCapitalize="none" value={correo} onChangeText={setCorreo} /></View>
          </View>
        </ScrollView>

        {!tecladoVisible && (
          <View style={[styles.fixedFooter, esPantallaGrande && styles.tabletContent]}>
            {/* --- CAMBIO 1: botón deshabilitado hasta que el formulario esté completo --- */}
            <TouchableOpacity 
              style={[
                styles.registerButton, 
                !formularioCompleto && styles.registerButtonDisabled
              ]} 
              onPress={manejarRegistroAdmin} 
              disabled={cargando || !formularioCompleto}
            >
              {cargando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.registerButtonText}>CREAR USUARIO</Text>}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Overlay que bloquea toda la pantalla mientras se crea el usuario:
          intercepta cualquier toque (selectores, inputs, botón volver, etc.)
          para evitar dobles envíos o navegación durante la petición. */}
      {cargando && (
        <View style={styles.overlayBloqueo} pointerEvents="auto">
          <ActivityIndicator size="large" color="#00AEEF" />
          <Text style={styles.overlayTexto}>Creando usuario...</Text>
        </View>
      )}

      <ModalMensaje
        visible={modalVisible}
        tipo={modalTipo}
        titulo={modalTitulo}
        mensaje={modalMensaje}
        onCerrar={cerrarModal}
        textoBoton={
          modalTipo === 'exito' && passwordTemporalPendiente
            ? 'COPIAR CONTRASEÑA Y CONTINUAR'
            : modalTipo === 'exito'
              ? 'CONTINUAR'
              : 'ENTENDIDO'
        }
      >
        {modalTipo === 'exito' && passwordTemporalPendiente ? (
          <View style={styles.cajaPassword}>
            <Text style={styles.cajaPasswordLabel}>CONTRASEÑA TEMPORAL</Text>
            <Text style={styles.cajaPasswordValor} selectable>
              {passwordTemporalPendiente}
            </Text>
            <Text style={styles.cajaPasswordAyuda}>
              Se copiará automáticamente al portapapeles al continuar
            </Text>
          </View>
        ) : null}
      </ModalMensaje>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  flexible: { flex: 1 },
header: { backgroundColor: '#C5D800', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, justifyContent: 'center', paddingHorizontal: 24, elevation: 3 },  backButton: { backgroundColor: '#FF007A', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  backContent: { flexDirection: 'row', alignItems: 'center' },
  backText: { color: '#FFF', fontWeight: '800', marginLeft: 4 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 30, paddingBottom: 120 }, 
  tabletContent: { maxWidth: 480, alignSelf: 'center', width: '100%' },
  title: { fontWeight: '900', color: '#00AEEF', textAlign: 'center', marginBottom: 6 },
  notaObligatorio: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginBottom: 24, fontWeight: '600' },
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
  registerButton: { backgroundColor: '#00AEEF', width: '100%', height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  registerButtonDisabled: { backgroundColor: '#CBD5E1' },
  registerButtonText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  cajaPassword: {
    width: '100%',
    backgroundColor: '#EFF9FF',
    borderWidth: 1.5,
    borderColor: '#00AEEF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  cajaPasswordLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  cajaPasswordValor: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 8,
  },
  cajaPasswordAyuda: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
  },
  overlayBloqueo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 250, 252, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    elevation: 999,
  },
  overlayTexto: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
});