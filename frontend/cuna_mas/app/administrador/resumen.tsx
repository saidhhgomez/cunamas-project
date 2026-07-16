import React, { useState, useEffect } from 'react'; 
import { 
  StyleSheet, View, Text, FlatList, TouchableOpacity,
  useWindowDimensions, Modal, TextInput, Keyboard, Platform,
  KeyboardAvoidingView, ActivityIndicator, StatusBar
} from 'react-native'; 
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AsistenciaService } from '../../service/asistenciaService'; 
import { useAuth } from '../../context/AuthContext';
import { Calculator, Home } from 'lucide-react-native';

const OPCIONES_CORRELATIVO = [
  { label: 'Vista General (Ambos Turnos)', value: '0' }, 
  { label: 'Media Mañana', value: '1' },
  { label: 'Media Tarde', value: '2' },
];

const MAPA_COLORES: Record<number, string> = {
  1: "#4CAF50", // Color asignado a Niños
  2: "#FF4081", // Color asignado a Actor Comunal
  3: "#FFB300",
  4: "#00BCD4",
  5: "#9C27B0"
};

export default function Resumen() { 
  const router = useRouter();
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth(); 
  
  const params = useLocalSearchParams();
  const idModulo = params.idCentroAlimentario || params.idModulo;

  // Estados de Filtros
  const [fecha, setFecha] = useState(new Date());
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [selectedCorrelativo, setSelectedCorrelativo] = useState<any>(null); 
  const [modalCorrelativoVisible, setModalCorrelativoVisible] = useState(false);
  
  // Estados de Carga y Datos Divididos
  const [tecladoVisible, setTecladoVisible] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [registroManana, setRegistroManana] = useState<any[]>([]);
  const [registroTarde, setRegistroTarde] = useState<any[]>([]);

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

        if (correlativoSeleccionado === '0') {
          const data = await AsistenciaService.obtenerAsistenciaPorModuloYFecha(Number(idModulo), fechaYmd);
          if (data) {
            setRegistroManana(data.registroManana || []);
            setRegistroTarde(data.registroTarde || []);
          }
        } else if (correlativoSeleccionado === '1') {
          const data = await AsistenciaService.obtenerAsistenciaConCorrelativo(Number(idModulo), fechaYmd, 1);
          if (data) setRegistroManana(data.registroManana || []);
        } else if (correlativoSeleccionado === '2') {
          const data = await AsistenciaService.obtenerAsistenciaConCorrelativo(Number(idModulo), fechaYmd, 2);
          if (data) setRegistroTarde(data.registroTarde || []);
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

  // Renderizador de cada tarjeta de categoría
  const renderItemCategoria = (item: any, turno: 'manana' | 'tarde') => {
    const color = MAPA_COLORES[item.idCategoriaGrupo] || "#757575";
    
    // 🏷️ Lógica de nombres sugerida:
    // Si el ID es 1 (o el texto contiene "niño"), forzamos "Niños". 
    // Si es el ID 2 (Actor Comunal), respetamos el nombre tal cual viene del servicio.
    let nombreAMostrar = item.categoria || `Categoría ${item.idCategoriaGrupo}`;
    if (item.idCategoriaGrupo === 1 || String(item.categoria).toLowerCase().includes('niño')) {
      nombreAMostrar = "Niños";
    }

    return (
      <View style={styles.resultItem} key={`${turno}-${item.idCategoriaGrupo}`}> 
        <Text style={styles.resultLabel}>{nombreAMostrar}</Text> 
        <View style={styles.valueContainer}> 
          <TextInput
            style={[styles.resultInput, { color: color }]}
            value={item.cantidad === 0 ? "0" : String(item.cantidad)} 
            editable={false} // 🔒 Campo de solo lectura, no editable
          />
        </View> 
      </View>
    );
  };

  const tieneDatos = registroManana.length > 0 || registroTarde.length > 0;

  return ( 
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}> 
      <StatusBar barStyle="light-content" backgroundColor="#C5D800" /> 
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flexible}>
        
        {/* Header */}
        <View style={styles.header}> 
          <View style={styles.headerTop}> 
            <View style={styles.adminInfo}> 
              <View style={styles.adminAvatarCircle}>
                <Ionicons name="person" size={22} color="#006080" />
              </View>
              <View> 
                <Text style={styles.roleLabel}>Administrador</Text> 
                <Text style={styles.adminWelcome}>Hola, {user?.nombre || 'ADMINISTRADOR SISTEMA'}</Text> 
              </View> 
            </View> 
            <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}> 
              <MaterialCommunityIcons name="logout" size={20} color="#FFFFFF" /> 
            </TouchableOpacity> 
          </View> 
          <Text style={styles.headerTitle}>Totales de Dosificación</Text> 
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
                  <Text style={styles.pickerSelectedText}>{fecha.toLocaleDateString()}</Text>
                  <Ionicons name="calendar-outline" size={18} color="#006080" />
                </TouchableOpacity>
                {mostrarDatePicker && (
                  <DateTimePicker value={fecha} mode="date" display="default" onChange={(e, d) => { setMostrarDatePicker(false); if(d) setFecha(d); }} />
                )}

                {/* Selector de Correlativo */}
                <TouchableOpacity style={styles.customPickerButton} onPress={() => setModalCorrelativoVisible(true)}>
                  <Text style={[styles.pickerButtonText, styles.pickerSelectedText]}>
                    {selectedCorrelativo ? selectedCorrelativo.label : "Vista General"}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#006080" />
                </TouchableOpacity>
              </View>
            }

            renderItem={() => (
              <View>
                {/* Sección Turno Mañana */}
                {registroManana.length > 0 && (
                  <View style={styles.seccionTurno}>
                    <View style={styles.seccionHeader}>
                      <Ionicons name="sunny-outline" size={20} color="#006080" style={{marginRight: 6}} />
                      <Text style={styles.seccionTitle}>Turno Mañana</Text>
                    </View>
                    {registroManana.map(item => renderItemCategoria(item, 'manana'))}
                  </View>
                )}

                {/* Sección Turno Tarde */}
                {registroTarde.length > 0 && (
                  <View style={[styles.seccionTurno, { marginTop: 15 }]}>
                    <View style={styles.seccionHeader}>
                      <Ionicons name="partly-sunny-outline" size={20} color="#006080" style={{marginRight: 6}} />
                      <Text style={styles.seccionTitle}>Turno Tarde</Text>
                    </View>
                    {registroTarde.map(item => renderItemCategoria(item, 'tarde'))}
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

        {/* Barra de Navegación Inferior */} 
        {!tecladoVisible && (
          <View style={styles.bottomNav}> 
            <TouchableOpacity style={styles.navItem} activeOpacity={0.6} onPress={() => router.replace('/')}> 
              <Home color="#757575" size={24} strokeWidth={2} /> 
              <Text style={styles.navLabel}>Inicio</Text> 
            </TouchableOpacity> 

            {/* Botón 2: Pendientes (Pantalla Actual Activa) */}
        <TouchableOpacity style={styles.navItem} activeOpacity={0.6} onPress={() => router.push('/administrador/consultas')}> 
          <Ionicons name="people" size={22} color="#006080" /> 
          <Text style={[styles.navLabel, { color: '#006080', fontWeight: 'bold' }]}>Pendientes</Text> 
        </TouchableOpacity>

            <TouchableOpacity style={styles.navItem} activeOpacity={0.6} onPress={() => router.push('/administrador/calculadora/categoriaCalculadora')}> 
              <Calculator color="#006080" size={24} strokeWidth={2.5} /> 
              <Text style={[styles.navLabel, { color: '#006080', fontWeight: 'bold' }]}>Calculadora</Text> 
            </TouchableOpacity> 
          </View>
        )}
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
  container: { flex: 1, backgroundColor: '#FFFFFF' }, 
  flexible: { flex: 1 },
  header: { 
    backgroundColor: '#C5D800', 
    paddingTop: 20, 
    paddingHorizontal: 20, 
    paddingBottom: 40, 
    borderBottomRightRadius: 60 
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
  headerTitle: { fontSize: 24, color: '#006080', fontWeight: '900', marginTop: 10 }, 
  content: { flex: 1 }, 
  listContent: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 15 }, 
  listContentGrande: { maxWidth: 800, alignSelf: 'center', width: '100%' },
  pickerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, marginTop: 5 },
  customPickerButton: { flex: 0.48, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E2E8F0', borderRadius: 16, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, elevation: 1 },
  pickerButtonText: { fontSize: 13, color: '#757575', fontWeight: '600', flex: 1 },
  pickerSelectedText: { color: '#333333', fontWeight: '800', fontSize: 14 },
  
  seccionTurno: { backgroundColor: '#F8FAFC', borderRadius: 20, padding: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  seccionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginLeft: 4 },
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
  valueContainer: { backgroundColor: '#F1F5F9', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', width: 70, height: 40, justifyContent: 'center', alignItems: 'center' },
  resultInput: { width: '100%', height: '100%', textAlign: 'center', fontSize: 16, fontWeight: '900' }, 
  
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