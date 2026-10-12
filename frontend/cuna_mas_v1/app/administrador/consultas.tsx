import React, { useState, useEffect, useRef } from 'react'; 
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StatusBar,
  ActivityIndicator,
  TextInput,
  useWindowDimensions,
  NativeScrollEvent,
  NativeSyntheticEvent
} from 'react-native'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useAuth } from '../../context/AuthContext';
import { Calculator, Home } from 'lucide-react-native';
import { CentroAlimentarioService } from '../../service/servicioAlimentario'; 
import BottomNavAdmin from '../components/admin/BottomNavAdmin';
import AdminHeader from '../components/admin/HeaderAdmin';
import IndicadorLateralScroll from '../components/admin/IndicadorLateralScroll';
import ModalMensaje from '../components/ModalMensaje';
import { useModalMensaje } from '../../hooks/useModalMensaje';

// Esta pantalla ES "/administrador/consultas" (botón "Gestión" de la barra).
// Constante fija en vez de usePathname(): ver comentario en BottomNavAdmin.
const RUTA_ACTUAL = '/administrador/consultas';

export default function Consulta() { 
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const router = useRouter();
  const insets = useSafeAreaInsets(); 
  const { user } = useAuth(); // Se removió 'logout' de aquí ya que no se usa
  const { mostrarError, modalProps } = useModalMensaje();

  const [centros, setCentros] = useState<any[]>([]); 
  const [isLoading, setIsLoading] = useState(true); 
  
  // --- ESTADOS PARA PAGINACIÓN ---
  const [pagina, setPagina] = useState(0);
  const [esUltimaPagina, setEsUltimaPagina] = useState(false);
  const [isCargandoMas, setIsCargandoMas] = useState(false);

  // --- ESTADOS PARA BÚSQUEDA POR DISTRITO ---
  // textoBusqueda: lo que el usuario está escribiendo (se actualiza en cada tecla)
  // distritoFiltro: el valor "aplicado" tras el debounce, el que realmente se manda al backend
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [distritoFiltro, setDistritoFiltro] = useState('');

  // --- ESTADOS PARA EL INDICADOR LATERAL DE SCROLL ---
  const [progresoScroll, setProgresoScroll] = useState(0);
  const [indicadorVisible, setIndicadorVisible] = useState(false);
  const timeoutOcultarRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const isFocused = useIsFocused();

  // Debounce: espera 500ms sin que el usuario escriba antes de aplicar el filtro,
  // para no disparar un GET por cada letra tecleada.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDistritoFiltro(textoBusqueda.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [textoBusqueda]);

  // Recarga automática al volver a enfocar la pantalla, o cuando cambia el
  // filtro de distrito aplicado. Ambos casos reinician a página 0.
  useEffect(() => {
    if (isFocused) {
      reiniciarYObtenerCentros(distritoFiltro);
    }
  }, [isFocused, distritoFiltro]);

  // Función para limpiar estados al refrescar o entrar de cero
  const reiniciarYObtenerCentros = async (distrito: string) => {
    setIsLoading(true);
    setPagina(0);
    setEsUltimaPagina(false);
    await cargarCentrosAlimentarios(0, true, distrito);
    setIsLoading(false);
  };

  const cargarCentrosAlimentarios = async (numPagina: number, reiniciar = false, distrito: string = '') => {
    try {
      // Sin distrito -> "carga todos" paginado. Con distrito -> búsqueda paginada.
      // Tu servicio devuelve: { centros: [...], isLast: boolean }
      const response = await CentroAlimentarioService.getCentrosPorDistrito(numPagina, 10, distrito); 
      
      if (response && response.centros) {
        if (reiniciar) {
          setCentros(response.centros);
        } else {
          // Concatena los nuevos elementos si no se está reiniciando la lista
          setCentros(prevCentros => [...prevCentros, ...response.centros]);
        }
        setEsUltimaPagina(response.isLast);
      } else {
        if (reiniciar) setCentros([]);
      }
    } catch (error) {
      mostrarError("Error", "No se pudo obtener la lista de centros alimentarios.");
    }
  };

  // Disparador cuando llegas al final de la lista
  const cargarMasElementos = async () => {
    if (isCargandoMas || esUltimaPagina) return;

    setIsCargandoMas(true);
    const siguientePagina = pagina + 1;
    setPagina(siguientePagina);
    await cargarCentrosAlimentarios(siguientePagina, false, distritoFiltro);
    setIsCargandoMas(false);
  };

  // Calcula el progreso (0-1) del scroll dentro de la lista y muestra el
  // indicador lateral; lo oculta automáticamente 800ms después de que el
  // usuario deja de scrollear.
  const manejarScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
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

  const renderCentroItem = ({ item }: { item: any }) => ( 
    <TouchableOpacity 
      style={styles.userCard} 
      activeOpacity={0.7}
      onPress={() => router.push({
        pathname: '/administrador/consultaLocales', 
        params: { idCentroAlimentario: item.idCentroAlimentario }
      })} 
    > 
      {/* Inicial del comedor para el avatar circular */}
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{item.nombreCentro?.charAt(0).toUpperCase()}</Text>
      </View>

      <View style={styles.userInfo}> 
        <Text style={styles.userName}>{item.nombreCentro}</Text>
        
        {/* Comité */}
        <View style={styles.dniRow}> 
          <Ionicons name="people-outline" size={14} color="#777" /> 
          <Text style={styles.userDni}> {item.nombreComite}</Text>
        </View> 

        {/* Dirección */}
        <View style={styles.direccionRow}> 
          <Ionicons name="location-outline" size={14} color="#006080" /> 
          <Text style={styles.direccionText}> {item.direccion}</Text>
        </View> 
      </View> 

      <Ionicons name="chevron-forward" size={20} color="#006080" /> 
    </TouchableOpacity> 
  ); 

  // Indicador de carga inferior (Loading de paginación)
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
      <AdminHeader
        user={user}
        titulo="Consulta"
        modo="volver"
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/administrador/inicio');
          }
        }}
      />

