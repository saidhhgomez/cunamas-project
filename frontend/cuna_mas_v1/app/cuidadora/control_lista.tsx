import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList,
  TextInput,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  useWindowDimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { ArrowLeft, Plus, ChevronDown } from 'lucide-react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Importación de servicios y componentes
import { CategoriaService } from '../../service/categoriaService';
import { AsistenciaService } from '../../service/asistenciaService';
import BottomNavMadre from '../components/cuidadora/BottomNavMadre';
import ModalMensaje, { TipoModalMensaje } from '../components/ModalMensaje';

const COLORES_CATEGORIAS: Record<number, string> = {
  1: '#B7C900',
  2: '#F57C00',
  3: '#009B16',
  4: '#2F75B5',
  5: '#9C27B0',
};

const OPCIONES_TURNO = [
  { id: 1, nombre: 'Media Mañana' }
];

const MAX_DIGITOS_CANTIDAD = 3;

export default function AsistenciaStatsScreen() {
  const router = useRouter();
  const { user } = useAuth(); 
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const params = useLocalSearchParams();
  const idModuloReal = params.idModulo ? Number(params.idModulo) : 1; 
  const nombreModuloReal = params.nombreModulo ? String(params.nombreModulo) : "MÓDULO CIAI";

  const esPantallaGrande = width > 600;

  const [categorias, setCategorias] = useState<any[]>([]);
  const [valoresAsistencia, setValoresAsistencia] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [turnoSeleccionado, setTurnoSeleccionado] = useState(OPCIONES_TURNO[0]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);

  // Estado para controlar el ModalMensaje
  const [modalConfig, setModalConfig] = useState<{
    visible: boolean;
    tipo: TipoModalMensaje;
    titulo: string;
    mensaje: string;
    onCerrar: () => void;
  }>({
    visible: false,
    tipo: 'exito',
    titulo: '',
    mensaje: '',
    onCerrar: () => {},
  });

  const mostrarMensajeModal = (
    tipo: TipoModalMensaje, 
    titulo: string, 
    mensaje: string, 
    onCerrarCallback?: () => void
  ) => {
    setModalConfig({
      visible: true,
      tipo,
      titulo,
      mensaje,
      onCerrar: () => {
        setModalConfig(prev => ({ ...prev, visible: false }));
        if (onCerrarCallback) onCerrarCallback();
      }
    });
  };

  // Función utilitaria para reiniciar los campos a "0"
  const limpiarFormulario = useCallback((listaCategorias: any[]) => {
    const mapaInicial: { [key: number]: string } = {};
    listaCategorias.forEach((cat: any) => {
      mapaInicial[cat.idCategoriaGrupo] = "0";
    });
    setValoresAsistencia(mapaInicial);
  }, []);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const datosCategorias = await CategoriaService.getListaCategorias();
        setCategorias(datosCategorias);
        limpiarFormulario(datosCategorias);
      } catch (error) {
        console.error("Error al cargar categorías de asistencia:", error);
        mostrarMensajeModal(
          "error", 
          "Error de Sincronización", 
          "No se pudo sincronizar el catálogo de rangos de edad."
        );
      } finally {
        setLoading(false);
      }
    };

    cargarCategorias();
  }, [idModuloReal, limpiarFormulario]);

  // Limpia el formulario automáticamente cada vez que la pantalla toma foco
  useFocusEffect(
    useCallback(() => {
      if (categorias.length > 0) {
        limpiarFormulario(categorias);
      }
    }, [categorias, limpiarFormulario])
  );

  const manejarRetornoSeguro = () => {
    router.back();
  };

  const manejarCambioCantidad = (idCategoriaGrupo: number, texto: string) => {
    const textoLimpio = texto.replace(/[^0-9]/g, '').slice(0, MAX_DIGITOS_CANTIDAD);
    setValoresAsistencia(prev => ({
      ...prev,
      [idCategoriaGrupo]: textoLimpio
    }));
  };

