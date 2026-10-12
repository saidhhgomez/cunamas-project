import React, { useState, useEffect } from 'react'; 
import { 
  StyleSheet, View, Text, TouchableOpacity,
  useWindowDimensions, StatusBar, ScrollView, ActivityIndicator,
  Platform, LayoutAnimation, UIManager
} from 'react-native'; 
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Calculator, Home } from 'lucide-react-native';

// Importamos tu servicio real de calculadora
import { CalculadoraService } from '../../service/calculadoraService'; 
import HeaderCocina from '../components/sociaCocina/HeaderCocina';
import BottomNavCocina from '../components/sociaCocina/BottomNavCocina';

// Habilita LayoutAnimation en Android (en iOS ya viene activado por defecto)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MAPA_COLORES: Record<number, string> = {
  1: "#B7C900", // 6-8 m
  2: "#F57C00", // 9-11 m
  3: "#009B16", // 12-23 m
  4: "#2F75B5", // 24-36 m
  5: "#9C27B0"  // Actor Comunal
};

const obtenerNombreCategoria = (asistencia: any) => {
  const mapaNombres: Record<number, string> = {
    1: 'Niños 6-8 m',
    2: 'Niños 9-11 m',
    3: 'Niños 12-23 m',
    4: 'Niños 24-36 m',
    5: 'Actor Comunal',
  };

  if (asistencia.idCategoriaGrupo === 5) return mapaNombres[5];

  const nombre = String(asistencia.categoria || '').trim();
  if (asistencia.idCategoriaGrupo >= 1 && asistencia.idCategoriaGrupo <= 4) {
    return nombre.toLowerCase().includes('niño') ? nombre : `Niños ${nombre}`;
  }

  return nombre || mapaNombres[asistencia.idCategoriaGrupo] || `Categoría ${asistencia.idCategoriaGrupo}`;
};

