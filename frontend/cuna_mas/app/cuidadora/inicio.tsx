import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
  Modal,
  TextInput,
  Alert,
  StatusBar
} from 'react-native';
import { UserRound, User, LogOut, Home, Calculator, RefreshCw, WifiOff, MapPin } from 'lucide-react-native';
import { LocalService } from '../../service/centroAtencionService'; 
import { DistritoService, DistritoResponse, DireccionRequest } from '../../service/direccion'; 
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HeaderMadre from '../components/cuidadora/HeaderMadre';
import BottomNavMadre from '../components/cuidadora/BottomNavMadre';
import IndicadorLateralScroll from '../components/admin/IndicadorLateralScroll';

const TAMANO_PAGINA = 10;

export default function InicioCuidadora() {
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();
  const insets = useSafeAreaInsets(); 

  const [locales, setLocales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [errorRed, setErrorRed] = useState(false); 
  const RUTA_ACTUAL = '/cuidadora/inicio';

  // --- ESTADOS PARA PAGINACIÓN (scroll infinito real) ---
  const [pagina, setPagina] = useState(0);
  const [esUltimaPagina, setEsUltimaPagina] = useState(false);
  const [isCargandoMas, setIsCargandoMas] = useState(false);
  const [totalRegistros, setTotalRegistros] = useState<number | null>(null);

  // --- ESTADOS PARA EL INDICADOR LATERAL DE SCROLL ---
  const [progresoScroll, setProgresoScroll] = useState(0);
  const [indicadorVisible, setIndicadorVisible] = useState(false);
  const timeoutOcultarRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Estados para el Modal de Registro de Dirección
  const [mostrarModalUbicacion, setMostrarModalUbicacion] = useState(false);
  const [busquedaDistrito, setBusquedaDistrito] = useState('');
  const [distritosFiltrados, setDistritosFiltrados] = useState<DistritoResponse[]>([]);
  const [distritoSeleccionado, setDistritoSeleccionado] = useState<DistritoResponse | null>(null);
  const [direccionFisica, setDireccionFisica] = useState('');
  const [guardandoDireccion, setGuardandoDireccion] = useState(false);

  // Evalúa si se debe abrir el modal según el estado del backend
  useEffect(() => {
    if (user && user.tieneDireccion === false) {
      setMostrarModalUbicacion(true);
    } else {
      setMostrarModalUbicacion(false);
    }
  }, [user?.tieneDireccion]);

  // Lógica de búsqueda de Distritos (Debounce)
  useEffect(() => {
    if (distritoSeleccionado) return;

    if (busquedaDistrito.trim().length < 3) {
      setDistritosFiltrados([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const data = await DistritoService.buscarDistritos(busquedaDistrito);
        setDistritosFiltrados(data);
      } catch (error) {
        console.warn("Error al buscar coincidencias de distritos.");
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [busquedaDistrito, distritoSeleccionado]);

  const reintentarConexion = () => {
    setLocales([]);
    setIsInitialLoad(true);
    setErrorRed(false);
  };

  // Reinicia a página 0 (primera carga, pull-to-refresh, o reintentar)
  const reiniciarYObtenerLocales = async () => {
    setPagina(0);
    setEsUltimaPagina(false);
    await cargarLocales(0, true);
  };

  const cargarLocales = async (numPagina: number, reiniciar = false) => {
    const distritoUsuario = user?.distrito;
    if (loading) return;

    setLoading(true);
    try {
      // ⚠️ LocalService.getLocalesPorCentro ahora recibe (distrito, page, size).
      // Actualiza la firma de esta función en centroAtencionService.ts para
      // que envíe page/size al backend, igual que getLocalesPorCentroPaginado.
      const response = await LocalService.getLocalesPorCentro(distritoUsuario, numPagina, TAMANO_PAGINA);

      // Spring Page<T> trae { content, last, totalElements, ... }.
      // Mantenemos el fallback por si el backend devuelve un array plano.
      const content = response?.content ?? (Array.isArray(response) ? response : []);
      const esUltima = typeof response?.last === 'boolean' ? response.last : content.length < TAMANO_PAGINA;
      const total = response?.totalElements ?? content.length;

      if (reiniciar) {
        setLocales(content);
      } else {
        // Concatena en vez de reemplazar, para no perder lo ya cargado
        setLocales(prev => [...prev, ...content]);
      }
      setEsUltimaPagina(esUltima);
      setTotalRegistros(total);
      setErrorRed(false);
    } catch (error) {
      console.warn("⚠️ Servidor desconectado o IP incorrecta.");
      if (isInitialLoad) {
        setErrorRed(true);
      }
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  // Disparador cuando llegas al final de la lista (scroll infinito)
  const cargarMasElementos = async () => {
    if (isCargandoMas || esUltimaPagina || loading) return;

    setIsCargandoMas(true);
    const siguientePagina = pagina + 1;
    setPagina(siguientePagina);
    await cargarLocales(siguientePagina, false);
    setIsCargandoMas(false);
  };

  // Calcula el progreso (0-1) del scroll y controla la visibilidad del
  // indicador lateral; se oculta solo 800ms después de dejar de scrollear.
  const manejarScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const maxScroll = Math.max(contentSize.height - layoutMeasurement.height, 1);
    const progreso = contentOffset.y / maxScroll;

    setProgresoScroll(progreso);
    setIndicadorVisible(true);

    if (timeoutOcultarRef.current) clearTimeout(timeoutOcultarRef.current);
    timeoutOcultarRef.current = setTimeout(() => setIndicadorVisible(false), 800);
  };

  useEffect(() => {
    return () => {
      if (timeoutOcultarRef.current) clearTimeout(timeoutOcultarRef.current);
    };
  }, []);

  useEffect(() => {
    if (user?.tieneDireccion === true && user?.distrito) {
      reiniciarYObtenerLocales();
    }
  }, [user?.distrito, user?.tieneDireccion, isInitialLoad]);

  const manejarGuardarDireccion = async () => {
    if (!distritoSeleccionado || !direccionFisica) return;

    setGuardandoDireccion(true);
    try {
      const payload: DireccionRequest = {
        idDistrito: distritoSeleccionado.idDistrito,
        nombreDireccion: direccionFisica
      };

      await DistritoService.actualizarDireccionPerfil(payload);
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      setMostrarModalUbicacion(false);

      await updateUser({ 
        tieneDireccion: true, 
        distrito: distritoSeleccionado.distrito 
      });

    } catch (error) {
      console.error("Error al guardar:", error);
      Alert.alert("Error", "No se pudo guardar la ubicación");
      setGuardandoDireccion(false);
    }
  };

  // Indicador de carga inferior (loading de paginación, scroll infinito)
  const renderFooter = () => {
    if (!isCargandoMas) return null;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color="#006080" />
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#C5D800" />
      
      {/* Header (mismo diseño que las demás pantallas) */}
          <HeaderMadre
            user={user}
            titulo=""
            modo="logout"
            onPress={() => {
              logout();
            }}
          />

      {/* Barra de título blanca (mismo estilo que las demás pantallas) */}
      <View style={styles.titleBar}>
        <Text style={styles.headerTitle}>Locales</Text>
      </View>

      {/* Cuerpo de la lista + indicador lateral */}
      <View style={styles.content}>
        {isInitialLoad && loading && locales.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#006080" />
          </View>
        ) : (
          <FlatList
            data={locales}
            keyExtractor={(item, index) => `${item.idLocal || 'local'}-${index}`} 
            contentContainerStyle={[
              styles.scrollContent, 
              esPantallaGrande && styles.tabletContent,
              { paddingBottom: 100 + insets.bottom }
            ]}
            showsVerticalScrollIndicator={false}
            onScroll={manejarScroll}
            scrollEventThrottle={16}
            // Pull-to-refresh nativo: al jalar hacia abajo aparece el
            // círculo de carga del sistema (igual que Facebook/Instagram).
            refreshing={loading && !isCargandoMas}
            onRefresh={reiniciarYObtenerLocales}
            onEndReached={cargarMasElementos}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
            
            ListEmptyComponent={
              errorRed ? (
                <View style={styles.errorContainer}>
                  <WifiOff color="#FF0080" size={54} strokeWidth={2} />
                  <Text style={styles.errorTitle}>Problemas de Conexión</Text>
                  <Text style={styles.errorText}>
                    No logramos conectar con el servidor. Verifica que el sistema backend esté encendido o intenta nuevamente.
                  </Text>
                  <TouchableOpacity style={styles.retryButton} onPress={reintentarConexion}>
                    <RefreshCw color="#FFF" size={18} style={{ marginRight: 8 }} />
                    <Text style={styles.retryButtonText}>REINTENTAR</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    No se encontraron locales de atención disponibles en {user?.distrito || "tu zona"}.
                  </Text>
                </View>
              )
            }
            
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.localItem}
                activeOpacity={0.7}
                onPress={() => {
                  router.push({
                    pathname: '/cuidadora/modulo', 
                    params: { idLocal: item.idLocal }
                  });
                }}
              >
                <View style={styles.iconWrapper}>
                  <UserRound color="#006080" size={esPantallaGrande ? 32 : 26} strokeWidth={2.5} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={[styles.localName, { fontSize: esPantallaGrande ? 19 : 15 }]} numberOfLines={1}>
                    {item.localNombre} 
                  </Text>
                  <Text style={styles.localSubtitle} numberOfLines={1}>
                    {item.direccion || "Dirección no especificada"}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Índice rápido lateral: aparece al scrollear, muestra la página actual */}
        <IndicadorLateralScroll
          visible={indicadorVisible && locales.length > 0}
          progreso={progresoScroll}
          valor={pagina + 1}
        />
      </View>

      {/* MODAL EMERGENTE DE UBICACIÓN */}
      <Modal
        visible={mostrarModalUbicacion}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, esPantallaGrande && { maxWidth: 500 }]}>
            
            <FlatList
              data={distritosFiltrados.length > 0 && !distritoSeleccionado ? distritosFiltrados : []}
              keyExtractor={(item) => item.idDistrito.toString()}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              style={{ maxHeight: 520 }} 
              
              ListHeaderComponent={
                <View>
                  <View style={styles.modalHeader}>
                    <MapPin color="#006080" size={32} />
                    <Text style={styles.modalTitle}>Configura tu Dirección</Text>
                    <Text style={styles.modalSubtitleLabel}>
                      Para poder asignarte tus locales de atención, necesitamos conocer tu ubicación actual.
                    </Text>
                  </View>

                  <View style={styles.formGroupDistrito}>
                    <Text style={styles.inputLabel}>Buscar Distrito (Escribe 3 letras o más):</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Ej: Villa El Salvador"
                      placeholderTextColor="#94A3B8"
                      value={busquedaDistrito}
                      onChangeText={(texto) => {
                        if (distritoSeleccionado) {
                          setDistritoSeleccionado(null);
                        }
                        setBusquedaDistrito(texto);
                      }}
                    />
                  </View>
                  
                  {distritosFiltrados.length > 0 && !distritoSeleccionado && (
                    <Text style={styles.resultsLabel}>Coincidencias encontradas (Desliza para ver más):</Text>
                  )}
                </View>
              }
              
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => {
                    const cadenaUnificada = `${item.distrito} - ${item.provincia} (${item.departamento})`;
                    setDistritoSeleccionado(item);
                    setBusquedaDistrito(cadenaUnificada);
                    setDistritosFiltrados([]);
                  }}
                >
                  <Text style={styles.suggestionText}>
                    {item.distrito} - {item.provincia} ({item.departamento})
                  </Text>
                </TouchableOpacity>
              )}
              
              ListFooterComponent={
                <View style={{ marginTop: 10 }}>
                  <View style={styles.formGroupDireccion}>
                    <Text style={styles.inputLabel}>Dirección Exacta (Av, Calle, Mz y Lote):</Text>
                    <TextInput
                      style={[styles.textInput, { height: 75, textAlignVertical: 'top', paddingTop: 10 }]}
                      placeholder="Ej: Av. Los Próceres 456 Int. 3"
                      placeholderTextColor="#94A3B8"
                      multiline={true}
                      value={direccionFisica}
                      onChangeText={setDireccionFisica}
                    />
                  </View>

                  <View style={styles.modalActionRow}>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.btnSave]} 
                      onPress={manejarGuardarDireccion}
                      disabled={guardandoDireccion}
                    >
                      {guardandoDireccion ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <Text style={styles.btnSaveText}>Guardar</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              }
            />

          </View>
        </View>
      </Modal>

      {/* Navegación Inferior (mismo diseño recto que las demás pantallas) */}
        <BottomNavMadre rutaActual={RUTA_ACTUAL} insetsBottom={insets.bottom} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },

  // Header (mismo estilo que las otras pantallas)
  header: {
    backgroundColor: '#C5D800',
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 15 },
  avatarCircle: { backgroundColor: '#FFFFFF', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  welcomeContainer: { flex: 1 },
  roleLabel: { fontSize: 10, color: '#006080', fontWeight: 'bold' },
  userName: { fontSize: 18, color: '#006080', fontWeight: '900', marginTop: 2 },
  logoutButton: { backgroundColor: '#FF0080', width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', elevation: 2 },

  // Barra de título blanca
  titleBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 25,
  },
  headerTitle: { fontSize: 26, color: '#006080', fontWeight: '900' },

  content: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, width: '100%' },
  tabletContent: { maxWidth: 550, alignSelf: 'center' },
  localItem: {
    width: '100%', height: 76, borderWidth: 2, borderColor: '#006080', borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 14,
    backgroundColor: '#FFF', elevation: 2,
  },
  iconWrapper: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center' },
  textContainer: { marginLeft: 14, flex: 1, justifyContent: 'center' },
  localName: { fontWeight: '800', color: '#1E293B', textTransform: 'uppercase' },
  localSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyText: { fontSize: 16, color: '#94A3B8', fontWeight: '700', textAlign: 'center', lineHeight: 22 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 40, paddingHorizontal: 25 },
  errorTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginTop: 15, marginBottom: 8, textAlign: 'center' },
  errorText: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  retryButton: { backgroundColor: '#006080', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20 },
  retryButtonText: { color: '#FFF', fontWeight: '800', fontSize: 14 },

  // Nav inferior (mismo diseño recto que las demás pantallas)
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navLabel: { fontSize: 11, marginTop: 4, color: '#757575' },
  
  // ESTILOS DEL MODAL (recoloreados a la paleta teal)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContainer: { width: '100%', backgroundColor: '#FFF', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOpacity: 0.15, elevation: 10 },
  modalHeader: { alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginTop: 10, marginBottom: 6 },
  modalSubtitleLabel: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18 },
  
  formGroupDistrito: { marginBottom: 10 }, 
  formGroupDireccion: { marginTop: 14, marginBottom: 16 },
  resultsLabel: { fontSize: 12, fontWeight: '700', color: '#006080', marginTop: 6, marginBottom: 6 },
  
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 6 },
  textInput: { height: 50, borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 14, fontSize: 15, color: '#1E293B', backgroundColor: '#F8FAFC' },
  
  suggestionItem: { 
    paddingVertical: 14, 
    paddingHorizontal: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    marginVertical: 2,
    borderRadius: 8
  },
  suggestionText: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  modalActionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  modalButton: { flex: 1, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  btnCancel: { marginRight: 10, backgroundColor: '#F1F5F9' },
  btnCancelText: { color: '#64748B', fontWeight: '700', fontSize: 16 },
  btnSave: { marginLeft: 10, backgroundColor: '#006080' },
  btnSaveText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});