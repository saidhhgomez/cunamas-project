import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  FlatList,
  ActivityIndicator,
  useWindowDimensions
} from 'react-native';
import { User, LogOut, UserRound } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext'; 
import { LocalService } from '../../service/centroAtencionService'; 
import { useRouter } from 'expo-router'; // 🚀 Importación de Expo Router

export default function InicioCuidadora() {
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const router = useRouter(); // 💸 Instancia del enrutador para la navegación

  // Estados para Scroll Infinito de la API
  const [locales, setLocales] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // ID del centro alimentario fijo de ejemplo
  const [idCentroAlimentarioFijo] = useState(1); 

  const cargarLocales = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const resultado = await LocalService.getLocalesPorCentro(idCentroAlimentarioFijo, page);

      if (resultado.locales.length === 0) {
        setHasMore(false);
      } else {
        setLocales(prevLocales => [...prevLocales, ...resultado.locales]);
        
        if (resultado.isLast) {
          setHasMore(false);
        } else {
          setPage(prevPage => prevPage + 1);
        }
      }
    } catch (error) {
      console.error("Error cargando locales en la vista:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarLocales();
  }, [idCentroAlimentarioFijo]);

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header Adaptable - Verde Lima */}
      <View style={[styles.header, { height: esPantallaGrande ? 160 : 130 }]}>
        <View style={styles.userInfo}>
          <View style={styles.avatarCircle}>
            <User color="#000" size={esPantallaGrande ? 32 : 26} />
          </View>
          <View style={styles.welcomeContainer}>
            <Text style={[styles.welcomeTitle, { fontSize: esPantallaGrande ? 24 : 20 }]}>
              Bienvenid@
            </Text>
            <Text 
              style={[styles.userName, { fontSize: esPantallaGrande ? 18 : 15 }]}
              numberOfLines={1}
            >
              {user?.nombre || "Cuidadora"}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={logout}
          activeOpacity={0.8}
        >
          <LogOut color="#FFF" size={esPantallaGrande ? 26 : 22} />
        </TouchableOpacity>
      </View>

      {/* FlatList Responsivo con Scroll Infinito */}
      <FlatList
        data={locales}
        keyExtractor={(item) => item.idLocal.toString()} 
        contentContainerStyle={[
          styles.scrollContent, 
          esPantallaGrande && styles.tabletContent
        ]}
        showsVerticalScrollIndicator={false}
        
        ListHeaderComponent={
          <Text style={[styles.title, { fontSize: esPantallaGrande ? 38 : 32 }]}>
            Locales
          </Text>
        }
        
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.localItem}
            activeOpacity={0.7}
            // 🔄 Redirección dinámica enviando el idLocal por parámetros de URL
            onPress={() => {
              router.push({
                pathname: '/cuidadora/modulo', // 💡 Modifica esta ruta según la estructura exacta de tus carpetas (ej: '/(cuidadora)/modulos')
                params: { idLocal: item.idLocal }
              });
            }}
          >
            <View style={styles.iconWrapper}>
              <UserRound color="#8A2BE2" size={esPantallaGrande ? 36 : 28} strokeWidth={2.5} />
            </View>
            <View style={styles.textContainer}>
              <Text 
                style={[styles.localName, { fontSize: esPantallaGrande ? 19 : 15 }]}
                numberOfLines={1}
              >
                {item.localNombre} 
              </Text>
              <Text style={styles.localSubtitle} numberOfLines={1}>
                {item.direccion}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        onEndReached={cargarLocales}
        onEndReachedThreshold={0.4}

        ListFooterComponent={() => (
          loading && hasMore ? (
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
    backgroundColor: '#FFF',
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
    marginRight: 15,
  },
  avatarCircle: {
    backgroundColor: '#FFF',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContainer: {
    marginLeft: 12,
    flex: 1,
  },
  welcomeTitle: {
    color: '#00AEEF',
    fontWeight: 'bold',
  },
  userName: {
    color: '#FFF',
    fontWeight: '600',
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: '#FF007A',
    padding: 12,
    borderRadius: 25,
  },
  scrollContent: {
    paddingHorizontal: '6%',
    paddingBottom: 30,
    width: '100%',
  },
  tabletContent: {
    maxWidth: 550,
    alignSelf: 'center',
  },
  title: {
    fontWeight: '900',
    color: '#00AEEF',
    marginBottom: 20,
    marginTop: 25,
  },
  localItem: {
    width: '100%',
    height: 76,
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
    elevation: 2,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 14,
    flex: 1,
    justifyContent: 'center',
  },
  localName: {
    fontWeight: '800',
    color: '#1E293B',
    textTransform: 'uppercase',
  },
  localSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  footerLoading: {
    paddingVertical: 16,
    alignItems: 'center',
  }
});