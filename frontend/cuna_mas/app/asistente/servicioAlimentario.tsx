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
  Alert,
  TextInput,
  useWindowDimensions
} from 'react-native'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useAuth } from '../../context/AuthContext';
import { Calculator, Home } from 'lucide-react-native';
import { CentroAlimentarioService } from '../../service/servicioAlimentario'; 
import HeaderCocina from '../components/sociaCocina/HeaderCocina';
import BottomNavCocina from '../components/sociaCocina/BottomNavCocina';
import IndicadorLateralScroll from '../components/admin/IndicadorLateralScroll';

const TAMANO_PAGINA = 10;
// Tiempo de espera antes de disparar la búsqueda por distrito, para no
// llamar al backend en cada tecla que el usuario escribe.
const DEBOUNCE_MS = 450;

export default function Consulta() { 
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const router = useRouter();
  const insets = useSafeAreaInsets(); 
  const { user } = useAuth();
  const RUTA_ACTUAL = '/asistente/servicioAlimentario';

  const [centros, setCentros] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 

  // --- ESTADOS PARA PAGINACIÓN ---
  const [pagina, setPagina] = useState(0);
  const [esUltimaPagina, setEsUltimaPagina] = useState(false);
  const [isCargandoMas, setIsCargandoMas] = useState(false);

  // --- ESTADO PARA EL FILTRO POR DISTRITO ---
  const [distritoInput, setDistritoInput] = useState('');
  const [distritoFiltro, setDistritoFiltro] = useState('');

  // --- CONTEO TOTAL DE REGISTROS ---
  const [totalRegistros, setTotalRegistros] = useState(0);

  // --- INDICADOR LATERAL DE SCROLL (barra + burbuja con número de página) ---
  const [scrollVisible, setScrollVisible] = useState(false);
  const [scrollProgreso, setScrollProgreso] = useState(0);
  const ocultarIndicadorTimeout = useRef(null);

  const manejarScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const maxScroll = contentSize.height - layoutMeasurement.height;
    const progreso = maxScroll > 0 ? contentOffset.y / maxScroll : 0;
    setScrollProgreso(progreso);
    setScrollVisible(true);

    if (ocultarIndicadorTimeout.current) clearTimeout(ocultarIndicadorTimeout.current);
    ocultarIndicadorTimeout.current = setTimeout(() => setScrollVisible(false), 900);
  };
  
  const isFocused = useIsFocused();

  // Recarga automática al volver a enfocar la pantalla (Reinicia a página 0)
  useEffect(() => {
    if (isFocused) {
      reiniciarYObtenerCentros(distritoFiltro);
    }
  }, [isFocused]);

  // Debounce: espera a que el usuario deje de escribir antes de filtrar
  useEffect(() => {
    const timer = setTimeout(() => {
      setDistritoFiltro(distritoInput.trim());
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [distritoInput]);

  // Cuando el distrito filtrado cambia (por el debounce), reinicia la
  // búsqueda desde la página 0 con el nuevo filtro.
  useEffect(() => {
    reiniciarYObtenerCentros(distritoFiltro);
  }, [distritoFiltro]);

  const reiniciarYObtenerCentros = async (distrito = '') => {
    setIsLoading(true);
    setPagina(0);
    setEsUltimaPagina(false);
    await cargarCentrosAlimentarios(0, true, distrito);
    setIsLoading(false);
  };

  const cargarCentrosAlimentarios = async (numPagina, reiniciar = false, distrito = '') => {
    try {
      // Antes: CentroAlimentarioService.getCentrosTodos() -> traía TODO de
      // golpe, sin paginar ni filtrar. Ahora usa el mismo endpoint paginado
      // y con filtro por distrito que la pantalla de administrador.
      const response = await CentroAlimentarioService.getCentrosPorDistrito(
        numPagina,
        TAMANO_PAGINA,
        distrito
      ); 
      
      if (response && response.centros) {
        if (reiniciar) {
          setCentros(response.centros);
        } else {
          setCentros(prevCentros => [...prevCentros, ...response.centros]);
        }
        setEsUltimaPagina(response.isLast);
        if (typeof response.totalRegistros === 'number') {
          setTotalRegistros(response.totalRegistros);
        } else if (reiniciar) {
          setTotalRegistros(response.centros.length);
        }
      } else {
        if (reiniciar) {
          setCentros([]);
          setTotalRegistros(0);
        }
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo obtener la lista de centros alimentarios.");
    }
  };

  // Disparador cuando llegas al final de la lista (mantiene el filtro activo)
  const cargarMasElementos = async () => {
    if (isCargandoMas || esUltimaPagina) return;

    setIsCargandoMas(true);
    const siguientePagina = pagina + 1;
    setPagina(siguientePagina);
    await cargarCentrosAlimentarios(siguientePagina, false, distritoFiltro);
    setIsCargandoMas(false);
  };

  const limpiarFiltro = () => {
    setDistritoInput('');
  };

  const renderCentroItem = ({ item }) => ( 
    <TouchableOpacity 
      style={styles.userCard} 
      activeOpacity={0.7}
      onPress={() => router.push({
        pathname: '/asistente/consultaLocales', 
        params: { idCentroAlimentario: item.idCentroAlimentario }
      })} 
    > 
      {/* Inicial del comedor para el avatar circular */}
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{item.nombreCentro?.charAt(0).toUpperCase()}</Text>
      </View>

      <View style={styles.userInfo}> 
        <Text style={styles.userName} numberOfLines={1}>{item.nombreCentro}</Text> 
        
        {/* Comité */}
        <View style={styles.dniRow}> 
          <Ionicons name="people-outline" size={14} color="#777" /> 
          <Text style={styles.userDni} numberOfLines={1}> {item.nombreComite}</Text> 
        </View> 

        {/* Dirección */}
        <View style={styles.direccionRow}> 
          <Ionicons name="location-outline" size={14} color="#006080" /> 
          <Text style={styles.direccionText} numberOfLines={1}> {item.direccion}</Text> 
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
        <Text style={styles.headerTitle}>Consulta</Text> 
      </View>

      {/* --- BUSCADOR POR DISTRITO --- */}
      <View style={styles.filtroContainer}>
        <View style={styles.filtroInputWrapper}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" />
          <TextInput
            style={styles.filtroInput}
            placeholder="Buscar por distrito (ej. CHACHAPOYAS)"
            placeholderTextColor="#94A3B8"
            value={distritoInput}
            onChangeText={setDistritoInput}
            autoCapitalize="characters"
          />
          {distritoInput.length > 0 && (
            <TouchableOpacity onPress={limpiarFiltro} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.resumenBar}>
          <MaterialCommunityIcons name="counter" size={16} color="#006080" />
          <Text style={styles.resumenTexto}>
            {distritoFiltro
              ? `${totalRegistros} resultado(s) en "${distritoFiltro}"`
              : `${totalRegistros} centro(s) registrado(s)`}
          </Text>
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
            contentContainerStyle={[
              styles.listContent, 
              esPantallaGrande && styles.listContentGrande,
              { paddingBottom: 100 + insets.bottom }
            ]} 
            showsVerticalScrollIndicator={false} 
            refreshing={isLoading}
            onRefresh={() => reiniciarYObtenerCentros(distritoFiltro)}
            onEndReached={cargarMasElementos}
            onEndReachedThreshold={0.3}
            onScroll={manejarScroll}
            scrollEventThrottle={16}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="fast-food-outline" size={54} color="#CCCCCC" />
                <Text style={styles.emptyText}>
                  {distritoFiltro
                    ? `No hay centros alimentarios en "${distritoFiltro}"`
                    : 'No hay centros alimentarios registrados'}
                </Text>
              </View>
            }
          /> 
        )}

        {/* Barra lateral de navegación: aparece mientras se hace scroll,
            mostrando en la burbuja la página actualmente cargada.
            (Esto NO es la burbuja flotante de agregar — esta pantalla
            no tiene FAB, solo el indicador de posición del scroll). */}
        {!isLoading && centros.length > 0 && (
          <IndicadorLateralScroll
            visible={scrollVisible}
            progreso={scrollProgreso}
            valor={pagina + 1}
          />
        )}
      </View> 

      {/* Navegación Inferior (mismo estilo que las otras pantallas) */} 
      <BottomNavCocina rutaActual={RUTA_ACTUAL} insetsBottom={insets.bottom} />
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
    paddingBottom: 15,
  },
  headerTitle: { fontSize: 26, color: '#006080', fontWeight: '900' }, 

  filtroContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  filtroInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 44,
  },
  filtroInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  resumenBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#E6F7FB',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  resumenTexto: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#006080',
  },

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
  navLabel: { fontSize: 11, marginTop: 4, color: '#757575' },
});