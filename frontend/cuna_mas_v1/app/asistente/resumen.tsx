import React, { useState, useEffect } from 'react'; 
import { 
  StyleSheet, View, Text, FlatList, TouchableOpacity,
  useWindowDimensions, Modal, TextInput, Keyboard, Platform,
  KeyboardAvoidingView, ActivityIndicator, StatusBar,
  LayoutAnimation, UIManager
} from 'react-native'; 
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AsistenciaService } from '../../service/asistenciaService'; 
import { useAuth } from '../../context/AuthContext';
import HeaderCocina from '../components/sociaCocina/HeaderCocina';
import BottomNavCocina from '../components/sociaCocina/BottomNavCocina';

// Habilita LayoutAnimation en Android (en iOS ya viene activado por defecto)
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
  const RUTA_ACTUAL = '/asistente/resumen';

  const [registroManana, setRegistroManana] = useState<any[]>([]);
  const [registroTarde, setRegistroTarde] = useState<any[]>([]);

  // 🔽 Estados para expandir/contraer cada sección (abiertas por defecto)
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

  // 🔽 Alterna la visibilidad de una sección con animación suave
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

  // Renderizador de cada tarjeta de categoría
  const renderItemCategoria = (item: any, turno: 'manana') => {
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
          <Text style={styles.resultInput} maxFontSizeMultiplier={1.15}>
            {item.cantidad === 0 ? '0' : String(item.cantidad)}
          </Text>
        </View> 
      </View>
    );
  };

  const tieneDatos = registroManana.length > 0 || registroTarde.length > 0;

  return ( 
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}> 
      <StatusBar barStyle="light-content" backgroundColor="#C5D800" /> 
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flexible}>
        
      <HeaderCocina
        user={user}
        titulo=""
        modo="volver"
        onPress={() => router.back()}
      />      

<View style={styles.titleBar}>
  <Text style={styles.headerTitle} allowFontScaling={false}>Asistencia del {params?.nombreModulo}</Text>
</View>

        {/* Contenido principal */}
        <View style={styles.content}>
          <FlatList
            data={loading || !tieneDatos ? [] : [1]} 
            keyExtractor={(_, index) => String(index)}
            contentContainerStyle={[styles.listContent, esPantallaGrande && styles.listContentGrande]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            
            ListHeaderComponent={
              <View style={styles.pickerRow}>
                {/* Selector de Fecha */}
                <TouchableOpacity style={styles.customPickerButton} onPress={() => setMostrarDatePicker(true)}>
                  <Text
                    style={styles.pickerSelectedText}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                    maxFontSizeMultiplier={1.15}
                  >
                    {fecha.toLocaleDateString()}
                  </Text>
                  <Ionicons name="calendar-outline" size={18} color="#006080" />
                </TouchableOpacity>
                {mostrarDatePicker && (
                  <DateTimePicker value={fecha} mode="date" display="default" onChange={(e, d) => { setMostrarDatePicker(false); if(d) setFecha(d); }} />
                )}

                {/* Selector de Correlativo */}
                <TouchableOpacity style={styles.customPickerButton} onPress={() => setModalCorrelativoVisible(true)}>
                  <Text
                    style={[styles.pickerButtonText, styles.pickerSelectedText]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                    maxFontSizeMultiplier={1.15}
                  >
                    {selectedCorrelativo ? selectedCorrelativo.label : "Vista General"}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#006080" />
                </TouchableOpacity>
              </View>
            }

            renderItem={() => (
              <View>
                {/* Sección Media Mañana (desplegable) */}
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

      <BottomNavCocina rutaActual={RUTA_ACTUAL} insetsBottom={insets.bottom} />

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

    </View> 
  ); 
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' }, 
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
  paddingBottom: 25,
},
  headerTitle: { fontSize: 26, color: '#006080', fontWeight: '900', lineHeight: 34 }, 
  content: { flex: 1 }, 
  listContent: { paddingHorizontal: 18, paddingBottom: 170, paddingTop: 10 }, 
  listContentGrande: { maxWidth: 800, alignSelf: 'center', width: '100%' },
  pickerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, marginTop: 5, gap: 12 },
  customPickerButton: { flex: 1, minWidth: 0, backgroundColor: '#EEF1F4', borderWidth: 1, borderColor: '#DDE5ED', borderRadius: 16, height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, elevation: 0 },
  pickerButtonText: { fontSize: 14, color: '#757575', fontWeight: '600', flex: 1 },
  pickerSelectedText: { color: '#333333', fontWeight: '800', fontSize: 16, flexShrink: 1, marginRight: 6 },
  
  seccionTurno: { backgroundColor: '#F4F7F9', borderRadius: 18, padding: 12, borderWidth: 1, borderColor: '#E7ECEF' },
  seccionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 6, 
    marginLeft: 4,
    paddingVertical: 8,
  },
  seccionHeaderIzquierda: { flexDirection: 'row', alignItems: 'center' },
  seccionTitle: { fontSize: 20, fontWeight: '900', color: '#006080' },

  resultItem: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 16, 
    paddingVertical: 13,
    paddingHorizontal: 14,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 9, 
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.04, 
    shadowRadius: 3,
  }, 
  resultLabel: { fontSize: 16, fontWeight: '800', color: '#006080', flex: 1, flexShrink: 1, marginRight: 16, lineHeight: 22 }, 
  valueContainer: { backgroundColor: '#F1F5F9', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', width: 84, minWidth: 84, height: 46, justifyContent: 'center', alignItems: 'center' },
  resultInput: { textAlign: 'center', fontSize: 22, fontWeight: '900', includeFontPadding: false, color: '#FFFFFF' }, 
  
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  indicacionContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  indicacionText: { color: '#64748B', marginTop: 12, fontSize: 14, textAlign: 'center', lineHeight: 20, fontWeight: '500' },
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
