import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { UserRound, User, LogOut, Home, Calculator } from 'lucide-react-native';
import { ModuloService } from '../../service/moduloService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import HeaderMadre from '../components/cuidadora/HeaderMadre';
import BottomNavMadre from '../components/cuidadora/BottomNavMadre';
import IndicadorLateralScroll from '../components/admin/IndicadorLateralScroll';

const TAMANO_PAGINA = 10;

export default function ModulosListScreen() {
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const router = useRouter();
  const { user, logout } = useAuth(); 
  const insets = useSafeAreaInsets();

  const params = useLocalSearchParams();
  const idLocalSeleccionado = Number(params.idLocal) || 1; 

  // --- ESTADOS PARA PAGINACIÓN (scroll infinito real) ---
  const [modulos, setModulos] = useState<any[]>([]);
  const [pagina, setPagina] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isCargandoMas, setIsCargandoMas] = useState(false);
  const [esUltimaPagina, setEsUltimaPagina] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); 

  // --- ESTADOS PARA EL INDICADOR LATERAL DE SCROLL ---
  const [progresoScroll, setProgresoScroll] = useState(0);
  const [indicadorVisible, setIndicadorVisible] = useState(false);
  const timeoutOcultarRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Carga una página específica. `reiniciar=true` reemplaza la lista
  // (primera carga, cambio de local, o pull-to-refresh); si no, concatena.
  const cargarModulos = async (numPagina: number, reiniciar: boolean = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const resultado = await ModuloService.getModulosPorLocal(idLocalSeleccionado, numPagina, TAMANO_PAGINA);

      const listaModulos = resultado?.modulos ?? [];

      if (reiniciar) {
        setModulos(listaModulos);
      } else {
        setModulos(prev => [...prev, ...listaModulos]);
      }

      const esUltima = typeof resultado?.isLast === 'boolean'
        ? resultado.isLast
        : listaModulos.length < TAMANO_PAGINA;
      setEsUltimaPagina(esUltima);
    } catch (error) {
      console.error("Error cargando módulos en la vista:", error);
      if (reiniciar) setModulos([]);
      setEsUltimaPagina(true);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  // Reinicia a página 0 (primera carga, cambio de local, o pull-to-refresh)
  const reiniciarYObtenerModulos = async () => {
    setPagina(0);
    setEsUltimaPagina(false);
    await cargarModulos(0, true);
  };

  useEffect(() => {
    setIsInitialLoad(true);
    reiniciarYObtenerModulos();
  }, [idLocalSeleccionado]);

  // Disparador cuando llegas al final de la lista (scroll infinito)
  const manejarSiguientePagina = async () => {
    if (isCargandoMas || esUltimaPagina || loading) return;

    setIsCargandoMas(true);
    const siguientePagina = pagina + 1;
    setPagina(siguientePagina);
    await cargarModulos(siguientePagina, false);
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#C5D800" />
      
      {/* Header (mismo diseño que las demás pantallas) */}
              <HeaderMadre
                user={user}
                titulo=""
                modo="volver"
                onPress={() => {
                  router.back();
                }}
              />

      {/* Barra de título blanca (mismo estilo que las demás pantallas) */}
      <View style={styles.titleBar}>
        <Text style={styles.headerTitle} allowFontScaling={false}>Módulos</Text>
      </View>

      {/* Cuerpo de la lista + indicador lateral */}
      <View style={styles.content}>
        {isInitialLoad && loading && modulos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#006080" />
          </View>
        ) : (
          <FlatList
            data={modulos}
            keyExtractor={(item, index) => `${item.idModulo || 'modulo'}-${index}`} 
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
            onRefresh={reiniciarYObtenerModulos}

            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No se encontraron módulos registrados para este local.
                </Text>
              </View>
            }
            
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.moduloItem}
                activeOpacity={0.7}
                onPress={() => {
                  router.push({
                    pathname: '/cuidadora/control_lista', 
                    params: { 
                      idModulo: item.idModulo,
                      nombreModulo: item.nombreModulo 
                    }
                  });
                }}
              >
                <View style={styles.iconWrapper}>
                  <UserRound color="#006080" size={esPantallaGrande ? 30 : 26} strokeWidth={2.5} />
                </View>
                <Text 
                  style={[styles.moduloName, { fontSize: esPantallaGrande ? 20 : 16 }]}
                  allowFontScaling={true}
                >
                  {item.nombreModulo}
                </Text>
              </TouchableOpacity>
            )}

            onEndReached={manejarSiguientePagina}
            onEndReachedThreshold={0.4}

            ListFooterComponent={() => (
              isCargandoMas ? (
                <View style={styles.footerLoading}>
                  <ActivityIndicator size="small" color="#006080" />
                </View>
              ) : null
            )}
          />
        )}

        {/* Índice rápido lateral: aparece al scrollear, muestra la página actual */}
        <IndicadorLateralScroll
          visible={indicadorVisible && modulos.length > 0}
          progreso={progresoScroll}
          valor={pagina + 1}
        />
      </View>

      {/* Navegación Inferior (mismo diseño que las demás pantallas) */}
      <BottomNavMadre rutaActual="/cuidadora/modulo" insetsBottom={insets.bottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9F9F9' 
  },

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
  userInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1, 
    marginRight: 15 
  },
  avatarCircle: { 
    backgroundColor: '#FFFFFF', 
    width: 44, height: 44, 
    borderRadius: 22, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 10,
  },
  welcomeContainer: { 
    flex: 1 
  },
  roleLabel: { 
    fontSize: 10,
    color: '#006080', 
    fontWeight: 'bold' 
  },
  userName: { 
    fontSize: 18,
    color: '#006080', 
    fontWeight: '900', 
    marginTop: 2 
  },
  logoutButton: { 
    backgroundColor: '#FF0080', 
    width: 38, height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },

  // Barra de título blanca
  titleBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 25,
  },
  headerTitle: {
    fontSize: 34,
    lineHeight: 24,
    color: '#006080',
    fontWeight: '900',
  },

  content: { flex: 1 },
  scrollContent: { 
    paddingHorizontal: 20,
    width: '100%' 
  },
  tabletContent: { 
    maxWidth: 550, 
    alignSelf: 'center' 
  },
  moduloItem: { 
    width: '100%', 
    minHeight: 72,
    borderWidth: 2, 
    borderColor: '#006080', 
    borderRadius: 16, 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14, 
    backgroundColor: '#FFF', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 2, 
    elevation: 2 
  },
  iconWrapper: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    backgroundColor: '#E0F2FE', 
    justifyContent: 'center', 
    alignItems: 'center',
    flexShrink: 0,
  },
  moduloName: { 
    fontWeight: '800', 
    color: '#1E293B', 
    marginLeft: 14, 
    textTransform: 'uppercase', 
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    lineHeight: 22,
    includeFontPadding: false,
  },
  footerLoading: { 
    paddingVertical: 16, 
    alignItems: 'center' 
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
  },

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
  navItem: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  navLabel: { 
    fontSize: 11, 
    marginTop: 4, 
    color: '#757575' 
  },
});