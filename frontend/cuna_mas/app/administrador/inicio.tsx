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
import { usuarioService } from '../../service/adminService'; 
import { useAuth } from '../../context/AuthContext';

export default function UsuariosPendientes() { 
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const router = useRouter();
  const insets = useSafeAreaInsets(); 
  const { user,logout } = useAuth();

  const [users, setUsers] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  
  const isFocused = useIsFocused();

  // Recarga automática al volver a enfocar la pantalla
  useEffect(() => {
    if (isFocused) {
      cargarUsuarios();
    }
  }, [isFocused]);

  const cargarUsuarios = async () => {
    try {
      setIsLoading(true);
      const data = await usuarioService.getUsuariosPendientes();
      setUsers(data); 
    } catch (error) {
      Alert.alert("Error", "No se pudo obtener la lista de usuarios pendientes.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderUserItem = ({ item }) => ( 
    <TouchableOpacity 
      style={styles.userCard} 
      activeOpacity={0.7}
      onPress={() => router.push({
        pathname: '/administrador/aprobacion', // ✅ Apunta a tu pantalla de asignación
        params: { 
          idPersona: item.idPersona // ✅ Solo pasamos el ID, el destino resolverá el resto por API
        }
      })} 
    > 
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{item.nombresCompletos?.charAt(0).toUpperCase()}</Text>
      </View>

      <View style={styles.userInfo}> 
        <Text style={styles.userName} numberOfLines={1}>{item.nombresCompletos}</Text> 
        <View style={styles.dniRow}> 
          <Ionicons name="card-outline" size={14} color="#777" /> 
          <Text style={styles.userDni}> DNI: {item.numeroDocumento}</Text> 
        </View> 
        <View style={styles.statusBadge}> 
          <Text style={styles.statusText}>PENDIENTE</Text> 
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
              <Text style={styles.adminWelcome}>Hola, {user?.nombre}</Text> 
            </View> 
          </View> 
          <TouchableOpacity style={styles.logoutButton}           onPress={logout}
activeOpacity={0.8}> 
            <MaterialCommunityIcons name="logout" size={20} color="#FFFFFF" /> 
          </TouchableOpacity> 
        </View> 
        <Text style={styles.headerTitle}>Usuarios Pendientes</Text> 
      </View> 

      {/* Cuerpo de la Lista */}
      <View style={styles.content}> 
        {isLoading && users.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#006080" />
          </View>
        ) : (
          <FlatList 
            data={users} 
            renderItem={renderUserItem} 
            keyExtractor={item => item.idPersona.toString()} 
            contentContainerStyle={[styles.listContent, esPantallaGrande && styles.listContentGrande]} 
            showsVerticalScrollIndicator={false} 
            refreshing={isLoading}
            onRefresh={cargarUsuarios}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={54} color="#CCCCCC" />
                <Text style={styles.emptyText}>No hay usuarios pendientes de aprobación</Text>
              </View>
            }
          /> 
        )}
      </View> 

      {/* Navegación Inferior */} 
      <View style={styles.bottomNav}> 
        <TouchableOpacity style={styles.navItem} activeOpacity={0.6} onPress={() => router.push('/InicioAdmin')}> 
          <Ionicons name="home-outline" size={22} color="#757575" /> 
          <Text style={styles.navLabel}>Inicio</Text> 
        </TouchableOpacity> 
        <TouchableOpacity style={styles.navItem} activeOpacity={0.6}> 
          <Ionicons name="calculator-outline" size={22} color="#006080" /> 
          <Text style={[styles.navLabel, { color: '#006080', fontWeight: 'bold' }]}>Calculadora</Text> 
        </TouchableOpacity> 
      </View> 
    </View> 
  ); 
}

const styles = StyleSheet.create({ 
  container: { flex: 1, backgroundColor: '#F9F9F9' }, 
  header: { backgroundColor: '#C5D800', paddingTop: 20, paddingHorizontal: 20, paddingBottom: 40, borderBottomRightRadius: 60 }, 
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }, 
  adminInfo: { flexDirection: 'row', alignItems: 'center' }, 
  adminAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#FFFFFF', marginRight: 10 }, 
  roleLabel: { fontSize: 10, color: '#006080', fontWeight: 'bold' }, 
  adminWelcome: { fontSize: 18, color: '#006080', fontWeight: '900' }, 
  logoutButton: { backgroundColor: '#FF0080', width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', elevation: 2 }, 
  headerTitle: { fontSize: 26, color: '#006080', fontWeight: '900', marginTop: 10 }, 
  content: { flex: 1, marginTop: 15 }, 
  listContent: { paddingHorizontal: 20, paddingBottom: 100 }, 
  listContentGrande: { maxWidth: 800, alignSelf: 'center', width: '100%' },
  userCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 }, 
  avatarPlaceholder: { width: 52, height: 52, borderRadius: 26, marginRight: 15, backgroundColor: '#006080', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  userInfo: { flex: 1, paddingRight: 10 }, 
  userName: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 }, 
  dniRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 }, 
  userDni: { fontSize: 13, color: '#777' }, 
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', backgroundColor: '#FFEBE6' }, 
  statusText: { fontSize: 10, color: '#FF3B30', fontWeight: 'bold' }, 
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyText: { color: '#999', marginTop: 12, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  bottomNav: { flexDirection: 'row', height: 68, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E0E0E0', position: 'absolute', bottom: 0, width: '100%' }, 
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' }, 
  navLabel: { fontSize: 11, marginTop: 4, color: '#757575' }
});