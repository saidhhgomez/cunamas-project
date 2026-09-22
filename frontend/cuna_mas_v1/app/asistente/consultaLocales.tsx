import React, { useState, useEffect, useRef } from 'react'; 
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  ActivityIndicator,
  useWindowDimensions
} from 'react-native'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useAuth } from '../../context/AuthContext';
import { Calculator, Home } from 'lucide-react-native';
import { LocalService } from '../../service/centroAtencionService'; 
import HeaderCocina from '../components/sociaCocina/HeaderCocina';
import BottomNavCocina from '../components/sociaCocina/BottomNavCocina';
import IndicadorLateralScroll from '../components/admin/IndicadorLateralScroll';
import ModalMensaje from '../components/ModalMensaje';
import { useModalMensaje } from '../../hooks/useModalMensaje';

export default function ConsultaLocales() { 
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const router = useRouter();
  const insets = useSafeAreaInsets(); 
  const { user, logout } = useAuth();
  const { mostrarError, modalProps } = useModalMensaje();
  const { idCentroAlimentario } = useLocalSearchParams();
const RUTA_ACTUAL = '/asistente/cons';

  const [centros, setCentros] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 

  // --- ESTADOS PARA PAGINACIÓN (scroll infinito real) ---
  const [pagina, setPagina] = useState(0);
  const [esUltimaPagina, setEsUltimaPagina] = useState(false);
  const [isCargandoMas, setIsCargandoMas] = useState(false);
  const [totalRegistros, setTotalRegistros] = useState<number | null>(null);

  // --- ESTADOS PARA EL INDICADOR LATERAL DE SCROLL ---
  const [progresoScroll, setProgresoScroll] = useState(0);
  const [indicadorVisible, setIndicadorVisible] = useState(false);
  const timeoutOcultarRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const isFocused = useIsFocused();

  // Recarga automática al volver a enfocar la pantalla (reinicia a página 0)
  useEffect(() => {
    if (isFocused) {
      reiniciarYObtenerLocales();
    }
  }, [isFocused]);

  const reiniciarYObtenerLocales = async () => {
    setIsLoading(true);
    setPagina(0);
    setEsUltimaPagina(false);
    await cargarCentrosAlimentarios(0, true);
    setIsLoading(false);
  };

  const cargarCentrosAlimentarios = async (numPagina: number, reiniciar = false) => {
    try {
      const response = await LocalService.getLocalesPorCentroPaginado(Number(idCentroAlimentario), numPagina, 10);

      // Spring Page<T> trae { content, last, totalElements, ... }.
      // Mantenemos el fallback por si el backend cambia el shape.
      const content = response?.content ?? (Array.isArray(response) ? response : []);
      const esUltima = typeof response?.last === 'boolean' ? response.last : content.length < 10;
      const total = response?.totalElements ?? content.length;

      if (reiniciar) {
        setCentros(content);
      } else {
        // Concatena en vez de reemplazar, para no perder lo ya cargado
        setCentros(prev => [...prev, ...content]);
      }
      setEsUltimaPagina(esUltima);
      setTotalRegistros(total);
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
    await cargarCentrosAlimentarios(siguientePagina, false);
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

  const renderCentroItem = ({ item }) => ( 
    <TouchableOpacity 
      style={styles.userCard} 
      activeOpacity={0.7}
      onPress={() => router.push({
        pathname: '/asistente/consultasModulo', 
        params: { idLocal: item.idLocal } // Pasamos el idLocal de tu JSON
      })} 
    > 
      {/* Inicial del local para el avatar circular */}
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{item.localNombre?.charAt(0).toUpperCase()}</Text>
      </View>

      <View style={styles.userInfo}> 
        {/* Nombre del Local */}
        <Text style={styles.userName}>{item.localNombre}</Text> 
        
        {/* Servicio Alimentario / Comedor */}
        <View style={styles.dniRow}> 
          <Ionicons name="people-outline" size={14} color="#777" /> 
          <Text style={styles.userDni}> {item.servicioAlimentario}</Text> 
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

  // Indicador de carga inferior (loading de paginación)
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
      
      {/* Header (mismo estilo que las otras pantallas) */} 
    <HeaderCocina
      user={user}
      titulo=""
      modo="volver"
      onPress={() => {
        router.back();
      }}
    />

      {/* Barra de título blanca */}
      <View style={styles.titleBar}>
        <Text style={styles.headerTitle} allowFontScaling={false}>Locales</Text>
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
            keyExtractor={item => item.idLocal.toString()} // Usamos idLocal como key única
            contentContainerStyle={[
              styles.listContent, 
              esPantallaGrande && styles.listContentGrande,
              { paddingBottom: 120 + insets.bottom } // espacio extra para el FAB + nav
            ]} 
            showsVerticalScrollIndicator={false} 
            onScroll={manejarScroll}
            scrollEventThrottle={16}
            refreshing={isLoading}
            onRefresh={reiniciarYObtenerLocales}
            onEndReached={cargarMasElementos}
            onEndReachedThreshold={0.3}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="fast-food-outline" size={54} color="#CCCCCC" />
                <Text style={styles.emptyText}>No hay centros alimentarios registrados</Text>
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

      {/* Navegación Inferior (mismo estilo que las otras pantallas) */} 
    <BottomNavCocina rutaActual={RUTA_ACTUAL} insetsBottom={insets.bottom} />
      <ModalMensaje {...modalProps} />
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

  // Barra de título blanca
  titleBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 25,
  },
  headerTitle: { fontSize: 26, color: '#006080', fontWeight: '900' }, 

  content: { flex: 1 }, 
  listContent: { paddingHorizontal: 20, paddingTop: 15 },
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
    height: 52, 
    borderRadius: 26, 
    marginRight: 15, 
    backgroundColor: '#006080', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
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
  
  // Burbuja flotante (FAB) — se mantiene igual
  fabButton: {
    position: 'absolute',
    bottom: 92, // Se posiciona cómodamente encima del bottomNav
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
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    zIndex: 999
  },

  // Nav inferior (mismo estilo que las otras pantallas)
  bottomNav: { 
    flexDirection: 'row', 
    backgroundColor: '#FFFFFF', 
    borderTopWidth: 1, 
    borderTopColor: '#E0E0E0', 
    position: 'absolute', 
    bottom: 0, 
    width: '100%' 
  }, 
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' }, 
  navLabel: { fontSize: 11, marginTop: 4, color: '#757575' }
});