<View style={styles.titleBar}>
  <Text style={styles.headerTitle} allowFontScaling={false}>Consulta</Text> 
</View>

      {/* Buscador por distrito */}
      <View style={[styles.searchWrapper, esPantallaGrande && styles.listContentGrande]}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por distrito..."
            placeholderTextColor="#94A3B8"
            allowFontScaling={false}
            numberOfLines={1}
            value={textoBusqueda}
            onChangeText={setTextoBusqueda}
            autoCapitalize="characters"
            returnKeyType="search"
          />
          {textoBusqueda.length > 0 && (
            <TouchableOpacity
              onPress={() => setTextoBusqueda('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Cuerpo de la Lista */}
      <View style={styles.content}> 
        {isLoading && centros.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#006080" />
          </View>
        ) : (
          <FlatList 
            data={centros} 
            renderItem={renderCentroItem} 
            keyExtractor={item => item.idCentroAlimentario.toString()} 
            contentContainerStyle={[styles.listContent, esPantallaGrande && styles.listContentGrande]} 
            showsVerticalScrollIndicator={false} 
            onScroll={manejarScroll}
            scrollEventThrottle={16}
            refreshing={isLoading}
            onRefresh={() => reiniciarYObtenerCentros(distritoFiltro)} // Reinicia desde pág 0
            onEndReached={cargarMasElementos}    // Detecta final de lista
            onEndReachedThreshold={0.3}          // Umbral de disparo
            ListFooterComponent={renderFooter}   // Loader al pie de lista
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="fast-food-outline" size={54} color="#CCCCCC" />
                <Text style={styles.emptyText}>
                  {distritoFiltro
                    ? `No se encontraron centros en "${distritoFiltro}"`
                    : 'No hay centros alimentarios registrados'}
                </Text>
              </View>
            }
          /> 
        )}

        {/* Índice rápido lateral: aparece al scrollear, muestra la página actual */}
        <IndicadorLateralScroll
          visible={indicadorVisible && centros.length > 0}
          progreso={progresoScroll}
          valor={pagina + 1}
        />
      </View> 

      {/* BOTÓN FLOTANTE (BURBUJA PARA AGREGAR) */}
      <TouchableOpacity 
        style={[styles.fab, { bottom: 88 + insets.bottom }]} 
        activeOpacity={0.8}
        onPress={() => {
          router.push({
            pathname: '/administrador/agregarservicioA'
          });
        }}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Navegación Inferior — componente compartido, misma fuente de verdad en todas las pantallas */}
      <BottomNavAdmin rutaActual={RUTA_ACTUAL} insetsBottom={insets.bottom} />
      <ModalMensaje {...modalProps} />
    </View> 
  ); 
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' }, 
header: { 
  backgroundColor: '#C5D800', 
  paddingHorizontal: 20, 
}, 
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }, 
  adminInfo: { flexDirection: 'row', alignItems: 'center' }, 
  adminAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#FFFFFF', marginRight: 10 }, 
  adminAvatarPlaceholder: { backgroundColor: '#006080', justifyContent: 'center', alignItems: 'center' },
  adminAvatarInitial: { color: '#FFF', fontSize: 18, fontWeight: '900' },
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
headerTitle: { 
  fontSize: 26, 
  color: '#006080', 
  fontWeight: '900' 
},  content: { flex: 1 }, 
  listContent: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 15 }, 
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
    width: 52, 
    height: 60,
    borderRadius: 26, 
    marginRight: 15, 
    backgroundColor: '#006080', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  titleBar: {
  backgroundColor: '#FFFFFF',
  paddingHorizontal: 20,
  paddingTop: 15,
  paddingBottom: 25,
},
  searchWrapper: { paddingHorizontal: 20, backgroundColor: '#FFFFFF' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: { flex: 1, height: '100%', padding: 0, fontSize: 18, color: '#333', fontWeight: '500', includeFontPadding: false, textAlignVertical: 'center' },
  avatarText: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  userInfo: { flex: 1, paddingRight: 10 }, 
  userName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 }, 
  dniRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 }, 
  userDni: { fontSize: 13, color: '#64748B' }, 
  direccionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  direccionText: { fontSize: 12, color: '#006080', fontWeight: '500' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyText: { color: '#999', marginTop: 12, fontSize: 14, textAlign: 'center', lineHeight: 20 },

  fab: {
    position: 'absolute',
    right: 20,
    backgroundColor: '#006080',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  }
});