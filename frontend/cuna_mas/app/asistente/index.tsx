import React from 'react'; 
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  StatusBar,
  useWindowDimensions,
  Alert
} from 'react-native'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useAuth } from '../../context/AuthContext';

export default function InicioSociaCocinas() { 
  const { width } = useWindowDimensions();
  const router = useRouter();
  const insets = useSafeAreaInsets(); 
  const { user, logout } = useAuth();

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
              <Text style={styles.roleLabel}>Socia de Cocina</Text> 
              <Text style={styles.adminWelcome}>Hola, {user?.nombre || 'SOCIA'}</Text> 
            </View> 
          </View> 
          <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}> 
            <MaterialCommunityIcons name="logout" size={20} color="#FFFFFF" /> 
          </TouchableOpacity> 
        </View> 
        <Text style={styles.headerTitle}>Resumen Detallado</Text> 
      </View> 

      {/* Cuerpo del Menú - Dos Botones en el Medio */}
      <View style={styles.content}>
        <View style={styles.menuContainer}>
          
          {/* BOTÓN 1: Calculadora de Alimentos */}
          <TouchableOpacity 
            style={styles.menuButton} 
            activeOpacity={0.8}
            onPress={() => router.push('/asistente/servicioAlimentario')}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
              <Ionicons name="calculator" size={28} color="#006080" />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Consultar Asistencia</Text>
              <Text style={styles.buttonDescription}>Calcula porciones e ingredientes para las raciones diarias.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#006080" />
          </TouchableOpacity>

          {/* BOTÓN 2: Control de Raciones (Ruta de ejemplo o Home) */}
          <TouchableOpacity 
            style={styles.menuButton} 
            activeOpacity={0.8}
            onPress={() => {
router.push('/asistente/servicioAlimentario2')            }}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="restaurant" size={26} color="#16A34A" />
            </View>
            <View style={styles.buttonTextContainer}>
              <Text style={styles.buttonTitle}>Resumen Asistencia</Text>
              <Text style={styles.buttonDescription}>Controla e ingresa el consumo diario de los módulos.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#006080" />
          </TouchableOpacity>

        </View>
      </View> 

      {/* Navegación Inferior */} 
      <View style={styles.bottomNav}> 
        <TouchableOpacity style={styles.navItem} activeOpacity={0.6} onPress={() => router.push('/')}> 
          <Ionicons name="home-outline" size={22} color="#757575" /> 
          <Text style={styles.navLabel}>Inicio</Text> 
        </TouchableOpacity> 
        <TouchableOpacity style={styles.navItem} activeOpacity={0.6} onPress={() => router.push('/asistente/calculadora/categoriaCalculadora')}> 
          <Ionicons name="calculator-outline" size={22} color="#006080" /> 
          <Text style={[styles.navLabel, { color: '#006080', fontWeight: 'bold' }]}>Calculadora</Text> 
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
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  }, 
  adminInfo: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  }, 
  adminAvatar: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    borderWidth: 2, 
    borderColor: '#FFFFFF', 
    marginRight: 10 
  }, 
  roleLabel: { 
    fontSize: 10, 
    color: '#006080', 
    fontWeight: 'bold' 
  }, 
  adminWelcome: { 
    fontSize: 18, 
    color: '#006080', 
    fontWeight: '900' 
  }, 
  logoutButton: { 
    backgroundColor: '#FF0080', 
    width: 38, 
    height: 38, 
    borderRadius: 19, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 2 
  }, 
  headerTitle: { 
    fontSize: 26, 
    color: '#006080', 
    fontWeight: '900', 
    marginTop: 10 
  }, 
  content: { 
    flex: 1, 
    backgroundColor: '#F8FAFC', // Un gris muy claro de fondo para que resalten los botones blancos
  }, 
  menuContainer: {
    padding: 20,
    paddingTop: 30,
    gap: 16, // Espaciado nativo entre tarjetas
  },
  menuButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  buttonTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  bottomNav: { 
    flexDirection: 'row', 
    height: 68, 
    backgroundColor: '#FFFFFF', 
    borderTopWidth: 1, 
    borderTopColor: '#E0E0E0', 
    position: 'absolute', 
    bottom: 0, 
    width: '100%' 
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
  }
});