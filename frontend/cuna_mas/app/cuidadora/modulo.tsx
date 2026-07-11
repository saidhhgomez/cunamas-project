import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { UserRound, User, LogOut } from 'lucide-react-native';
import { ModuloService } from '../../service/moduloService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext'; 

export default function ModulosListScreen() {
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const router = useRouter();
  const { user, logout } = useAuth(); 

  const params = useLocalSearchParams();
  const idLocalSeleccionado = Number(params.idLocal) || 1; 

  // 🔄 Estados restaurados para el Scroll Infinito
  const [modulos, setModulos] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true); 

  const cargarModulos = async (paginaAEnviar: number, reiniciar: boolean = false) => {
    if (loading) return;

    setLoading(true);
    try {
      // 📝 Se envía la página correctamente al servicio
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
      setHasMore(false); 
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    // Reiniciar estados cada vez que cambie el local seleccionado
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
    <SafeAreaView style={styles.container}>
      
      {/* 🟢 HEADER CORPORATIVO VERDE RESTAURADO */}
      <View style={[styles.header, { height: esPantallaGrande ? 160 : 130 }]}>
        <View style={styles.userInfo}>
          <View style={styles.avatarCircle}>
            <User color="#000" size={esPantallaGrande ? 32 : 26} />
          </View>
          <View style={styles.welcomeContainer}>
            <Text style={[styles.welcomeTitle, { fontSize: esPantallaGrande ? 24 : 20 }]}>
              Bienvenid@
            </Text>
            <Text style={[styles.userName, { fontSize: esPantallaGrande ? 18 : 15 }]} numberOfLines={1}>
              {user?.nombre || "María Estela"}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
          <LogOut color="#FFF" size={esPantallaGrande ? 26 : 22} />
        </TouchableOpacity>
      </View>

      {/* 📜 FlatList con Scroll Infinito */}
      <FlatList
        data={modulos}
        keyExtractor={(item, index) => `${item.idModulo || 'modulo'}-${index}`} 
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

        // 🔄 Controladores de paginación del Scroll Infinito reasignados
        onEndReached={manejarSiguientePagina}
        onEndReachedThreshold={0.4}

        ListFooterComponent={() => (
          loading && !isInitialLoad && hasMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator size="small" color="#00AEEF" />
            </View>
          ) : null
        )}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF' 
  },
  header: {
    backgroundColor: '#C5D800',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '6%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  userInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1, 
    marginRight: 15 
  },
  avatarCircle: { 
    backgroundColor: '#FFF', 
    width: 50, height: 50, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  welcomeContainer: { 
    marginLeft: 12, 
    flex: 1 
  },
  welcomeTitle: { 
    color: '#00AEEF', 
    fontWeight: 'bold' 
  },
  userName: { 
    color: '#FFF', 
    fontWeight: '600', 
    marginTop: 2 
  },
  logoutButton: { 
    backgroundColor: '#FF007A', 
    padding: 12, 
    borderRadius: 25 
  },
  scrollContent: { 
    paddingHorizontal: '6%', 
    paddingBottom: 60, 
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