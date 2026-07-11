import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
  SafeAreaView
} from 'react-native';
import { UserRound, User, LogOut, Home, Calculator, RefreshCw, WifiOff } from 'lucide-react-native';
import { LocalService } from '../../service/centroAtencionService'; 
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InicioCuidadora() {
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const router = useRouter();
  const { user, logout } = useAuth(); 
  
  const insets = useSafeAreaInsets(); 

  const [locales, setLocales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [errorRed, setErrorRed] = useState(false); 

  const reintentarConexion = () => {
    setLocales([]);
    setIsInitialLoad(true);
    setErrorRed(false);
  };

  const cargarLocales = async () => {
    const distritoUsuario = user?.distrito || "CHACHAPOYAS";

    if (loading || errorRed) return;

    setLoading(true);
    try {
      // ✅ Llamamos al servicio sin parámetros de página
      const resultado = await LocalService.getLocalesPorCentro(distritoUsuario);
      setLocales(resultado);
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

  useEffect(() => {
    if (isInitialLoad) {
      cargarLocales();
    }
  }, [user?.distrito, isInitialLoad]);

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 🟢 HEADER PROPIO DE LA PANTALLA INICIO */}
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

      {/* 📜 LISTADO DE LOCALES */}
      <FlatList
        data={locales}
        // ✅ Mantenemos la llave única combinada por precaución
        keyExtractor={(item, index) => `${item.idLocal || 'local'}-${index}`} 
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
        
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#00AEEF" />
            </View>
          ) : errorRed ? (
            <View style={styles.errorContainer}>
              <WifiOff color="#FF007A" size={54} strokeWidth={2} />
              <Text style={styles.errorTitle}>Problemas de Conexión</Text>
              <Text style={styles.errorText}>
                No logramos conectar con el servidor. Verifica que el sistema backend esté encendido o intenta nuevamente.
              </Text>
              <TouchableOpacity 
                style={styles.retryButton} 
                onPress={reintentarConexion}
                activeOpacity={0.8}
              >
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
                {item.direccion || "Dirección no especificada"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        // ✅ Quitamos onEndReached y ListFooterComponent porque ya no hay más páginas que pedir
      />

      {/* 🌟 BARRA DE BOTONES CONTROLADA DINÁMICAMENTE POR LOS INSETS DEL CELULAR */}
      <View 
        style={[
          styles.floatingTabBarContainer, 
          { bottom: Math.max(insets.bottom, 16) } 
        ]}
      >
        <View style={[styles.floatingTabBar, { width: esPantallaGrande ? 320 : '90%' }]}>
          <TouchableOpacity style={styles.tabButton} activeOpacity={0.7}>
            <Home color="#00AEEF" size={24} />
            <Text style={[styles.tabLabel, { color: '#00AEEF' }]}>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tabButton} 
            activeOpacity={0.7}
            onPress={() => router.push('/cuidadora/categoriaCalculadora')}
          >
            <Calculator color="#94A3B8" size={24} />
            <Text style={[styles.tabLabel, { color: '#94A3B8' }]}>Calculadora</Text>
          </TouchableOpacity>
        </View>
      </View>

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
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 15 },
  avatarCircle: { backgroundColor: '#FFF', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  welcomeContainer: { marginLeft: 12, flex: 1 },
  welcomeTitle: { color: '#00AEEF', fontWeight: 'bold' },
  userName: { color: '#FFF', fontWeight: '600', marginTop: 2 },
  logoutButton: { backgroundColor: '#FF007A', padding: 12, borderRadius: 25 },
  scrollContent: {
    paddingHorizontal: '6%',
    paddingBottom: 160, 
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    paddingHorizontal: 25,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#00AEEF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '800',
    fontSize: 14,
  },
  floatingTabBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingTabBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    height: 65,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  tabLabel: {
    fontWeight: '800',
    fontSize: 12,
    marginTop: 2,
  }
});