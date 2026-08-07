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
  1: "#4CAF50", // 6-8 m
  2: "#FF4081", // 9-11 m
  3: "#FFB300", // 12-23 m
  4: "#00BCD4", // 24-36 m
  5: "#9C27B0"  // Actor Comunal
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
  const [datosTarde, setDatosTarde] = useState<any[]>([]);
  const [nombreServicio, setNombreServicio] = useState<string>('');

  // 🔽 Estados para expandir/contraer cada sección de turno (abiertas por defecto)
  const [manianaExpandida, setManianaExpandida] = useState(true);
  const [tardeExpandida, setTardeExpandida] = useState(true);

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

        const [dataManana, dataTarde] = await Promise.all([
          CalculadoraService.getResumenServicio(Number(idServicioAlimentario), fechaYmd, 1),
          CalculadoraService.getResumenServicio(Number(idServicioAlimentario), fechaYmd, 2),
        ]);

        const localesManana = dataManana?.locales || [];
        const localesTarde = dataTarde?.locales || [];

        setDatosManana(localesManana);
        setDatosTarde(localesTarde);
        setNombreServicio(dataManana?.servicioAlimentario || dataTarde?.servicioAlimentario || '');

        // Al cargar datos nuevos (nueva fecha), todos los locales arrancan expandidos
        const clavesIniciales = new Set<string>([
          ...localesManana.map((l: any) => `manana-${l.idLocal}`),
          ...localesTarde.map((l: any) => `tarde-${l.idLocal}`),
        ]);
        setLocalesExpandidos(clavesIniciales);

      } catch (err) {
        console.error("Error al recuperar el resumen de dosificación:", err);
        setDatosManana([]);
        setDatosTarde([]);
      } finally { 
        setLoading(false); 
      }
    };
    
    cargarResumen();
  }, [fecha, idServicioAlimentario]);

  // 🔽 Alterna la visibilidad de una sección de turno con animación suave
  const alternarSeccion = (turno: 'manana' | 'tarde') => {
    LayoutAnimation.configureNext(LayoutAnimation.create(
      220,
      LayoutAnimation.Types.easeInEaseOut,
      LayoutAnimation.Properties.opacity
    ));
    if (turno === 'manana') {
      setManianaExpandida(prev => !prev);
    } else {
      setTardeExpandida(prev => !prev);
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
                <Text style={styles.localName} numberOfLines={1}>{local.nombreLocal}</Text>
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
                              <Text style={styles.categoriaText}>{asis.categoria}</Text>
                            </View>
                            <View style={styles.cantidadBadge}>
                              <Text style={[styles.cantidadText, { color: colorCategoria }]}>
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

  const tieneDatos = datosManana.length > 0 || datosTarde.length > 0;

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
        <Text style={styles.headerTitle}>{params.nombreCentro || 'Totales de Dosificación'}</Text> 
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
            { paddingBottom: 100 + insets.bottom }
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

          {/* Sección Turno Tarde (desplegable) */}
          <View style={[styles.seccionTurno, { marginTop: 15 }]}>
            <TouchableOpacity 
              style={styles.seccionHeader} 
              activeOpacity={0.7}
              onPress={() => alternarSeccion('tarde')}
            >
              <View style={styles.seccionHeaderIzquierda}>
                <Ionicons name="partly-sunny-outline" size={20} color="#006080" style={{marginRight: 6}} />
                <Text style={styles.seccionTitle}>Media Tarde</Text>
              </View>
              <Ionicons 
                name={tardeExpandida ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#006080" 
              />
            </TouchableOpacity>
            {tardeExpandida && (
              datosTarde.length > 0 ? (
                renderLocales(datosTarde, 'tarde')
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
    marginRight: 10,
  },
  localName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    flexShrink: 1,
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
  },
  asistenciaGrid: {
    gap: 8,
  },
  asistenciaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  categoriaBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoriaDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoriaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  cantidadBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 40,
    alignItems: 'center',
  },
  cantidadText: {
    fontSize: 13,
    fontWeight: '800',
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