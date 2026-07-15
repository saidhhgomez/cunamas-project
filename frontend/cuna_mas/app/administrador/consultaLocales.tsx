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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useAuth } from '../../context/AuthContext';
import { Calculator, Home } from 'lucide-react-native';
import { LocalService } from '../../service/centroAtencionService'; 

export default function ConsultaLocales() { 
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const router = useRouter();
  const insets = useSafeAreaInsets(); 
  const { user, logout } = useAuth();
  const { idCentroAlimentario } = useLocalSearchParams();

  const [centros, setCentros] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  
  const isFocused = useIsFocused();

  // Recarga automática al volver a enfocar la pantalla
  useEffect(() => {
    if (isFocused) {
      cargarCentrosAlimentarios();
    }
  }, [isFocused]);

  const cargarCentrosAlimentarios = async () => {
    try {
      setIsLoading(true);
      const response = await LocalService.getLocalesPorCentroPaginado(Number(idCentroAlimentario)); 
      
      // Validamos la estructura del JSON con la propiedad "content"
      if (response && response.content) {
        setCentros(response.content);
      } else if (Array.isArray(response)) {
        setCentros(response); 
      } else {
        setCentros([]);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo obtener la lista de centros alimentarios.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderCentroItem = ({ item }) => ( 
    <TouchableOpacity 
      style={styles.userCard} 
      activeOpacity={0.7}
      onPress={() => router.push({
        pathname: '/administrador/consultasModulo', 
        params: { idLocal: item.idLocal } // Pasamos el idLocal de tu JSON
      })} 
    > 
      {/* Inicial del local para el avatar circular */}
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{item.localNombre?.charAt(0).toUpperCase()}</Text>
      </View>

      <View style={styles.userInfo}> 
        {/* Nombre del Local */}
        <Text style={styles.userName} numberOfLines={1}>{item.localNombre}</Text> 
        
        {/* Servicio Alimentario / Comedor */}
        <View style={styles.dniRow}> 
          <Ionicons name="people-outline" size={14} color="#777" /> 
          <Text style={styles.userDni} numberOfLines={1}> {item.servicioAlimentario}</Text> 
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

  return ( 
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}> 
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
              <Text style={styles.adminWelcome}>Hola, {user?.nombre || 'ADMINISTRADOR SISTEMA'}</Text> 
            </View> 
          </View> 
          <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}> 
            <MaterialCommunityIcons name="logout" size={20} color="#FFFFFF" /> 
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
            keyExtractor={item => item.idLocal.toString()} // Usamos idLocal como key única
            contentContainerStyle={[styles.listContent, esPantallaGrande && styles.listContentGrande]} 
            showsVerticalScrollIndicator={false} 
            refreshing={isLoading}
            onRefresh={cargarCentrosAlimentarios}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="fast-food-outline" size={54} color="#CCCCCC" />
                <Text style={styles.emptyText}>No hay centros alimentarios registrados</Text>
              </View>
            }
          /> 
        )}
      </View> 

      {/* Burbuja Flotante de Agregar */}
      <TouchableOpacity 
        style={styles.fabButton}
        activeOpacity={0.85}
        onPress={() => router.push({
          pathname: '/administrador/agregarCentro', // Reemplaza por tu ruta exacta de registro si varía
          params: { idCentroAlimentario: idCentroAlimentario }
        })}
      >
        <Ionicons name="add" size={28} color="#006080" />
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
  listContent: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 15 }, // padding aumentado para evitar que el FAB tape el contenido útil
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
  
  // Burbuja flotante (FAB)
  fabButton: {
    position: 'absolute',
    bottom: 92, // Se posiciona cómodamente encima del bottomNav (72px)
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
  navLabel: { fontSize: 11, marginTop: 4, color: '#757575' }
});