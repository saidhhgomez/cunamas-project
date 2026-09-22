import React, { useState, useEffect } from 'react'; 
import { 
  StyleSheet, View, Text, FlatList, TouchableOpacity,
  useWindowDimensions, Modal, TextInput, Keyboard, Platform,
  KeyboardAvoidingView, ActivityIndicator, StatusBar,
  LayoutAnimation, UIManager, SafeAreaView
} from 'react-native'; 
import { Ionicons } from '@expo/vector-icons'; 
import { useRouter, useLocalSearchParams, usePathname } from 'expo-router'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AsistenciaService } from '../../service/asistenciaService'; 
import { useAuth } from '../../context/AuthContext';
import AdminHeader from '../components/admin/HeaderAdmin';
import BottomNavAdmin from '../components/admin/BottomNavAdmin';

// Habilita LayoutAnimation en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const OPCIONES_CORRELATIVO = [
  { label: 'Media Mañana', value: '1' },
];

const MAPA_COLORES: Record<number, string> = {
  1: "#B7C900",
  2: "#F57C00",
  3: "#009B16",
  4: "#2F75B5",
  5: "#9C27B0"
};

export default function Resumen() { 
  const router = useRouter();
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const insets = useSafeAreaInsets();
  const { user } = useAuth(); 
  const pathname = usePathname();
  const params = useLocalSearchParams();
  const idModulo = params.idCentroAlimentario || params.idModulo;

  // Estados de Filtros
  const [fecha, setFecha] = useState(new Date());
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [selectedCorrelativo, setSelectedCorrelativo] = useState<any>(OPCIONES_CORRELATIVO[0]); 
  const [modalCorrelativoVisible, setModalCorrelativoVisible] = useState(false);
  
  // Estados de Carga y Datos Divididos
  const [tecladoVisible, setTecladoVisible] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const RUTA_ACTUAL = '/administrador/resumen';

  const [registroManana, setRegistroManana] = useState<any[]>([]);
  const [registroTarde, setRegistroTarde] = useState<any[]>([]);

  // Estados para expandir/contraer cada sección
  const [manianaExpandida, setManianaExpandida] = useState(true);
  const [tardeExpandida, setTardeExpandida] = useState(true);

  const formatearFechaParaAPI = (date: Date) => {
    const año = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0'); 
    const dia = String(date.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };

  useEffect(() => {
    const cargarTotalesDesdeAPI = async () => {
      if (!idModulo) return;
      
      try {
        setLoading(true);
        const fechaYmd = formatearFechaParaAPI(fecha);
        const correlativoSeleccionado = selectedCorrelativo?.value || '0';

        setRegistroManana([]);
        setRegistroTarde([]);

        const data = await AsistenciaService.obtenerAsistenciaConCorrelativo(Number(idModulo), fechaYmd, 1);
        if (data) {
          setRegistroManana(data.registroManana || []);
          setRegistroTarde([]);
        }

      } catch (err) {
        console.error("Error al recuperar los totales desde el servicio:", err);
      } finally { 
        setLoading(false); 
      }
    };
    
    cargarTotalesDesdeAPI();
  }, [selectedCorrelativo, fecha, idModulo]);

  useEffect(() => {
    const tecladoMuestra = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setTecladoVisible(true));
    const tecladoOculta = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setTecladoVisible(false));
    return () => { tecladoMuestra.remove(); tecladoOculta.remove(); };
  }, []);

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

  const renderItemCategoria = (item: any, turno: 'manana' | 'tarde') => {
    const color = MAPA_COLORES[item.idCategoriaGrupo] || "#757575";

    const mapaNombres: Record<number, string> = {
      1: 'Niños 6-8 m',
      2: 'Niños 9-11 m',
      3: 'Niños 12-23 m',
      4: 'Niños 24-36 m',
      5: 'Actor Comunal'
    };

    let nombreAMostrar = item.categoria || mapaNombres[item.idCategoriaGrupo] || `Categoría ${item.idCategoriaGrupo}`;

    if (item.idCategoriaGrupo >= 1 && item.idCategoriaGrupo <= 4) {
      const textoBase = String(nombreAMostrar).trim();
      nombreAMostrar = textoBase.toLowerCase().includes('niño') || textoBase.toLowerCase().includes('niños')
        ? textoBase
        : `Niños ${textoBase}`;
    }

    if (item.idCategoriaGrupo === 5) {
      nombreAMostrar = 'Actor Comunal';
    }

    return (
      <View style={styles.resultItem} key={`${turno}-${item.idCategoriaGrupo}`}> 
        <Text style={styles.resultLabel}>{nombreAMostrar}</Text> 
        <View style={[styles.valueContainer, { backgroundColor: color }]}> 
          <TextInput
            style={[styles.resultInput, { color: '#FFFFFF' }]}
            value={item.cantidad === 0 ? "0" : String(item.cantidad)} 
            editable={false}
            allowFontScaling={false}
          />
        </View> 
      </View>
    );
  };

  const tieneDatos = registroManana.length > 0 || registroTarde.length > 0;

  return ( 
    <SafeAreaView style={[styles.container, Platform.OS === 'android' && { paddingTop: insets.top }]}> 
      <StatusBar barStyle="light-content" backgroundColor="#C5D800" /> 
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.flexible}
      >
        <AdminHeader
          user={user}
          titulo=""
          modo="volver"
          onPress={() => router.canGoBack() ? router.back() : null}
        />    

        <View style={styles.titleBar}>
          <Text style={styles.headerTitle} allowFontScaling={false}>Asistencia del {params?.nombreModulo}</Text> 
        </View>

        {/* Contenido principal */}
        <View style={styles.content}>
          <FlatList
            data={loading || !tieneDatos ? [] : [1]} 
            keyExtractor={(_, index) => String(index)}
            contentContainerStyle={[
              styles.listContent, 
              { paddingBottom: 120 + insets.bottom }, // Compensación dinámica para el BottomNavAdmin
              esPantallaGrande && styles.listContentGrande
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            
            ListHeaderComponent={
              <View style={styles.pickerRow}>
                <TouchableOpacity style={styles.customPickerButton} onPress={() => setMostrarDatePicker(true)}>
                  <Text style={[styles.pickerSelectedText, { fontSize: 18 }]} allowFontScaling={false} numberOfLines={1}>
                    {fecha.toLocaleDateString()}
                  </Text>
                  <Ionicons name="calendar-outline" size={18} color="#006080" />
                </TouchableOpacity>
                {mostrarDatePicker && (
                  <DateTimePicker value={fecha} mode="date" display="default" onChange={(e, d) => { setMostrarDatePicker(false); if(d) setFecha(d); }} />
                )}

                <TouchableOpacity style={styles.customPickerButton} onPress={() => setModalCorrelativoVisible(true)}>
                  <Text style={[styles.pickerButtonText, styles.pickerSelectedText]} allowFontScaling={false} numberOfLines={1}>
                    {selectedCorrelativo ? selectedCorrelativo.label : "Vista General"}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#006080" />
                </TouchableOpacity>
              </View>
            }

            renderItem={() => (
              <View>
                {registroManana.length > 0 && (
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
                    {manianaExpandida && registroManana.map(item => renderItemCategoria(item, 'manana'))}
                  </View>
                )}
              </View>
            )}

            ListEmptyComponent={
              loading ? (
                <View style={styles.centerContainer}><ActivityIndicator size="large" color="#006080" /></View>
              ) : (
                <View style={styles.indicacionContainer}>
                  <Ionicons name="information-circle-outline" size={44} color="#64748B" />
                  <Text style={styles.indicacionText}>No se encontraron asistencias cargadas para los parámetros elegidos.</Text>
                </View>
              )
            }
          />
        </View>

        {/* Componente BottomNavAdmin fijo al final */}
        <BottomNavAdmin rutaActual={RUTA_ACTUAL} insetsBottom={insets.bottom} />

      </KeyboardAvoidingView>

      {/* Modal de Correlativo */}
      <Modal visible={modalCorrelativoVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccione Correlativo</Text>
            <FlatList 
              data={OPCIONES_CORRELATIVO} 
              keyExtractor={(i) => i.value} 
              renderItem={({item}) => (
                <TouchableOpacity style={styles.modalOption} onPress={() => { setSelectedCorrelativo(item); setModalCorrelativoVisible(false); }}>
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

    </SafeAreaView> 
  ); 
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' }, 
  flexible: { flex: 1 },
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
  titleBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
  },
  headerTitle: { fontSize: 24, color: '#006080', fontWeight: '900' }, 
  content: { flex: 1 }, 
  listContent: { paddingHorizontal: 20, paddingTop: 15 }, 
  listContentGrande: { maxWidth: 800, alignSelf: 'center', width: '100%' },
  pickerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, marginTop: 5 },
  customPickerButton: { flex: 0.48, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E2E8F0', borderRadius: 16, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, elevation: 1 },
  pickerButtonText: { fontSize: 16, color: '#757575', fontWeight: '600', flex: 1 },
  pickerSelectedText: { color: '#333333', fontWeight: '800', fontSize: 16 },
  
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

  resultItem: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 14, 
    padding: 14, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 8, 
    elevation: 1, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.03, 
    shadowRadius: 2 
  }, 
  resultLabel: { fontSize: 14, fontWeight: '700', color: '#334155', flex: 1 }, 
  valueContainer: { backgroundColor: '#F1F5F9', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', width: 70, height: 48, justifyContent: 'center', alignItems: 'center' },
  resultInput: { width: '100%', height: '100%', padding: 0, textAlign: 'center', textAlignVertical: 'center', includeFontPadding: false, fontSize: 20, fontWeight: '900' }, 
  
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  indicacionContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  indicacionText: { color: '#64748B', marginTop: 12, fontSize: 14, textAlign: 'center', lineHeight: 20, fontWeight: '500' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', width: '90%', borderRadius: 24, padding: 20, maxHeight: '50%' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#006080', marginBottom: 15, textAlign: 'center' },
  modalOption: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalOptionText: { fontSize: 16, color: '#333333', fontWeight: '600', textAlign: 'center' },
  closeModalButton: { marginTop: 15, backgroundColor: '#FF007A', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  closeModalButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }
});