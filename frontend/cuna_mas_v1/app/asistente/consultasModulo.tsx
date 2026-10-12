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
import { ModuloService } from '../../service/moduloService'; 
import HeaderCocina from '../components/sociaCocina/HeaderCocina';
import BottomNavCocina from '../components/sociaCocina/BottomNavCocina';
import IndicadorLateralScroll from '../components/admin/IndicadorLateralScroll';
import ModalMensaje from '../components/ModalMensaje';
import { useModalMensaje } from '../../hooks/useModalMensaje';

interface ModuloItem {
  idModulo: number;
  nombreModulo: string;
}

export default function ConsultaModulos() { 
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const router = useRouter();
  const insets = useSafeAreaInsets(); 
  const { user } = useAuth();
  const { idLocal } = useLocalSearchParams();
  const { mostrarError, modalProps } = useModalMensaje();

  // Estados de la lista de módulos
  const [modulos, setModulos] = useState<ModuloItem[]>([]); 
  const [isLoading, setIsLoading] = useState(false); 
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [isAllLoaded, setIsAllLoaded] = useState(false);
  const TAMANO_PAGINA = 10;
  const RUTA_ACTUAL = '/asistente/consultasModulo';

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
      mostrarError('Error', 'No se pudo obtener la lista de módulos.');
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

  const renderModuloItem = ({ item }: { item: ModuloItem }) => ( 
    <TouchableOpacity 
      style={styles.userCard} 
      activeOpacity={0.7}
      onPress={() => router.push({
        pathname: '/asistente/resumen', 
        params: { 
          idModulo: item.idModulo, 
          nombreModulo: item.nombreModulo }
      })} 
    > 
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{item.nombreModulo?.charAt(0).toUpperCase()}</Text>
      </View>

      <View style={styles.userInfo}> 
        <Text 
          style={styles.userName}
          numberOfLines={3}
          ellipsizeMode="tail"
          allowFontScaling={true}
          adjustsFontSizeToFit={true}
          minimumFontScale={0.75}
        >
          {item.nombreModulo}
        </Text> 
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
    <View style={[styles.container, { paddingTop: insets.top }]}> 
      <StatusBar barStyle="light-content" backgroundColor="#C5D800" /> 
      
      {/* Header (mismo estilo que las otras pantallas) */}
      <HeaderCocina
        user={user}
        titulo="Módulos"
        modo="volver"
        onPress={() => router.back()}
      />     

      <View style={styles.titleBar}>
        <Text style={styles.headerTitle} allowFontScaling={false}>Módulos</Text>
      </View>

      {/* Cuerpo de la Lista */}
      <View style={styles.content}> 
        <FlatList 
          data={modulos} 
          renderItem={renderModuloItem} 
          keyExtractor={item => item.idModulo.toString()} 
          contentContainerStyle={[
            styles.listContent,
            esPantallaGrande && styles.listContentGrande,
            // Deja el último módulo por encima de la barra de navegación fija.
            { paddingBottom: 84 + insets.bottom },
          ]} 
          showsVerticalScrollIndicator={false} 
          
          refreshing={isLoading}
          onRefresh={reiniciarYObtenerModulos}
          onEndReached={cargarMasModulos}
          onEndReachedThreshold={0.3}
          onScroll={manejarScroll}
          scrollEventThrottle={16}
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

        {/* Barra lateral de navegación: aparece mientras se hace scroll,
            mostrando en la burbuja la página actualmente cargada. */}
        {!isLoading && modulos.length > 0 && (
          <IndicadorLateralScroll
            visible={scrollVisible}
            progreso={scrollProgreso}
            valor={page + 1}
          />
        )}
      </View> 

      {/* Sin burbuja flotante de "Agregar": Socia de Cocina solo consulta,
          la creación de módulos queda exclusiva del rol Administrador. */}

      <ModalMensaje {...modalProps} />

      <BottomNavCocina rutaActual={RUTA_ACTUAL} insetsBottom={insets.bottom} />
    </View> 
  ); 
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' }, 

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
  headerTitle: { 
    fontSize: 26, 
    color: '#006080', 
    fontWeight: '900' 
  },  
  content: { flex: 1 }, 
  listContent: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 15 }, 
  listContentGrande: { maxWidth: 800, alignSelf: 'center', width: '100%' },
  userCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    padding: 16,
    paddingVertical: 14,
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12, 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4,
    minHeight: 80,
  }, 
  titleBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 25,
  },
  avatarPlaceholder: { 
    width: 52, height: 52, borderRadius: 26, 
    marginRight: 15, backgroundColor: '#006080', 
    justifyContent: 'center', alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  userInfo: { flex: 1, paddingRight: 10, justifyContent: 'center', flexShrink: 1 }, 
  userName: { fontSize: 14, fontWeight: 'bold', color: '#333', lineHeight: 18, flexShrink: 1, includeFontPadding: false }, 
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyText: { color: '#999', marginTop: 12, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  footerLoader: { paddingVertical: 15, alignItems: 'center' },
  bottomNav: { 
    flexDirection: 'row', height: 72, backgroundColor: '#FFFFFF', 
    borderTopWidth: 1, borderTopColor: '#E2E8F0', 
    position: 'absolute', bottom: 0, width: '100%',
    paddingBottom: 4, elevation: 8, shadowColor: '#000', 
    shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 3,
  }, 
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' }, 
  navLabel: { fontSize: 11, marginTop: 4, color: '#757575' },
});