const manejarGuardarAsistencia = async () => {
    setEnviando(true); 
    try {
      const categoriasPayload = categorias.map((cat) => ({
        idCategoriaGrupo: cat.idCategoriaGrupo,
        cantidad: Number(valoresAsistencia[cat.idCategoriaGrupo] || 0)
      }));

      const payload = {
        idModulo: idModuloReal,
        idUsuarioCreacion: user?.idPersona || 1, 
        registroCorrelativo: turnoSeleccionado.id, 
        categorias: categoriasPayload
      };

      // Si el servidor responde con 403 o 500, el throw del service hará saltar al CATCH de aquí
      await AsistenciaService.registrarAsistenciaCiai(payload);
      
      // Limpiar formulario tras éxito
      limpiarFormulario(categorias);

      mostrarMensajeModal(
        "exito", 
        "¡Éxito!", 
        "Asistencia de raciones agregada correctamente.",
        manejarRetornoSeguro
      );
    } catch (error: any) {
      // Extraer un mensaje 100% seguro y amigable para el usuario
      let mensajeAmigable = "Hubo un problema al guardar el registro en el servidor.";
      let tituloModal = "Error al guardar";

      if (error?.response?.status === 403) {
        tituloModal = "Acceso Denegado";
        mensajeAmigable = "No tienes permisos para realizar esta acción o tu sesión ha expirado.";
      } else if (error?.response?.data?.message && typeof error.response.data.message === 'string') {
        mensajeAmigable = error.response.data.message;
      }

      // Pasar SOLO texto limpio al modal
      mostrarMensajeModal("error", tituloModal, mensajeAmigable);
    } finally {
      setEnviando(false); 
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer} accessible={false}>
        <ActivityIndicator size="large" color="#006080" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#C5D800" />
      
      {/* Header Fijo */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={manejarRetornoSeguro}
            activeOpacity={0.85}
          >
            <View style={styles.backContent}>
              <ArrowLeft color="#FFF" size={18} strokeWidth={3} />
              <Text style={styles.backText} allowFontScaling={false}>VOLVER</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Barra de título blanca */}
      <View style={styles.titleBar}>
        <Text style={styles.headerTitle} allowFontScaling={false}>
          {nombreModuloReal.toUpperCase()}
        </Text>
      </View>

      {/* Contenedor adaptativo para el teclado */}
      <KeyboardAvoidingView
        style={styles.flexible}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 110 : 0}
      >
        <FlatList
          data={categorias}
          keyExtractor={(item) => item.idCategoriaGrupo.toString()}
          contentContainerStyle={[
            styles.scrollContent, 
            esPantallaGrande && styles.tabletContent,
            { paddingBottom: 140 + insets.bottom }
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          
          ListHeaderComponent={
            <View style={styles.headerComponentContainer}>
              {/* Selector de Turno */}
              <View style={styles.comboWrapper}>
                <TouchableOpacity 
                  style={styles.comboSelector} 
                  activeOpacity={0.9}
                  onPress={() => setMostrarDropdown(true)}
                >
                  <Text style={styles.comboSelectorText}>{turnoSeleccionado.nombre}</Text>
                  <ChevronDown color="#64748B" size={20} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>
          }
          
          renderItem={({ item, index }) => {
            const colorNumero = COLORES_CATEGORIAS[item.idCategoriaGrupo] || '#64748B';
            const nombreLimpio = item.nombreCategoria?.toLowerCase().trim();
            const esActorComunal = nombreLimpio === 'actor comunal';

            return (
              <View style={styles.cardItem}>
                <Text style={[styles.statLabel, { fontSize: esPantallaGrande ? 16 : 15 }]}>
                  {esActorComunal ? item.nombreCategoria : `Niños de ${item.nombreCategoria}`}
                </Text>
                
                <View style={[styles.inputContainer, { backgroundColor: colorNumero, borderColor: colorNumero }]}> 
                  <TextInput
                    style={[styles.statInput, { color: '#FFFFFF', fontSize: esPantallaGrande ? 24 : 20 }]}
                    keyboardType="numeric"
                    value={valoresAsistencia[item.idCategoriaGrupo] ?? ""}
                    onChangeText={(texto) => manejarCambioCantidad(item.idCategoriaGrupo, texto)}
                    selectTextOnFocus
                    editable={!enviando}
                    maxLength={MAX_DIGITOS_CANTIDAD}
                    scrollEnabled={false}
                    maxFontSizeMultiplier={1.15}
                  />
                </View>
              </View>
            );
          }}

          ListFooterComponent={
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={manejarGuardarAsistencia}
              activeOpacity={0.85}
            >
              <View style={styles.submitContent}>
                <Plus color="#FFF" size={20} strokeWidth={3} />
                <Text style={styles.submitText}>AGREGAR</Text>
              </View>
            </TouchableOpacity>
          }
        />
      </KeyboardAvoidingView>

      {/* Navegación Inferior */}
      <BottomNavMadre rutaActual="/cuidadora/control_lista" insetsBottom={insets.bottom} />

      {/* MODAL DEL COMBOBOX */}
      <Modal
        visible={mostrarDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMostrarDropdown(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMostrarDropdown(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalDropdownMenu, esPantallaGrande && { maxWidth: 460 }]}>
              <Text style={styles.modalTitle}>Selecciona un Turno</Text>
              {OPCIONES_TURNO.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.dropdownItem,
                    turnoSeleccionado.id === item.id && styles.dropdownItemActive
                  ]}
                  onPress={() => {
                    setTurnoSeleccionado(item);
                    setMostrarDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    turnoSeleccionado.id === item.id && styles.dropdownItemTextActive
                  ]}>
                    {item.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL DE CARGA ABSOLUTA */}
      <Modal
        visible={enviando}
        transparent={true}
        animationType="none"
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#FF0080" />
            <Text style={styles.loadingText}>Guardando asistencia...</Text>
          </View>
        </View>
      </Modal>

      {/* MODAL DE MENSAJE (ÉXITO / ERROR / ADVERTENCIA) */}
      <ModalMensaje
        visible={modalConfig.visible}
        tipo={modalConfig.tipo}
        titulo={modalConfig.titulo}
        mensaje={modalConfig.mensaje}
        onCerrar={modalConfig.onCerrar}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#C5D800' 
  },
  flexible: {
    flex: 1,
    backgroundColor: '#F9F9F9'
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F9F9F9' 
  },
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
  backContent: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  backText: { 
    color: '#FFF', 
    fontWeight: '800', 
    marginLeft: 4,
    fontSize: 20,
  },
  titleBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    minHeight: 78,
  },
  headerTitle: {
    fontSize: 22,
    lineHeight: 28,
    color: '#006080',
    fontWeight: '900',
    textAlign: 'center',
    flexShrink: 1,
  },
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingTop: 20,
    width: '100%' 
  },
  tabletContent: { 
    maxWidth: 500, 
    alignSelf: 'center' 
  },
  headerComponentContainer: {
    marginBottom: 20,
  },
  comboWrapper: {
    width: '100%',
    marginBottom: 10,
  },
  comboSelector: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  comboSelectorText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)', 
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  modalDropdownMenu: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 10
  },
  dropdownItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
  },
  dropdownItemActive: {
    backgroundColor: '#F8FAFC',
  },
  dropdownItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  dropdownItemTextActive: {
    color: '#FF0080',
    fontWeight: '800',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  cardItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#FFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1.5 
  },
  statLabel: { 
    fontWeight: '700', 
    color: '#334155', 
    flex: 1, 
    paddingRight: 8,
  },
  inputContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    width: 68,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2, 
    flexShrink: 0,
  },
  statInput: { 
    fontWeight: '900', 
    textAlign: 'center', 
    textAlignVertical: 'center',
    width: '100%',
    height: '100%',
    padding: 0,
    includeFontPadding: false,
    flexShrink: 0,
  },
  submitButton: { 
    backgroundColor: '#FF0080', 
    height: 52, 
    borderRadius: 26, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 20, 
    shadowColor: '#FF0080', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 5, 
    elevation: 4 
  },
  submitContent: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  submitText: { 
    color: '#FFF', 
    fontWeight: '800', 
    fontSize: 16, 
    marginLeft: 6, 
    letterSpacing: 0.5 
  },
});
