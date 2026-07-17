import React, { useState, useEffect } from 'react'; 
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useAuth } from '../../context/AuthContext';
import { Calculator, Home } from 'lucide-react-native';
import { ModuloService } from '../../service/moduloService'; 

interface ModuloItem {
  idModulo: number;
  nombreModulo: string;
}

export default function ConsultaModulos() { 
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const router = useRouter();
  const insets = useSafeAreaInsets(); 
  const { user } = useAuth(); // Se removió logout de aquí ya que no se usa
  const { idLocal } = useLocalSearchParams();

  // Estados de la lista de módulos
  const [modulos, setModulos] = useState<ModuloItem[]>([]); 
  const [isLoading, setIsLoading] = useState(false); 
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [isAllLoaded, setIsAllLoaded] = useState(false);
  const TAMANO_PAGINA = 10; 
  
  // Estados para el Modal de Agregar Módulo
  const [modalVisible, setModalVisible] = useState(false);
  const [nombreModuloNuevo, setNombreModuloNuevo] = useState('');
  const [isSavingModulo, setIsSavingModulo] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      reiniciarYObtenerModulos();
    }
  }, [isFocused]);

  // Primera carga o pull-to-refresh
  const reiniciarYObtenerModulos = async () => {
    try {
      setIsLoading(true);
      setPage(0);
      setIsAllLoaded(false);
      console.log("Cargando módulos iniciales para idLocal:", idLocal);
      const response = await ModuloService.getModulosPorLocal(Number(idLocal), 0, TAMANO_PAGINA); 
      console.log("Respuesta de la API para la página inicial:", response);
      
      const listaModulos = response?.modulos || [];
      const totalPaginas = response?.totalPaginas || 1;
      const paginaActual = response?.paginaActual ?? 0;

      setModulos(listaModulos);

      if (response?.isLast || paginaActual >= totalPaginas - 1 || listaModulos.length < TAMANO_PAGINA) {
        setIsAllLoaded(true);
      }
    } catch (error) {
      console.error("Error cargando módulos iniciales:", error);
      Alert.alert("Error", "No se pudo obtener la lista de módulos.");
    } finally {
      setIsLoading(false);
    }
  };

  // Carga disparada por el scroll infinito
  const cargarMasModulos = async () => {
    if (isMoreLoading || isAllLoaded) return;

    try {
      setIsMoreLoading(true);
      const siguientePagina = page + 1;
      
      const response = await ModuloService.getModulosPorLocal(Number(idLocal), siguientePagina, TAMANO_PAGINA);
      console.log("Respuesta de la API para la página", siguientePagina, ":", response);
      const listaModulos = response?.modulos || [];
      const totalPaginas = response?.totalPaginas || 1;
      const paginaActual = response?.paginaActual ?? 0;

      if (listaModulos.length > 0) {
        setModulos(prevModulos => [...prevModulos, ...listaModulos]);
        setPage(siguientePagina);

        if (response?.isLast || paginaActual >= totalPaginas - 1 || listaModulos.length < TAMANO_PAGINA) {
          setIsAllLoaded(true);
        }
      } else {
        setIsAllLoaded(true);
      }
    } catch (error) {
      console.log("Error cargando más páginas de módulos: ", error);
    } finally {
      setIsMoreLoading(false);
    }
  };

  // Función para registrar el módulo en la API (Body: idLocal, nombreModulo)
  const handleGuardarModulo = async () => {
    if (!nombreModuloNuevo.trim()) {
      Alert.alert("Campo Requerido", "Por favor, ingresa el nombre del módulo.");
      return;
    }

    try {
      setIsSavingModulo(true); // Comienza animación de carga persistente

      // POST http://localhost:8080/api/modulos
      // Body estructurado exactamente como el JSON de tu Postman
      await ModuloService.registrarModulo({
        nombreModulo: nombreModuloNuevo.trim(),
        idLocal: Number(idLocal)
      });

      // Si todo sale bien, cerramos el modal, limpiamos y refrescamos de inmediato
      setModalVisible(false);
      setNombreModuloNuevo('');
      Alert.alert("Módulo Registrado", "El módulo ha sido creado exitosamente.");
      reiniciarYObtenerModulos(); 

    } catch (error: any) {
      console.error("Error al registrar módulo:", error);
      const msg = error.response?.data?.mensaje || "No se pudo establecer conexión para guardar el módulo.";
      Alert.alert("Error de guardado", msg);
    } finally {
      setIsSavingModulo(false); // Detiene la animación de carga
    }
  };

  const renderModuloItem = ({ item }: { item: ModuloItem }) => ( 
    <TouchableOpacity 
      style={styles.userCard} 
      activeOpacity={0.7}
      onPress={() => router.push({
        pathname: '/administrador/resumen', 
        params: { idModulo: item.idModulo, nombreModulo: item.nombreModulo }
      })} 
    > 
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{item.nombreModulo?.charAt(0).toUpperCase()}</Text>
      </View>

      <View style={styles.userInfo}> 
        <Text style={styles.userName} numberOfLines={1}>{item.nombreModulo}</Text> 
        <View style={styles.dniRow}> 
          <Ionicons name="layers-outline" size={14} color="#777" /> 
          <Text style={styles.userDni} numberOfLines={1}> ID Módulo: {item.idModulo}</Text> 
        </View> 
      </View> 

      <Ionicons name="chevron-forward" size={20} color="#006080" /> 
    </TouchableOpacity> 
  ); 

  const renderFooter = () => {
    if (!isMoreLoading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#006080" />
      </View>
    );
  };

  return ( 
    /* MODIFICADO: Se quitó paddingBottom de este contenedor principal */
    <View style={[styles.container, { paddingTop: insets.top }]}> 
      <StatusBar barStyle="light-content" backgroundColor="#C5D800" /> 
      
      {/* Header */} 
      <View style={styles.header}> 
        <View style={styles.headerTop}> 
          <View style={styles.adminInfo}> 
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }} 
              style={styles.adminAvatar} 
            /> 
            <View> 
              <Text style={styles.roleLabel}>Administrador</Text> 
              <Text style={styles.adminWelcome}>{user?.nombre || 'ADMINISTRADOR SISTEMA'}</Text> 
            </View> 
          </View> 
          {/* MODIFICADO: Cambiado el botón de salir por un botón de volver atrás */}
          <TouchableOpacity style={styles.logoutButton} onPress={() => router.back()} activeOpacity={0.8}> 
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" /> 
          </TouchableOpacity> 
        </View> 
        <Text style={styles.headerTitle}>Módulos</Text> 
      </View> 

      {/* Cuerpo de la Lista */}
      <View style={styles.content}> 
        <FlatList 
          data={modulos} 
          renderItem={renderModuloItem} 
          keyExtractor={item => item.idModulo.toString()} 
          contentContainerStyle={[styles.listContent, esPantallaGrande && styles.listContentGrande]} 
          showsVerticalScrollIndicator={false} 
          
          refreshing={isLoading}
          onRefresh={reiniciarYObtenerModulos}
          onEndReached={cargarMasModulos}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}

          ListEmptyComponent={
            !isLoading && (
              <View style={styles.emptyContainer}>
                <Ionicons name="grid-outline" size={54} color="#CCCCCC" />
                <Text style={styles.emptyText}>No hay módulos registrados en este centro</Text>
              </View>
            )
          }
        /> 
      </View> 

      {/* Burbuja Flotante de Agregar (Abre el Modal nativo) */}
      {/* MODIFICADO: Se calcula la posición sumando el insets.bottom directo en línea */}
      <TouchableOpacity 
        style={[styles.fabButton, { bottom: 88 + insets.bottom }]} 
        activeOpacity={0.85}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#006080" />
      </TouchableOpacity>

      {/* MODAL NATIVO INTERACTIVO DE AGREGAR MÓDULO */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          if (!isSavingModulo) setModalVisible(false);
        }}
      >
        <KeyboardAvoidingView 
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContainer}>
            {/* Header del Modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Crear Nuevo Módulo</Text>
              {!isSavingModulo && (
                <TouchableOpacity onPress={() => { setModalVisible(false); setNombreModuloNuevo(''); }}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>

            {/* Formulario */}
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Nombre del Módulo *</Text>
              <TextInput
                style={[styles.modalInput, isSavingModulo && styles.modalInputDisabled]}
                placeholder="Ej. Modulo A"
                placeholderTextColor="#94A3B8"
                value={nombreModuloNuevo}
                onChangeText={setNombreModuloNuevo}
                editable={!isSavingModulo}
                autoFocus={true}
              />

              {/* Botón de envío con estado de carga interactivo */}
              <TouchableOpacity
                style={[
                  styles.modalSubmitButton,
                  (!nombreModuloNuevo.trim() || isSavingModulo) && styles.modalSubmitButtonDisabled
                ]}
                onPress={handleGuardarModulo}
                disabled={!nombreModuloNuevo.trim() || isSavingModulo}
                activeOpacity={0.8}
              >
                {isSavingModulo ? (
                  <View style={styles.rowLoading}>
                    <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.modalSubmitButtonText}>Guardando en el servidor...</Text>
                  </View>
                ) : (
                  <Text style={styles.modalSubmitButtonText}>Guardar Módulo</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Navegación Inferior (3 Botones) */} 
      <View style={[styles.bottomNav, { height: 68 + insets.bottom, paddingBottom: insets.bottom }]}> 
        {/* Botón 1: Inicio */}
        <TouchableOpacity style={styles.navItem} activeOpacity={0.6} onPress={() => router.push('/administrador/inicio')}> 
          <Ionicons name="home-outline" size={22} color="#757575" /> 
          <Text style={styles.navLabel}>Inicio</Text> 
        </TouchableOpacity> 

        {/* Botón 2: Pendientes (Pantalla Actual Activa) */}
        <TouchableOpacity style={styles.navItem} activeOpacity={0.6} onPress={() => router.push('/administrador/consultas')}> 
          <Ionicons name="people" size={22} color="#006080" /> 
          <Text style={[styles.navLabel, { color: '#006080', fontWeight: 'bold' }]}>Pendientes</Text> 
        </TouchableOpacity> 

        {/* Botón 3: Calculadora / Consultas */}
        <TouchableOpacity style={styles.navItem} activeOpacity={0.6} onPress={() => router.push('/administrador/calculadora/categoriaCalculadora')}> 
          <Ionicons name="calculator-outline" size={22} color="#757575" /> 
          <Text style={styles.navLabel}>Calculadora</Text> 
        </TouchableOpacity> 
      </View> 
    </View> 
  ); 
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' }, 
  header: { 
    backgroundColor: '#C5D800', 
    paddingTop: 20, 
    paddingHorizontal: 20, 
    paddingBottom: 40, 
    borderBottomRightRadius: 60 
  }, 
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }, 
  adminInfo: { flexDirection: 'row', alignItems: 'center' }, 
  adminAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#FFFFFF', marginRight: 10 }, 
  roleLabel: { fontSize: 10, color: '#006080', fontWeight: 'bold' }, 
  adminWelcome: { fontSize: 18, color: '#006080', fontWeight: '900' }, 
  logoutButton: { 
    backgroundColor: '#FF007A', 
    width: 38, 
    height: 38, 
    borderRadius: 19, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 2 
  }, 
  headerTitle: { fontSize: 26, color: '#006080', fontWeight: '900', marginTop: 10 }, 
  content: { flex: 1 }, 
  listContent: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 15 }, 
  listContentGrande: { maxWidth: 800, alignSelf: 'center', width: '100%' },
  userCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12, 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4 
  }, 
  avatarPlaceholder: { 
    width: 52, height: 52, borderRadius: 26, 
    marginRight: 15, backgroundColor: '#006080', 
    justifyContent: 'center', alignItems: 'center' 
  },
  avatarText: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  userInfo: { flex: 1, paddingRight: 10 }, 
  userName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 }, 
  dniRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 }, 
  userDni: { fontSize: 13, color: '#64748B' }, 
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyText: { color: '#999', marginTop: 12, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  footerLoader: { paddingVertical: 15, alignItems: 'center' },
  fabButton: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#C5D800',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 99,
  },
  bottomNav: { 
    flexDirection: 'row', height: 72, backgroundColor: '#FFFFFF', 
    borderTopWidth: 1, borderTopColor: '#E2E8F0', 
    position: 'absolute', bottom: 0, width: '100%',
    paddingBottom: 4, elevation: 8, shadowColor: '#000', 
    shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 3,
  }, 
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' }, 
  navLabel: { fontSize: 11, marginTop: 4, color: '#757575' },

  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#006080',
  },
  modalBody: {
    width: '100%',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 15,
    color: '#333333',
    marginBottom: 10,
  },
  modalInputDisabled: {
    backgroundColor: '#E2E8F0',
    color: '#64748B',
  },
  modalHelpText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 24,
  },
  modalSubmitButton: {
    backgroundColor: '#C5D800',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  modalSubmitButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  modalSubmitButtonText: {
    color: '#006080',
    fontSize: 15,
    fontWeight: 'bold',
  },
  rowLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  }
});