import React, { useState, useEffect } from 'react'; 
import { 
  StyleSheet, View, Text, FlatList, TouchableOpacity,
  useWindowDimensions, Modal, StatusBar, ScrollView, ActivityIndicator
} from 'react-native'; 
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { Calculator, Home } from 'lucide-react-native';

// Importamos tu servicio real de calculadora
import { CalculadoraService } from '../../service/calculadoraService'; 

// Ajustamos las opciones quitando "Vista General"
const OPCIONES_CORRELATIVO = [
  { label: 'Media Mañana', value: 1 },
  { label: 'Media Tarde', value: 2 },
];

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
  const { user, logout } = useAuth(); 
  
  const params = useLocalSearchParams();
  const idServicioAlimentario = params.idCentroAlimentario || params.idServicioAlimentario || params.idModulo;

  // Estados de Filtros
  const [fecha, setFecha] = useState(new Date());
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  
  // Iniciamos en null para obligar a que se elija un turno real primero
  const [selectedCorrelativo, setSelectedCorrelativo] = useState<any>(null); 
  const [modalCorrelativoVisible, setModalCorrelativoVisible] = useState(false);

  // Estados de carga y datos de la API
  const [loading, setLoading] = useState<boolean>(false);
  const [datosLocales, setDatosLocales] = useState<any[]>([]);
  const [nombreServicio, setNombreServicio] = useState<string>('');

  // Helper para formatear fecha
  const formatearFechaParaAPI = (date: Date) => {
    const año = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0'); 
    const dia = String(date.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };

  // Efecto protegido
  useEffect(() => {
    const cargarResumen = async () => {
      // Si no hay ID de servicio o aún no se ha seleccionado un turno (1 o 2), NO llamamos a la API
      if (!idServicioAlimentario || selectedCorrelativo === null) {
        return; 
      }
      
      try {
        setLoading(true);
        const fechaYmd = formatearFechaParaAPI(fecha);
        const correlativoNum = selectedCorrelativo.value; // Será 1 o 2

        const data = await CalculadoraService.getResumenServicio(
          Number(idServicioAlimentario), 
          fechaYmd, 
          correlativoNum
        );

        if (data) {
          setDatosLocales(data.locales || []);
          setNombreServicio(data.servicioAlimentario || '');
        } else {
          setDatosLocales([]);
          setNombreServicio('');
        }

      } catch (err) {
        console.error("Error al recuperar el resumen de dosificación:", err);
        setDatosLocales([]);
      } finally { 
        setLoading(false); 
      }
    };
    
    cargarResumen();
  }, [selectedCorrelativo, fecha, idServicioAlimentario]);

  return ( 
    <View style={styles.container}> 
      <StatusBar barStyle="light-content" backgroundColor="#C5D800" /> 
      
      {/* Header */}
      <View style={styles.header}> 
        <View style={styles.headerTop}> 
          <View style={styles.adminInfo}> 
            <View style={styles.adminAvatarCircle}>
              <Ionicons name="person" size={22} color="#006080" />
            </View>
            <View> 
              <Text style={styles.roleLabel}>Socia de Cocina</Text> 
              <Text style={styles.adminWelcome}>Hola, {user?.nombre || 'SOCIA'}</Text> 
            </View> 
          </View> 
          <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}> 
            <MaterialCommunityIcons name="logout" size={20} color="#FFFFFF" /> 
          </TouchableOpacity> 
        </View> 
        <Text style={styles.headerTitle}>{nombreServicio || 'Totales de Dosificación'}</Text> 
      </View> 

      {/* Selectores Superiores de Filtro */}
      <View style={styles.pickerContainerOuter}>
        <View style={[styles.pickerContainer, esPantallaGrande && styles.pickerContainerGrande]}>
          <View style={styles.pickerRow}>
            
            {/* Selector de Fecha */}
            <TouchableOpacity style={styles.customPickerButton} onPress={() => setMostrarDatePicker(true)}>
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

            {/* Selector de Turno */}
            <TouchableOpacity style={styles.customPickerButton} onPress={() => setModalCorrelativoVisible(true)}>
              <Text 
                style={[
                  styles.pickerButtonText, 
                  selectedCorrelativo ? styles.pickerSelectedText : styles.pickerPlaceholderText
                ]} 
                numberOfLines={1}
              >
                {selectedCorrelativo ? selectedCorrelativo.label : "Seleccionar Turno"}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#006080" />
            </TouchableOpacity>

          </View>
        </View>
      </View>

      {/* Contenido Dinámico */}
      {selectedCorrelativo === null ? (
        // Estado Inicial: Invitar a elegir turno
        <View style={styles.centerContainer}>
          <Ionicons name="options-outline" size={64} color="#006080" style={{ marginBottom: 10 }} />
          <Text style={styles.instructionTitle}>¡Casi listo!</Text>
          <Text style={styles.noDataText}>
            Por favor, selecciona un turno arriba (Media Mañana o Media Tarde) para cargar los datos de dosificación.
          </Text>
        </View>
      ) : loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#006080" />
          <Text style={styles.loadingText}>Cargando resumen de asistencia...</Text>
        </View>
      ) : datosLocales.length > 0 ? (
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={[styles.scrollContent, esPantallaGrande && styles.pickerContainerGrande]}
          showsVerticalScrollIndicator={false}
        >
          {datosLocales.map((local) => (
            <View key={local.idLocal} style={styles.localCard}>
              
              {/* Nombre del Local */}
              <View style={styles.localHeader}>
                <Ionicons name="business" size={20} color="#FFFFFF" />
                <Text style={styles.localName}>{local.nombreLocal}</Text>
              </View>

              {/* Módulos de este Local */}
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

            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.centerContainer}>
          <Ionicons name="information-circle-outline" size={48} color="#64748B" />
          <Text style={styles.noDataText}>No se encontraron datos de asistencia para los filtros seleccionados.</Text>
        </View>
      )}

      {/* Barra de Navegación Inferior */} 
      <View style={styles.bottomNav}> 
        <TouchableOpacity style={styles.navItem} activeOpacity={0.6} onPress={() => router.replace('/')}> 
          <Home color="#757575" size={24} strokeWidth={2} /> 
          <Text style={styles.navLabel}>Inicio</Text> 
        </TouchableOpacity> 

        <TouchableOpacity style={styles.navItem} activeOpacity={0.6}> 
          <Calculator color="#006080" size={24} strokeWidth={2.5} /> 
          <Text style={[styles.navLabel, { color: '#006080', fontWeight: 'bold' }]}>Calculadora</Text> 
        </TouchableOpacity> 
      </View>

      {/* Modal de Correlativo */}
      <Modal visible={modalCorrelativoVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccione Turno</Text>
            <FlatList 
              data={OPCIONES_CORRELATIVO} 
              keyExtractor={(i) => String(i.value)} 
              renderItem={({item}) => (
                <TouchableOpacity 
                  style={styles.modalOption} 
                  onPress={() => { setSelectedCorrelativo(item); setModalCorrelativoVisible(false); }}
                >
                  <Text style={styles.modalOptionText}>{item.label}</Text>
                </TouchableOpacity>
              )} 
            />
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalCorrelativoVisible(false)}>
              <Text style={styles.closeModalButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View> 
  ); 
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' }, 
  header: { 
    backgroundColor: '#C5D800', 
    paddingTop: 45, 
    paddingHorizontal: 20, 
    paddingBottom: 35, 
    borderBottomRightRadius: 50 
  }, 
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }, 
  adminInfo: { flexDirection: 'row', alignItems: 'center' }, 
  adminAvatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 10 }, 
  roleLabel: { fontSize: 10, color: '#006080', fontWeight: 'bold' }, 
  adminWelcome: { fontSize: 18, color: '#006080', fontWeight: '900' }, 
  logoutButton: { 
    backgroundColor: '#FF007A', 
    width: 38, height: 38, borderRadius: 19, 
    justifyContent: 'center', alignItems: 'center', elevation: 2 
  }, 
  headerTitle: { fontSize: 20, color: '#006080', fontWeight: '900', marginTop: 5 }, 
  content: { flex: 1 }, 
  pickerContainerOuter: { backgroundColor: '#FFFFFF', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  pickerContainer: { paddingHorizontal: 20, paddingTop: 15 },
  pickerContainerGrande: { maxWidth: 800, alignSelf: 'center', width: '100%' },
  pickerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  customPickerButton: { 
    flex: 0.48, 
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
  pickerButtonText: { fontSize: 13, color: '#757575', fontWeight: '600', flex: 1 },
  pickerSelectedText: { color: '#333333', fontWeight: '800', fontSize: 13, flex: 1 },
  pickerPlaceholderText: { color: '#FF007A', fontWeight: 'bold', fontSize: 13, flex: 1 }, 
  
  scrollContent: { padding: 20, paddingBottom: 100 },
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
    padding: 16,
    gap: 10,
  },
  localName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
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

  bottomNav: { 
    flexDirection: 'row', height: 72, backgroundColor: '#FFFFFF', 
    borderTopWidth: 1, borderTopColor: '#E2E8F0', 
    position: 'absolute', bottom: 0, width: '100%',
    paddingBottom: 4, elevation: 8, shadowColor: '#000', 
    shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 3,
  }, 
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' }, 
  navLabel: { fontSize: 11, marginTop: 4, color: '#757575' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', width: '90%', borderRadius: 24, padding: 20, maxHeight: '50%' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#006080', marginBottom: 15, textAlign: 'center' },
  modalOption: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalOptionText: { fontSize: 16, color: '#333333', fontWeight: '600', textAlign: 'center' },
  closeModalButton: { marginTop: 15, backgroundColor: '#FF007A', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  closeModalButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }
});