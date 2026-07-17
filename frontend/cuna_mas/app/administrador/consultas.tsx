import React, { useState, useEffect } from 'react'; 
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
  useWindowDimensions
} from 'react-native'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useAuth } from '../../context/AuthContext';
import { Calculator, Home } from 'lucide-react-native';
import { CentroAlimentarioService } from '../../service/servicioAlimentario'; 

export default function Consulta() { 
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const router = useRouter();
  const insets = useSafeAreaInsets(); 
  const { user } = useAuth(); // Se removió 'logout' de aquí ya que no se usa

  const [centros, setCentros] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  
  // --- ESTADOS PARA PAGINACIÓN ---
  const [pagina, setPagina] = useState(0);
  const [esUltimaPagina, setEsUltimaPagina] = useState(false);
  const [isCargandoMas, setIsCargandoMas] = useState(false);
  
  const isFocused = useIsFocused();

  // Recarga automática al volver a enfocar la pantalla (Reinicia a página 0)
  useEffect(() => {
    if (isFocused) {
      reiniciarYObtenerCentros();
    }
  }, [isFocused]);

  // Función para limpiar estados al refrescar o entrar de cero
  const reiniciarYObtenerCentros = async () => {
    setIsLoading(true);
    setPagina(0);
    setEsUltimaPagina(false);
    await cargarCentrosAlimentarios(0, true);
    setIsLoading(false);
  };

  const cargarCentrosAlimentarios = async (numPagina, reiniciar = false) => {
    try {
      // Tu servicio devuelve: { centros: [...], isLast: boolean }
      const response = await CentroAlimentarioService.getCentrosPorDistrito(numPagina); 
      
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
      Alert.alert("Error", "No se pudo obtener la lista de centros alimentarios.");
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

  const renderCentroItem = ({ item }) => ( 
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
      
      {/* Header */} 
      <View style={styles.header}> 
        <View style={styles.headerTop}> 
          <View style={styles.adminInfo}> 
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }} 
              style={styles.adminAvatar} 
            /> 
            <View> 
              <Text style={styles.roleLabel}>Administrador</Text> 
              <Text style={styles.adminWelcome}>{user?.nombre || 'ADMINISTRADOR SISTEMA'}</Text> 
            </View> 
          </View> 
          {/* MODIFICADO: Cambiado el botón de salir por un botón de volver atrás */}
          <TouchableOpacity style={styles.logoutButton} onPress={() => router.back()} activeOpacity={0.8}> 
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" /> 
          </TouchableOpacity> 
        </View> 
        <Text style={styles.headerTitle}>Consulta</Text> 
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
            refreshing={isLoading}
            onRefresh={reiniciarYObtenerCentros} // Reinicia desde pág 0
            onEndReached={cargarMasElementos}    // Detecta final de lista
            onEndReachedThreshold={0.3}          // Umbral de disparo
            ListFooterComponent={renderFooter}   // Loader al pie de lista
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="fast-food-outline" size={54} color="#CCCCCC" />
                <Text style={styles.emptyText}>No hay centros alimentarios registrados</Text>
              </View>
            }
          /> 
        )}
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

      {/* Navegación Inferior (3 Botones) */} 
      <View style={[styles.bottomNav, { height: 68 + insets.bottom, paddingBottom: insets.bottom }]}> 
        {/* Botón 1: Inicio */}
        <TouchableOpacity style={styles.navItem} activeOpacity={0.6} onPress={() => router.push('/administrador/inicio')}> 
          <Ionicons name="home-outline" size={22} color="#757575" /> 
          <Text style={styles.navLabel}>Inicio</Text> 
        </TouchableOpacity> 

        {/* Botón 2: Pendientes (Pantalla Actual Activa) */}
        <TouchableOpacity style={styles.navItem} activeOpacity={0.6} onPress={() => router.push('/administrador/consultas')}> 
          <Ionicons name="people" size={22} color="#006080" /> 
          <Text style={[styles.navLabel, { color: '#006080', fontWeight: 'bold' }]}>Pendientes</Text> 
        </TouchableOpacity> 

        {/* Botón 3: Calculadora / Consultas */}
        <TouchableOpacity style={styles.navItem} activeOpacity={0.6} onPress={() => router.push('/administrador/calculadora/categoriaCalculadora')}> 
          <Ionicons name="calculator-outline" size={22} color="#757575" /> 
          <Text style={styles.navLabel}>Calculadora</Text> 
        </TouchableOpacity> 
      </View> 
    </View> 
  ); 
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' }, 
  header: { 
    backgroundColor: '#C5D800', 
    paddingTop: 20, 
    paddingHorizontal: 20, 
    paddingBottom: 40, 
    borderBottomRightRadius: 60 
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
  headerTitle: { fontSize: 26, color: '#006080', fontWeight: '900', marginTop: 10 }, 
  content: { flex: 1 }, 
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
  
  bottomNav: { 
    flexDirection: 'row', 
    height: 72, 
    backgroundColor: '#FFFFFF', 
    borderTopWidth: 1, 
    borderTopColor: '#E2E8F0', 
    position: 'absolute', 
    bottom: 0, 
    width: '100%',
    paddingBottom: 4, 
    elevation: 8, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  }, 
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' }, 
  navLabel: { fontSize: 11, marginTop: 4, color: '#757575' },

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