export default function Resumen() { 
  const router = useRouter();
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const insets = useSafeAreaInsets();
  const { user } = useAuth(); 
  
  const params = useLocalSearchParams();
  const idServicioAlimentario = params.idCentroAlimentario || params.idServicioAlimentario || params.idModulo;
  const RUTA_ACTUAL = '/asistente/resumen2';

  // Estados de Filtros (ya no hay selector de turno: se cargan ambos)
  const [fecha, setFecha] = useState(new Date());
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);

  // Estados de carga y datos de la API, separados por turno
  const [loading, setLoading] = useState<boolean>(false);
  const [datosManana, setDatosManana] = useState<any[]>([]);
  const [nombreServicio, setNombreServicio] = useState<string>('');

  // 🔽 Estados para expandir/contraer cada sección de turno (abiertas por defecto)
  const [manianaExpandida, setManianaExpandida] = useState(true);

  // 🔽 Estado para expandir/contraer cada TARJETA DE LOCAL individualmente.
  // Usamos un Set con una clave única "turno-idLocal" ya que puede haber
  // varios locales por turno y locales con el mismo idLocal en ambos turnos.
  const [localesExpandidos, setLocalesExpandidos] = useState<Set<string>>(new Set());

  // Helper para formatear fecha
  const formatearFechaParaAPI = (date: Date) => {
    const año = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0'); 
    const dia = String(date.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };

  // Carga ambos turnos en paralelo apenas hay fecha + servicio, sin
  // necesidad de que el usuario elija un turno primero.
  useEffect(() => {
    const cargarResumen = async () => {
      if (!idServicioAlimentario) return;
      
      try {
        setLoading(true);
        const fechaYmd = formatearFechaParaAPI(fecha);

        const dataManana = await CalculadoraService.getResumenServicio(Number(idServicioAlimentario), fechaYmd, 1);

        const localesManana = dataManana?.locales || [];

        setDatosManana(localesManana);
        setNombreServicio(dataManana?.servicioAlimentario || '');

        const clavesIniciales = new Set<string>([
          ...localesManana.map((l: any) => `manana-${l.idLocal}`),
        ]);
        setLocalesExpandidos(clavesIniciales);

      } catch (err) {
        console.error("Error al recuperar el resumen de dosificación:", err);
        setDatosManana([]);
      } finally { 
        setLoading(false); 
      }
    };
    
    cargarResumen();
  }, [fecha, idServicioAlimentario]);

  // 🔽 Alterna la visibilidad de una sección de turno con animación suave
  const alternarSeccion = (turno: 'manana') => {
    LayoutAnimation.configureNext(LayoutAnimation.create(
      220,
      LayoutAnimation.Types.easeInEaseOut,
      LayoutAnimation.Properties.opacity
    ));
    if (turno === 'manana') {
      setManianaExpandida(prev => !prev);
    }
  };

  // 🔽 Alterna la visibilidad de una tarjeta de local individual
  const alternarLocal = (clave: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.create(
      200,
      LayoutAnimation.Types.easeInEaseOut,
      LayoutAnimation.Properties.opacity
    ));
    setLocalesExpandidos(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(clave)) {
        nuevo.delete(clave);
      } else {
        nuevo.add(clave);
      }
      return nuevo;
    });
  };

  // Renderiza las tarjetas de locales/módulos de un turno (se reutiliza para mañana y tarde)
  const renderLocales = (datosLocales: any[], turno: 'manana' | 'tarde') => (
    <View>
      {datosLocales.map((local) => {
        const claveLocal = `${turno}-${local.idLocal}`;
        const localExpandido = localesExpandidos.has(claveLocal);

        return (
          <View key={claveLocal} style={styles.localCard}>
            
            {/* Nombre del Local (ahora desplegable) */}
            <TouchableOpacity 
              style={styles.localHeader} 
              activeOpacity={0.75}
              onPress={() => alternarLocal(claveLocal)}
            >
              <View style={styles.localHeaderIzquierda}>
                <Ionicons name="business" size={20} color="#FFFFFF" />
                <Text style={styles.localName} numberOfLines={2}>{local.nombreLocal}</Text>
              </View>
              <Ionicons 
                name={localExpandido ? "chevron-up" : "chevron-down"} 
                size={18} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>

            {/* Módulos de este Local */}
            {localExpandido && (
              <View style={styles.localBody}>
                {local.modulos?.map((modulo: any) => (
                  <View key={modulo.idModulo} style={styles.moduloContainer}>
                    
                    {/* Nombre del Módulo */}
                    <View style={styles.moduloHeader}>
                      <View style={styles.moduloIndicator} />
                      <Text style={styles.moduloName}>{modulo.nombreModulo}</Text>
                    </View>

                    {/* Categorías y Cantidades */}
                    <View style={styles.asistenciaGrid}>
                      {modulo.asistencia?.map((asis: any) => {
                        const colorCategoria = MAPA_COLORES[asis.idCategoriaGrupo] || "#64748B";
                        return (
                          <View key={asis.idCategoriaGrupo} style={styles.asistenciaRow}>
                            <View style={styles.categoriaBadgeContainer}>
                              <View style={[styles.categoriaDot, { backgroundColor: colorCategoria }]} />
                              <Text style={styles.categoriaText}>{obtenerNombreCategoria(asis)}</Text>
                            </View>
                            <View style={[styles.cantidadBadge, { backgroundColor: colorCategoria }]}>
                              <Text style={[styles.cantidadText, { color: '#FFFFFF' }]}> 
                                {asis.cantidad}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>

                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );

  const tieneDatos = datosManana.length > 0;

  return ( 
    <View style={[styles.container, { paddingTop: insets.top }]}> 
      <StatusBar barStyle="light-content" backgroundColor="#C5D800" /> 
      
      {/* Header (mismo estilo que las otras pantallas) */}
      <HeaderCocina
        user={user}
        titulo=""
        modo="volver"
        onPress={() => router.back()}
      />   

      {/* Barra de título blanca */}
      <View style={styles.titleBar}>
        <Text style={styles.headerTitle} allowFontScaling={false} numberOfLines={2}>{params.nombreCentro || 'Totales de Dosificación'}</Text>
      </View>

      {/* Selector de Fecha (el de turno ya no existe: se cargan ambos siempre) */}
      <View style={styles.pickerContainerOuter}>
        <View style={[styles.pickerContainer, esPantallaGrande && styles.pickerContainerGrande]}>
          <TouchableOpacity style={styles.customPickerButtonFull} onPress={() => setMostrarDatePicker(true)}>
            <Text style={styles.pickerSelectedText}>{fecha.toLocaleDateString()}</Text>
            <Ionicons name="calendar-outline" size={18} color="#006080" />
          </TouchableOpacity>
          {mostrarDatePicker && (
            <DateTimePicker 
              value={fecha} 
              mode="date" 
              display="default" 
              onChange={(e, d) => { setMostrarDatePicker(false); if(d) setFecha(d); }} 
            />
          )}
        </View>
      </View>

      {/* Contenido Dinámico */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#006080" />
          <Text style={styles.loadingText}>Cargando resumen de asistencia...</Text>
        </View>
      ) : !tieneDatos ? (
        <View style={styles.centerContainer}>
          <Ionicons name="information-circle-outline" size={48} color="#64748B" />
          <Text style={styles.noDataText}>No se encontraron datos de asistencia para la fecha seleccionada.</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={[
            styles.scrollContent, 
            esPantallaGrande && styles.pickerContainerGrande,
            { paddingBottom: 170 + insets.bottom }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Sección Turno Mañana (desplegable) */}
          <View style={styles.seccionTurno}>
            <TouchableOpacity 
              style={styles.seccionHeader} 
              activeOpacity={0.7}
              onPress={() => alternarSeccion('manana')}
            >
              <View style={styles.seccionHeaderIzquierda}>
                <Ionicons name="sunny-outline" size={20} color="#006080" style={{marginRight: 6}} />
                <Text style={styles.seccionTitle}>Media Mañana</Text>
              </View>
              <Ionicons 
                name={manianaExpandida ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#006080" 
              />
            </TouchableOpacity>
            {manianaExpandida && (
              datosManana.length > 0 ? (
                renderLocales(datosManana, 'manana')
              ) : (
                <Text style={styles.seccionVaciaText}>Sin registros de asistencia para este turno.</Text>
              )
            )}
          </View>


        </ScrollView>
      )}

      <BottomNavCocina rutaActual={RUTA_ACTUAL} insetsBottom={insets.bottom} />

    </View> 
  ); 
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' }, 

  // Header (mismo estilo que las otras pantallas)
  header: { 
    backgroundColor: '#C5D800', 
    paddingHorizontal: 20, 
  }, 
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }, 
  adminInfo: { flexDirection: 'row', alignItems: 'center' }, 
  adminAvatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 10 }, 
  roleLabel: { fontSize: 10, color: '#006080', fontWeight: 'bold' }, 
  adminWelcome: { fontSize: 18, color: '#006080', fontWeight: '900' }, 
  logoutButton: { 
    backgroundColor: '#FF007A', 
    width: 38, height: 38, borderRadius: 19, 
    justifyContent: 'center', alignItems: 'center', elevation: 2 
  }, 

  // Barra de título blanca
  titleBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 20, color: '#006080', fontWeight: '900' }, 

  content: { flex: 1 }, 
  pickerContainerOuter: { backgroundColor: '#FFFFFF', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  pickerContainer: { paddingHorizontal: 20 },
  pickerContainerGrande: { maxWidth: 800, alignSelf: 'center', width: '100%' },
  customPickerButtonFull: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 2, 
    borderColor: '#E2E8F0', 
    borderRadius: 16, 
    height: 48, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    elevation: 1 
  },
  pickerSelectedText: { color: '#333333', fontWeight: '800', fontSize: 13, flex: 1 },
  
  scrollContent: { padding: 20 },

  seccionTurno: { backgroundColor: '#F8FAFC', borderRadius: 20, padding: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  seccionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 4, 
    marginLeft: 4,
    paddingVertical: 8,
  },
  seccionHeaderIzquierda: { flexDirection: 'row', alignItems: 'center' },
  seccionTitle: { fontSize: 16, fontWeight: '800', color: '#006080' },
  seccionVaciaText: { fontSize: 13, color: '#94A3B8', fontWeight: '500', paddingHorizontal: 8, paddingVertical: 10 },

  localCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  localHeader: {
    backgroundColor: '#006080',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  localHeaderIzquierda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  localName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    flexShrink: 1,
    lineHeight: 20,
    minWidth: 0,
  },
  localBody: {
    padding: 16,
  },
  moduloContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 16,
  },
  moduloHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  moduloIndicator: {
    width: 6,
    height: 16,
    borderRadius: 3,
    backgroundColor: '#C5D800',
  },
  moduloName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    flexShrink: 1,
  },
  asistenciaGrid: {
    gap: 8,
  },
  asistenciaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  categoriaBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  categoriaDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  categoriaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    flexShrink: 1,
    lineHeight: 18,
    minWidth: 0,
  },
  cantidadBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 74,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cantidadText: {
    fontSize: 14,
    fontWeight: '900',
    includeFontPadding: false,
    color: '#FFFFFF',
  },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  instructionTitle: { fontSize: 20, fontWeight: '800', color: '#006080', marginTop: 15, marginBottom: 8 },
  loadingText: { marginTop: 12, color: '#006080', fontWeight: '600' },
  noDataText: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },

  // Nav inferior (mismo estilo que las otras pantallas)
  bottomNav: { 
    flexDirection: 'row', 
    backgroundColor: '#FFFFFF', 
    borderTopWidth: 1, 
    borderTopColor: '#E0E0E0', 
    position: 'absolute', 
    bottom: 0, 
    width: '100%' 
  }, 
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' }, 
  navLabel: { fontSize: 11, marginTop: 4, color: '#757575' },
});