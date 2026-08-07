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
import ModalMensaje, { TipoModalMensaje } from '../../app/components/ModalMensaje';
import BottomNavAdmin from '../components/admin/BottomNavAdmin';
import AdminHeader from '../components/admin/HeaderAdmin';

// Esta pantalla ahora ES "/administrador/inicio" (botón "Inicio" de la barra).
// ⚠️ El archivo debe vivir físicamente en app/administrador/inicio.tsx —
// en expo-router la ruta la define la ubicación del archivo, no el nombre
// del componente. Si ya existe un inicio.tsx con otro contenido, renómbralo
// antes (p. ej. a servicioAlimentario.tsx) para no perderlo.
const RUTA_ACTUAL = '/administrador/inicio';

export default function UsuariosPendientes() { 
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const router = useRouter();
  const insets = useSafeAreaInsets(); 
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 

  // Modal de resultado (reemplaza Alert.alert para mensajes de éxito/error)
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState<TipoModalMensaje>('error');
  const [modalTitulo, setModalTitulo] = useState('');
  const [modalMensaje, setModalMensaje] = useState('');
  
  const isFocused = useIsFocused();

  // Recarga automática al volver a enfocar la pantalla
  useEffect(() => {
    if (isFocused) {
      cargarUsuarios();
    }
  }, [isFocused]);

  const mostrarModal = (tipo: TipoModalMensaje, titulo: string, mensaje: string) => {
    setModalTipo(tipo);
    setModalTitulo(titulo);
    setModalMensaje(mensaje);
    setModalVisible(true);
  };

  const cargarUsuarios = async () => {
    try {
      setIsLoading(true);
      const data = await usuarioService.getUsuariosPendientes();
      setUsers(data); 
    } catch (error) {
      mostrarModal('error', 'Error', 'No se pudo obtener la lista de usuarios pendientes.');
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmación antes de denegar (acción destructiva, requiere elección explícita)
  const confirmarDenegar = (item) => {
    Alert.alert(
      'Denegar Usuario',
      `¿Deseas denegar el acceso de ${item.nombresCompletos}? Ya no aparecerá en esta lista.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Denegar', style: 'destructive', onPress: () => denegarUsuario(item) },
      ]
    );
  };

  const denegarUsuario = async (item) => {
    try {
      setIsLoading(true);
      // ⚠️ Ajustar el nombre del método al real de adminService si difiere
      // (asumido "denegarUsuario" en base al patrón de "getUsuariosPendientes").
      await usuarioService.denegarUsuario(item.idPersona);
      setUsers((prev) => prev.filter((u) => u.idPersona !== item.idPersona));
      mostrarModal('exito', 'Usuario Denegado', `${item.nombresCompletos} fue denegado correctamente.`);
    } catch (error) {
      mostrarModal('error', 'Error', 'No se pudo denegar al usuario. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderUserItem = ({ item }) => ( 
    <TouchableOpacity 
      style={styles.userCard} 
      activeOpacity={0.7}
      onPress={() => router.push({
        pathname: '/administrador/aprobacion', 
        params: { 
          idPersona: item.idPersona 
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

      {/* Denegar: acción rápida sin salir de la lista */}
      <TouchableOpacity 
        style={styles.denyButton}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        onPress={() => confirmarDenegar(item)}
      >
        <Ionicons name="close-circle-outline" size={24} color="#FF3B30" />
      </TouchableOpacity>

      <Ionicons name="chevron-forward" size={20} color="#006080" /> 
    </TouchableOpacity> 
  ); 

  return ( 
<View style={[styles.container, { paddingTop: insets.top }]}>      
  <StatusBar barStyle="light-content" backgroundColor="#C5D800" /> 


<AdminHeader
  user={user}
  titulo="Inicio"
  modo="logout"
  onPress={() => {
    logout();
  }}
/>


<View style={styles.titleBar}>
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
            contentContainerStyle={[
              styles.listContent, 
              esPantallaGrande && styles.listContentGrande,
              { paddingBottom: 100 + insets.bottom } // Agrega padding extra para evitar que el FAB y el nav tapen elementos de la lista
            ]} 
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

      {/* ➕ Burbuja Flotante de Agregar */}
      <TouchableOpacity 
        style={[styles.fabButton, { bottom: 85 + insets.bottom }]} 
        activeOpacity={0.8}
        onPress={() => {
          router.push('/administrador/Acceso'); 
        }}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

{/* Navegación Inferior — componente compartido, misma fuente de verdad en todas las pantallas */} 
<BottomNavAdmin rutaActual={RUTA_ACTUAL} insetsBottom={insets.bottom} />

      {/* Modal de éxito / error (denegar usuario, carga de lista) */}
      <ModalMensaje
        visible={modalVisible}
        tipo={modalTipo}
        titulo={modalTitulo}
        mensaje={modalMensaje}
        onCerrar={() => setModalVisible(false)}
      />
    </View> 
  ); 
}

const styles = StyleSheet.create({ 
  container: { flex: 1, backgroundColor: '#F9F9F9' }, 
header: { 
  backgroundColor: '#C5D800', 
  paddingHorizontal: 20, 
  // 👈 ya no lleva paddingTop acá, se calcula dinámico arriba
},  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }, 
  adminInfo: { flexDirection: 'row', alignItems: 'center' }, 
  adminAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#FFFFFF', marginRight: 10 }, 
  adminAvatarPlaceholder: { backgroundColor: '#006080', justifyContent: 'center', alignItems: 'center' },
  adminAvatarInitial: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  roleLabel: { fontSize: 10, color: '#006080', fontWeight: 'bold' }, 
  adminWelcome: { fontSize: 18, color: '#006080', fontWeight: '900' }, 
  logoutButton: { backgroundColor: '#FF0080', width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', elevation: 2 }, 
headerTitle: { 
  fontSize: 26, 
  color: '#006080', 
  fontWeight: '900' 
}, content: { flex: 1, marginTop: 15 }, 
  listContent: { paddingHorizontal: 20 }, 
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
  denyButton: { paddingHorizontal: 6, marginRight: 2 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyText: { color: '#999', marginTop: 12, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  titleBar: {
  backgroundColor: '#FFFFFF',
  paddingHorizontal: 20,
  paddingTop: 15,
  paddingBottom: 25,
},
  fabButton: {
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
    zIndex: 10,
  }
});