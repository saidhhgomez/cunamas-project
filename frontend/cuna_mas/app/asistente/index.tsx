import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  FlatList,
  useWindowDimensions,
  ActivityIndicator
} from 'react-native';
import { User, LogOut, UserRound } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext'; 
import { CentroAlimentarioService } from '../../service/servicioAlimentario'; 
import { useRouter } from 'expo-router'; 

export default function ServicioAlimentarioScreen() {
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const router = useRouter();

  // 🌟 Estados para la lista y paginación real del Postman
  const [centros, setCentros] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Función que consume tu API limpia
  const cargarCentrosAlimentarios = async (paginaAEnviar: number, reiniciar: boolean = false) => {
    if (loading) return;

    setLoading(true);
    try {
      // Llamada directa usando solo la página
      const resultado = await CentroAlimentarioService.getCentrosPorDistrito(paginaAEnviar);

      if (resultado.centros.length === 0) {
        setHasMore(false);
      } else {
        setCentros(prevCentros => reiniciar ? resultado.centros : [...prevCentros, ...resultado.centros]);
        
        if (resultado.isLast) {
          setHasMore(false);
        } else {
          setPage(paginaAEnviar + 1);
        }
      }
    } catch (error) {
      console.error("Error al cargar centros en la interfaz:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carga automática inicial al abrir la pantalla
  useEffect(() => {
    setCentros([]);
    setPage(0);
    setHasMore(true);
    cargarCentrosAlimentarios(0, true);
  }, []);

  // Evento disparador cuando se desliza hasta el fondo de la lista
  const manejarSiguientePagina = () => {
    if (!hasMore || loading) return;
    cargarCentrosAlimentarios(page, false);
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header Corporativo Responsivo */}
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
              {user?.nombre || "Asistente"}
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

      {/* FlatList con Scroll Infinito mapeado al JSON de Postman */}
      <FlatList
        data={centros}
        keyExtractor={(item) => item.idCentroAlimentario.toString()} // 🔑 idCentroAlimentario del Postman
        contentContainerStyle={[
          styles.scrollContent, 
          esPantallaGrande && styles.tabletContent
        ]}
        showsVerticalScrollIndicator={false}
        
        ListHeaderComponent={
          <Text style={[styles.title, { fontSize: esPantallaGrande ? 32 : 26 }]}>
            SERVICIO{"\n"}ALIMENTARIO
          </Text>
        }
        
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.centroItem}
            activeOpacity={0.7}
            onPress={() => {
              // Navegación nativa enviando el id capturado en tu Postman
              router.push({
                pathname: '/asistente/locales', 
                params: { idCentroAlimentario: item.idCentroAlimentario }
              });
            }}
          >
            <View style={styles.iconWrapper}>
              <UserRound color="#8A2BE2" size={esPantallaGrande ? 34 : 28} strokeWidth={2.5} />
            </View>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text 
                style={[styles.centroName, { fontSize: esPantallaGrande ? 20 : 16 }]}
                numberOfLines={1}
              >
                {item.nombreCentro} {/* 🏷️ nombreCentro del Postman */}
              </Text>
              <Text style={styles.centroSubtitle} numberOfLines={1}>
                {item.direccion} {/* 🏷️ direccion del Postman */}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        onEndReached={manejarSiguientePagina}
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
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { backgroundColor: '#C5D800', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: '6%', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4 },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 15 },
  avatarCircle: { backgroundColor: '#FFF', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  welcomeContainer: { marginLeft: 12, flex: 1 },
  welcomeTitle: { color: '#00AEEF', fontWeight: 'bold' },
  userName: { color: '#FFF', fontWeight: '600', marginTop: 2 },
  logoutButton: { backgroundColor: '#FF007A', padding: 12, borderRadius: 25 },
  scrollContent: { paddingHorizontal: '6%', paddingBottom: 30, width: '100%' },
  tabletContent: { maxWidth: 550, alignSelf: 'center' },
  title: { fontWeight: '900', color: '#00AEEF', textAlign: 'center', marginBottom: 25, marginTop: 25, letterSpacing: 0.5, lineHeight: 32 },
  centroItem: { width: '100%', height: 76, borderWidth: 2, borderColor: '#8A2BE2', borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 14, backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  iconWrapper: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  centroName: { fontWeight: '800', color: '#1E293B', textTransform: 'uppercase' },
  centroSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  footerLoading: { paddingVertical: 16, alignItems: 'center' }
});