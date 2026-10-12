import React from 'react'; 
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  StatusBar,
  useWindowDimensions
} from 'react-native'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useAuth } from '../../context/AuthContext';
import HeaderCocina from '../components/sociaCocina/HeaderCocina';
import BottomNavCocina from '../components/sociaCocina/BottomNavCocina';

export default function InicioSociaCocinas() { 
  const { width } = useWindowDimensions();
  const router = useRouter();
  const insets = useSafeAreaInsets(); 
  const { user, logout } = useAuth();
  const RUTA_ACTUAL = '/asistente/';



  return ( 
    <View style={[styles.container, { paddingTop: insets.top }]}> 
      <StatusBar barStyle="light-content" backgroundColor="#C5D800" /> 
      
    <HeaderCocina
      user={user}
      titulo=""
      modo="logout"
      onPress={() => {
        logout();
      }}
    />

      {/* Barra de título blanca (igual patrón que las otras pantallas) */}
      <View style={styles.titleBar}>
        <Text style={styles.headerTitle} allowFontScaling={false}>Resumen Detallado</Text> 
      </View>

      {/* Cuerpo del Menú - Botones en el Medio */}
      <View style={styles.content}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
        >
          <View style={styles.menuContainer}>
            
            {/* BOTÓN 2: Consultar Asistencia */}
            <TouchableOpacity 
              style={styles.menuButton} 
              activeOpacity={0.8}
              onPress={() => router.push('/asistente/servicioAlimentario')}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="list" size={26} color="#006080" />
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle} numberOfLines={2} ellipsizeMode="tail">Consultar Asistencia</Text>
                <Text style={styles.buttonDescription} numberOfLines={3} ellipsizeMode="tail">
                  Consulta centros y servicios alimentarios según el distrito.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#006080" />
            </TouchableOpacity>

            {/* BOTÓN 3: Control de Raciones */}
            <TouchableOpacity 
              style={styles.menuButton} 
              activeOpacity={0.8}
              onPress={() => {
                router.push('/asistente/servicioAlimentario2')
              }}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="restaurant" size={26} color="#16A34A" />
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle} numberOfLines={2} ellipsizeMode="tail">Resumen Asistencia</Text>
                <Text style={styles.buttonDescription} numberOfLines={3} ellipsizeMode="tail">
                  Controla e ingresa el consumo diario de los módulos.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#006080" />
            </TouchableOpacity>

            {/* BOTÓN 3: Exportar PDF */}
            <TouchableOpacity 
              style={styles.menuButton} 
              activeOpacity={0.8}
              onPress={ ()=>router.push('/asistente/reportePdf') }

            >
              <View style={[styles.iconContainer, { backgroundColor: '#FEF2F2' }]}>
                <Ionicons name="document-text" size={26} color="#DC2626" />
              </View>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonTitle} numberOfLines={2} ellipsizeMode="tail">Exportar PDF</Text>
                <Text style={styles.buttonDescription} numberOfLines={3} ellipsizeMode="tail">
                  Descarga el resumen detallado en formato PDF.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#006080" />
            </TouchableOpacity>

          </View>
        </ScrollView>
      </View> 

    <BottomNavCocina rutaActual={RUTA_ACTUAL} insetsBottom={insets.bottom} />

    </View> 
  ); 
}

const styles = StyleSheet.create({ 
  container: { flex: 1, backgroundColor: '#F9F9F9' }, 

  header: { 
    backgroundColor: '#C5D800', 
    paddingHorizontal: 20, 
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

  titleBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 25,
  },
  headerTitle: { 
    fontSize: 26, 
    color: '#006080', 
    fontWeight: '900' 
  }, 

  content: { 
    flex: 1, 
    backgroundColor: '#F8FAFC',
  }, 
  scrollContent: {
    paddingBottom: 40,
  },
  menuContainer: {
    padding: 20,
    paddingTop: 30,
    gap: 16,
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
    minHeight: 90,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    flexShrink: 0,
  },
  buttonTextContainer: {
    flex: 1,
    paddingRight: 8,
    flexShrink: 1,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
    flexShrink: 1,
    includeFontPadding: false,
  },
  buttonDescription: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    flexShrink: 1,
  },

  bottomNav: { 
    flexDirection: 'row', 
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