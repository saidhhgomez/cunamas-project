import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList,
  useWindowDimensions,
  ActivityIndicator
} from 'react-native';
import { UserRound } from 'lucide-react-native';
import { ModuloService } from '../../service/moduloService';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ModulosListScreen() {
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const router = useRouter();

  const params = useLocalSearchParams();
  const idLocalSeleccionado = Number(params.idLocal) || 1; 

  // Estados del Scroll Infinito
  const [modulos, setModulos] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Nos ayuda a controlar el spinner del centro

  const cargarModulos = async (paginaAEnviar: number, reiniciar: boolean = false) => {
    if (loading) return;

    setLoading(true);
    try {
      const resultado = await ModuloService.getModulosPorLocal(idLocalSeleccionado, paginaAEnviar);

      if (!resultado || !resultado.modulos || resultado.modulos.length === 0) {
        setHasMore(false);
      } else {
        setModulos(prevModulos => reiniciar ? resultado.modulos : [...prevModulos, ...resultado.modulos]);
        
        if (resultado.isLast) {
          setHasMore(false);
        } else {
          setPage(prevPage => prevPage + 1); 
        }
      }
    } catch (error) {
      console.error("Error cargando módulos en la vista:", error);
      // Detenemos futuros intentos si hay un colapso en la API
      setHasMore(false); 
    } finally {
      // 🌟 SOLUCIÓN AL SPINNER INFINITO: Forzamos el apagado pase lo que pase
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    setModulos([]);
    setPage(0);
    setHasMore(true);
    setIsInitialLoad(true);
    cargarModulos(0, true);
  }, [idLocalSeleccionado]);

  const manejarSiguientePagina = () => {
    if (!hasMore || loading) return;
    cargarModulos(page);
  };

  return (
    <View style={styles.container}>
      
      {/* 🟢 NOTA: El header verde corporativo fue removido con éxito de aquí */}
      {/* Ya que ahora vive y se renderiza elegantemente desde el archivo _layout.tsx */}

      {/* FlatList con Scroll Infinito */}
      <FlatList
        data={modulos}
        keyExtractor={(item) => item.idModulo.toString()} 
        contentContainerStyle={[
          styles.scrollContent, 
          esPantallaGrande && styles.tabletContent
        ]}
        showsVerticalScrollIndicator={false}
        
        ListHeaderComponent={
          <Text style={[styles.title, { fontSize: esPantallaGrande ? 38 : 32 }]}>
            Módulos
          </Text>
        }

        // 📝 Control inteligente de carga y estado vacío debajo del título
        ListEmptyComponent={
          loading && isInitialLoad ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#00AEEF" />
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No se encontraron módulos registrados para este local.
              </Text>
            </View>
          )
        }
        
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.moduloItem}
            activeOpacity={0.7}
            focusable={true}
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
              <UserRound color="#8A2BE2" size={esPantallaGrande ? 34 : 28} strokeWidth={2.5} />
            </View>
            <Text 
              style={[styles.moduloName, { fontSize: esPantallaGrande ? 20 : 16 }]}
              numberOfLines={1}
            >
              {item.nombreModulo} 
            </Text>
          </TouchableOpacity>
        )}

        onEndReached={manejarSiguientePagina}
        onEndReachedThreshold={0.4}

        ListFooterComponent={() => (
          loading && !isInitialLoad && hasMore ? (
            <View style={styles.footerLoading} accessible={false}>
              <ActivityIndicator size="small" color="#00AEEF" />
            </View>
          ) : null
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF' 
  },
  scrollContent: { 
    paddingHorizontal: '6%', 
    paddingBottom: 110, // 🌟 Espacio extra para que la cápsula flotante inferior no tape tus elementos
    width: '100%' 
  },
  tabletContent: { 
    maxWidth: 550, 
    alignSelf: 'center' 
  },
  title: { 
    fontWeight: '900', 
    color: '#00AEEF', 
    marginBottom: 20, 
    marginTop: 25 
  },
  moduloItem: { 
    width: '100%', 
    height: 72, 
    borderWidth: 2, 
    borderColor: '#8A2BE2', 
    borderRadius: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
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
    backgroundColor: '#F3E8FF', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  moduloName: { 
    fontWeight: '800', 
    color: '#1E293B', 
    marginLeft: 14, 
    textTransform: 'uppercase', 
    flex: 1 
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
});