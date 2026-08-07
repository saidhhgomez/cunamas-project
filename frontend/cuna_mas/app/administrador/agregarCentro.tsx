import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Keyboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LocalService } from '../../service/centroAtencionService'; 
import { DistritoService, DistritoResponse } from '../../service/direccion'; 
import ModalMensaje, { TipoModalMensaje } from '../components/ModalMensaje';

export default function AgregarLocal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);

  // Guardamos el ID del centro alimentario que llega por parámetro
  const idCentroAlimentarioConstante = params.idCentroAlimentario ? Number(params.idCentroAlimentario) : null;

  // Estados del formulario
  const [localNombre, setLocalNombre] = useState('');
  const [nombreDireccion, setNombreDireccion] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Estados para la búsqueda asíncrona de Distritos
  const [busquedaDistrito, setBusquedaDistrito] = useState('');
  const [distritoSeleccionado, setDistritoSeleccionado] = useState<DistritoResponse | null>(null);
  const [listaDistritos, setListaDistritos] = useState<DistritoResponse[]>([]);
  const [buscandoDistrito, setBuscandoDistrito] = useState(false);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Control del Scroll principal y teclado
  const [scrollPrincipalHabilitado, setScrollPrincipalHabilitado] = useState(true);
  const [tecladoVisible, setTecladoVisible] = useState(false);
  const [buscadorY, setBuscadorY] = useState(0);

  // Estados del modal de resultado (reemplaza a Alert.alert)
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState<TipoModalMensaje>('error');
  const [modalTitulo, setModalTitulo] = useState('');
  const [modalMensaje, setModalMensaje] = useState('');
  // Si es true, al cerrar el modal navegamos hacia atrás (caso de éxito)
  const [cerrarYVolver, setCerrarYVolver] = useState(false);

  const mostrarModal = (tipo: TipoModalMensaje, titulo: string, mensaje: string, volverAlCerrar = false) => {
    setModalTipo(tipo);
    setModalTitulo(titulo);
    setModalMensaje(mensaje);
    setCerrarYVolver(volverAlCerrar);
    setModalVisible(true);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    if (cerrarYVolver) {
      router.back();
    }
  };

  // Listener para saber si el teclado está activo
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setTecladoVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setTecladoVisible(false));

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Búsqueda con debounce para Distritos
  useEffect(() => {
    if (busquedaDistrito.trim().length < 2 || (distritoSeleccionado && busquedaDistrito === `${distritoSeleccionado.distrito} (${distritoSeleccionado.provincia})`)) {
      setListaDistritos([]);
      setMostrarSugerencias(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        setBuscandoDistrito(true);
        const resultados = await DistritoService.buscarDistritos(busquedaDistrito);
        setListaDistritos(resultados);
        setMostrarSugerencias(resultados.length > 0);
        
        if (resultados.length > 0) {
          scrollViewRef.current?.scrollTo({ y: buscadorY - 60, animated: true });
        }
      } catch (err) {
        console.log("ERROR BUSCANDO DISTRITO:", err);
      } finally {
        setBuscandoDistrito(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [busquedaDistrito]);

  const handleSeleccionarDistrito = (distrito: DistritoResponse) => {
    setDistritoSeleccionado(distrito);
    setBusquedaDistrito(`${distrito.distrito} (${distrito.provincia})`);
    setMostrarSugerencias(false);
    setScrollPrincipalHabilitado(true);
    Keyboard.dismiss(); 
  };

  const handleGuardarLocal = async () => {
    // Validaciones de formulario esenciales
    if (!idCentroAlimentarioConstante) {
      mostrarModal('error', 'Error de Origen', 'No se identificó el ID del Centro Alimentario asociado. Regrese e intente de nuevo.');
      return;
    }

    if (!distritoSeleccionado || !nombreDireccion.trim() || !localNombre.trim()) {
      mostrarModal('error', 'Campos incompletos', 'Por favor, complete todos los campos requeridos.');
      return;
    }

    try {
      setIsSaving(true); // 🔒 Activa el bloqueo total de pantalla
      Keyboard.dismiss();
      
      // Paso 1: Registrar la dirección física usando el distrito seleccionado
      console.log("Paso 1: Registrando dirección en la API...");
      const resDireccion = await DistritoService.registrarDireccion({
        idDistrito: distritoSeleccionado.idDistrito,
        nombreDireccion: nombreDireccion.trim()
      });

      const idDireccionGenerado = resDireccion.idGenerado;

      if (!idDireccionGenerado) {
        throw new Error("No se pudo obtener el ID de la dirección creada.");
      }

      console.log(`Paso 1 Completado. ID Dirección Generado: ${idDireccionGenerado}`);
      console.log("Paso 2: Enlazando y registrando el Local Infantil...");

      // Paso 2: Registrar el Local usando el ID de la dirección generada del Paso 1
      await LocalService.registrarLocalBasico({
        idDireccion: idDireccionGenerado, 
        idCentroAlimentario: idCentroAlimentarioConstante,
        localNombre: localNombre.trim()
      });

      console.log("Paso 2 Completado con éxito.");

      mostrarModal(
        'exito',
        '¡Registro Exitoso!',
        `El local "${localNombre}" ha sido guardado correctamente.`,
        true // al cerrar, volvemos a la pantalla anterior
      );

    } catch (error: any) {
      console.error("Error durante el flujo de registro del local:", error);
      const mensajeError = error.response?.data?.mensaje || error.message || "Fallo en la comunicación con el servidor.";
      mostrarModal('error', 'Error al registrar', mensajeError);
    } finally {
      setIsSaving(false); // 🔓 Libera la pantalla pase lo que pase
    }
  };

  // El botón de registro se desactiva si falta algún dato o se está procesando el guardado
  const botonDeshabilitado = isSaving || !localNombre.trim() || !distritoSeleccionado || !nombreDireccion.trim();

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
    >
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Barra superior de navegación */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} disabled={isSaving}>
            <Ionicons name="arrow-back" size={24} color={isSaving ? '#CBD5E1' : '#006080'} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nuevo Local Infantil</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Contenedor intermedio relativo */}
        <View style={{ flex: 1, position: 'relative' }}>
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            scrollEnabled={scrollPrincipalHabilitado}
          >
            <Text style={styles.sectionTitle}>Detalles del Local</Text>

            <View style={styles.labelRow}>
              <Text style={styles.label}>Nombre del Local</Text>
              <Text style={styles.requiredMark}>*</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ej. CIAI VES Primero"
              placeholderTextColor="#94A3B8"
              value={localNombre}
              editable={!isSaving}
              onChangeText={(txt) => {
                setLocalNombre(txt);
                if (distritoSeleccionado) setMostrarSugerencias(false);
              }}
            />

            {/* SECCIÓN DE UBICACIÓN Y BÚSQUEDA ASÍNCRONA */}
            <Text style={styles.sectionTitle}>Ubicación y Geografía</Text>

            <View style={styles.labelRow}>
              <Text style={styles.label}>Buscar Distrito</Text>
              <Text style={styles.requiredMark}>*</Text>
            </View>
            <View 
              style={styles.searchContainer}
              onLayout={(event) => {
                const layout = event.nativeEvent.layout;
                setBuscadorY(layout.y); 
              }}
            >
              <View style={styles.searchSection}>
                <TextInput
                  style={[styles.input, { marginBottom: 0, flex: 1, paddingRight: 45 }]}
                  placeholder="Escriba un distrito para buscar..."
                  placeholderTextColor="#94A3B8"
                  value={busquedaDistrito}
                  editable={!isSaving}
                  onChangeText={(text) => {
                    setBusquedaDistrito(text);
                    if (distritoSeleccionado && text !== `${distritoSeleccionado.distrito} (${distritoSeleccionado.provincia})`) {
                      setDistritoSeleccionado(null);
                    }
                  }}
                />
                
                <View style={styles.searchIconContainer}>
                  {buscandoDistrito ? (
                    <ActivityIndicator size="small" color="#006080" />
                  ) : (
                    <Ionicons name="search" size={20} color="#64748B" />
                  )}
                </View>
              </View>
            </View>

            <View style={styles.labelRow}>
              <Text style={styles.label}>Dirección Exacta</Text>
              <Text style={styles.requiredMark}>*</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ej. Av. El Sol 1443"
              placeholderTextColor="#94A3B8"
              value={nombreDireccion}
              editable={!isSaving}
              onChangeText={(txt) => {
                setNombreDireccion(txt);
                if (distritoSeleccionado) setMostrarSugerencias(false);
              }}
            />

            {/* Botón de envío */}
            <TouchableOpacity 
              style={[
                styles.submitButton, 
                botonDeshabilitado && styles.submitButtonDisabled
              ]} 
              onPress={handleGuardarLocal}
              disabled={botonDeshabilitado}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={[styles.submitButtonText, botonDeshabilitado && { color: '#94A3B8' }]}>Registrar Local</Text>
              )}
            </TouchableOpacity>

          </ScrollView>

          {/* LISTA FLOTANTE INTELIGENTE DE DISTRITOS */}
          {mostrarSugerencias && !isSaving && (
            <View 
              style={[
                styles.suggestionsContainer, 
                tecladoVisible 
                  ? { bottom: (450 - buscadorY) } 
                  : { top: buscadorY + 68 }      
              ]}
              onTouchStart={() => setScrollPrincipalHabilitado(false)}
              onTouchEnd={() => setScrollPrincipalHabilitado(true)}
              onCancel={() => setScrollPrincipalHabilitado(true)}
            >
              <FlatList
                data={listaDistritos}
                keyExtractor={(item) => item.idDistrito.toString()}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="always"
                style={{ maxHeight: 160 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => handleSeleccionarDistrito(item)}
                  >
                    <Ionicons name="location-sharp" size={16} color="#006080" style={{ marginRight: 8 }} />
                    <Text style={styles.suggestionText} numberOfLines={1}>
                      {item.distrito}, {item.provincia} - <Text style={styles.ubigeoText}>Ubigeo {item.ubigeo}</Text>
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

        </View>

        {/* 🔒 CAPA DE BLOQUEO ABSOLUTO DE PANTALLA MIENTRAS SE GUARDA */}
        {isSaving && (
          <View style={styles.blockingOverlay}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#006080" />
              <Text style={styles.blockingText}>Registrando local...</Text>
              <Text style={styles.blockingSubtext}>Por favor, no cierre la aplicación</Text>
            </View>
          </View>
        )}
      </View>

      {/* Modal de resultado (éxito / error) */}
      <ModalMensaje
        visible={modalVisible}
        tipo={modalTipo}
        titulo={modalTitulo}
        mensaje={modalMensaje}
        onCerrar={cerrarModal}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: { 
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#006080' 
  },
  scrollContent: { 
    padding: 24, 
    paddingBottom: 60 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: '#006080', 
    marginTop: 15, 
    marginBottom: 16 
  },
  // Fila de label + asterisco, unificada para los 3 campos obligatorios
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#475569', 
  },
  requiredMark: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FF0080',
    marginLeft: 3,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 15,
    color: '#333333',
    marginBottom: 20,
  },
  searchContainer: { 
    position: 'relative', 
    marginBottom: 20 
  },
  searchSection: { 
    flexDirection: 'row', 
    position: 'relative', 
    alignItems: 'center' 
  },
  searchIconContainer: { 
    position: 'absolute', 
    right: 14, 
    height: '100%', 
    justifyContent: 'center',
    alignItems: 'center'
  },
  suggestionsContainer: {
    position: 'absolute',
    left: 24,
    right: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    zIndex: 99999,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  suggestionText: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
    fontWeight: '500',
  },
  ubigeoText: { 
    fontSize: 12, 
    color: '#64748B' 
  },
  submitButton: {
    backgroundColor: '#C5D800',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    elevation: 2,
  },
  submitButtonDisabled: { 
    backgroundColor: '#E2E8F0' 
  },
  submitButtonText: { 
    color: '#006080', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },

  // Estilos de la Capa de Bloqueo Total (mismo patrón usado en otras pantallas)
  blockingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingBox: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
    maxWidth: 320,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  blockingText: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  blockingSubtext: {
    marginTop: 5,
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
  }
});