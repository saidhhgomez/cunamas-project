import React, { useState, useEffect } from 'react'; 
import { 
  StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView,
  useWindowDimensions, Modal, FlatList, TextInput, Keyboard, Platform,
  KeyboardAvoidingView, ActivityIndicator, Alert
} from 'react-native'; 
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import { CalculadoraService } from '../../service/calculadoraService'; 
import { CentroAlimentarioService } from '../../service/servicioAlimentario'; 
import { useAuth } from '../../context/AuthContext';

const OPCIONES_CORRELATIVO = [
  { label: 'Media Mañana ', value: '1' },
  { label: 'Media Tarde', value: '2' },
];

export default function DosificacionResultados() { 
  const router = useRouter();
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const { user } = useAuth(); 
  const { nombrePreparacion, idTipoPreparacion } = useLocalSearchParams();

  // Estados de Fecha
  const [fecha, setFecha] = useState(new Date());
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);

  const [listaCentros, setListaCentros] = useState<any[]>([]);
  const [cargandoCentros, setCargandoCentros] = useState<boolean>(false);
  const [selectedSA, setSelectedSA] = useState<any>(null); 
  const [selectedCorrelativo, setSelectedCorrelativo] = useState<any>(null); 
  const [modalSAVisible, setModalSAVisible] = useState(false);
  const [modalCorrelativoVisible, setModalCorrelativoVisible] = useState(false);
  const [tecladoVisible, setTecladoVisible] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resultados, setResultados] = useState([
    { id: '1', label: "Niños de 6 a 9 Meses", value: "0", color: "#4CAF50" }, 
    { id: '2', label: "Niños de 10 a 12 Meses", value: "0", color: "#FF4081" }, 
    { id: '3', label: "Niños de 13 a 23 Meses", value: "0", color: "#FFB300" }, 
    { id: '4', label: "Niños de 24 a 36 Meses", value: "0", color: "#FFB300" }, 
    { id: '5', label: "Actores Comunales", value: "0", color: "#FFB300" }, 
  ]);
  const [datosInsumos, setDatosInsumos] = useState<any>(null);

  const formatearFechaParaAPI = (date: Date) => date.toISOString().split('T')[0];

// 🔌 CARGA DINÁMICA DE S.A.
  useEffect(() => {
    const cargarCentrosSA = async () => {
      try {
        setCargandoCentros(true);
        const data = await CentroAlimentarioService.getCentrosTodos();
        
        // 🛠️ CORRECCIÓN: Como 'data' ya es el arreglo, lo usamos directamente
        if (Array.isArray(data)) {
          const formateados = data.map((centro: any) => ({
            label: centro.nombreCentro || 'Centro sin nombre',
            value: centro.idCentroAlimentario
          }));
          setListaCentros(formateados);
        } else {
          console.warn("La estructura de datos no es un arreglo:", data);
        }
      } catch (err) {
        console.error("Error al cargar centros desde la API:", err);
      } finally {
        setCargandoCentros(false);
      }
    };

    cargarCentrosSA();
  }, []);

  const manejarCambioSA = (item: any) => {
    setSelectedSA(item);
    setSelectedCorrelativo(null);
    setResultados(prev => prev.map(r => ({ ...r, value: "0" })));
    setDatosInsumos(null);
    setModalSAVisible(false);
  };

  // useEffect sincronizado con Fecha, SA y Correlativo
  useEffect(() => {
    const cargarTotalesDesdeAPI = async () => {
      if (!selectedSA || !selectedCorrelativo) return;
      try {
        setLoading(true);
        setError(null);
        setDatosInsumos(null);
        
        const data = await CalculadoraService.getResumenServicio(formatearFechaParaAPI(fecha), Number(selectedCorrelativo.value));
        if (data && data.totales) {
          setResultados(resultados.map(res => {
            const apiTotal = data.totales.find((t: any) => t.idCategoriaGrupo === Number(res.id));
            return { ...res, value: apiTotal ? String(apiTotal.cantidad) : "0" };
          }));
        }
      } catch (err) {
        setError("Error de conexión al recuperar los totales.");
      } finally { setLoading(false); }
    };
    cargarTotalesDesdeAPI();
  }, [selectedSA, selectedCorrelativo, fecha]);

  useEffect(() => {
    const tecladoMuestra = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setTecladoVisible(true));
    const tecladoOculta = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setTecladoVisible(false));
    return () => { tecladoMuestra.remove(); tecladoOculta.remove(); };
  }, []);

const manejarCambioValor = (id: string, nuevoTexto: string) => {
  // 1. Quitamos cualquier cosa que no sea un número (bloquea negativos y decimales)
  const valorLimpio = nuevoTexto.replace(/[^0-9]/g, '');

  setResultados(prev => prev.map(item => {
    if (item.id === id) {
      // 2. Evitamos que quede vacío, si borran todo volvemos a "0"
      if (valorLimpio === "") return { ...item, value: "0" };
      
      // 3. Eliminamos ceros a la izquierda (ej: "05" -> "5")
      const valorNormalizado = valorLimpio.replace(/^0+(?=\d)/, '');
      
      return { ...item, value: valorNormalizado };
    }
    return item;
  }));
};

  const manejarContinuar = async () => {
    const payload = { categorias: resultados.map(item => ({ idCategoriaGrupo: Number(item.id), cantidad: parseInt(item.value) || 0 })) };
    try {
      setLoading(true);
      const data = await CalculadoraService.calcularDosificacionInsumos(payload, idTipoPreparacion);
      if (data) setDatosInsumos(data);
    } catch (err) { Alert.alert("Error", "Ocurrió un problema al procesar los insumos."); } 
    finally { setLoading(false); }
  };

  return ( 
    <SafeAreaView style={styles.container}> 
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flexible}>
        <View style={[styles.header, { height: esPantallaGrande ? 120 : 100 }]}> 
          <View style={styles.headerContent}> 
            <View style={styles.userInfo}> 
              <View style={styles.avatar}><Ionicons name="person" size={24} color="#C5D800" /></View> 
              <View><Text style={styles.welcomeText}>Bienvenid@</Text><Text style={styles.userName}>{user?.nombre || 'Usuario'}</Text></View> 
            </View> 
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}> 
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" /><Text style={styles.backButtonText}>VOLVER</Text> 
            </TouchableOpacity> 
          </View> 
        </View> 

        <View style={styles.scrollWrapper}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"> 
            
            {/* Selección de Fecha */}
            <Text style={styles.sectionTitle}>Fecha de consulta:</Text>
            <TouchableOpacity style={[styles.customPickerButton, { marginBottom: 20 }]} onPress={() => setMostrarDatePicker(true)}>
              <Text style={styles.pickerSelectedText}>{fecha.toLocaleDateString()}</Text>
              <Ionicons name="calendar-outline" size={18} color="#006080" />
            </TouchableOpacity>
            {mostrarDatePicker && (
              <DateTimePicker value={fecha} mode="date" display="default" onChange={(e, d) => { setMostrarDatePicker(false); if(d) setFecha(d); }} />
            )}

            <View style={styles.pickerRow}> 
              <TouchableOpacity style={styles.customPickerButton} onPress={() => setModalSAVisible(true)}>
                <Text style={[styles.pickerButtonText, selectedSA && styles.pickerSelectedText]} numberOfLines={1}>{selectedSA ? selectedSA.label : "Seleccione S.A."}</Text>
                <Ionicons name="chevron-down" size={18} color="#006080" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.customPickerButton, !selectedSA && styles.pickerButtonDisabled]} disabled={!selectedSA} onPress={() => setModalCorrelativoVisible(true)}>
                <Text style={[styles.pickerButtonText, selectedCorrelativo && styles.pickerSelectedText]}>{selectedCorrelativo ? selectedCorrelativo.label : "Correlativo"}</Text>
                <Ionicons name="chevron-down" size={18} color={selectedSA ? "#006080" : "#B0B0B0"} />
              </TouchableOpacity>
            </View> 

            <Text style={styles.sectionTitle}>TOTAL:</Text> 
            {!selectedSA || !selectedCorrelativo ? (
              <View style={styles.indicacionContainer}><Ionicons name="information-circle-outline" size={32} color="#006080" /><Text style={styles.indicacionText}>Seleccione S.A. y Correlativo para sincronizar.</Text></View>
            ) : loading ? (
              <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#006080" /></View>
            ) : (
              <View style={styles.resultsList}>{resultados.map((item) => <ResultItem key={item.id} {...item} onChangeText={(t) => manejarCambioValor(item.id, t)} />)}</View>
            )}

            <View style={styles.guarnicionCard}><MaterialCommunityIcons name="silverware-fork-knife" size={24} color="#006080" /><Text style={styles.guarnicionText}>{nombrePreparacion ? String(nombrePreparacion).toUpperCase() : "ARROZ"}</Text></View> 
            <TouchableOpacity style={[styles.continueButton, (!selectedSA || !selectedCorrelativo) && styles.continueButtonDisabled]} onPress={manejarContinuar} disabled={!selectedSA || !selectedCorrelativo || loading}><Text style={styles.continueButtonText}>CONTINUAR</Text></TouchableOpacity> 

            {datosInsumos && (
              <View>
                <Text style={styles.necesitasTitle}>NECESITAS:</Text> 
                <View style={styles.necesitasRow}> 
                  <View style={styles.necesitasCard}><Text style={styles.necesitasValue}>{datosInsumos.empaquesSugeridos["Opción en empaques de 1 Kg/L"] || 0}</Text><Text style={styles.necesitasLabel}>BOLSAS 1 KG</Text></View> 
                  <View style={styles.necesitasCard}><Text style={styles.necesitasValue}>{datosInsumos.empaquesSugeridos["Opción en empaques de 500 g/ml"] || 0}</Text><Text style={styles.necesitasLabel}>BOLSAS 1/2 KG</Text></View> 
                  <View style={styles.necesitasCard}><Text style={styles.necesitasValue}>{datosInsumos.empaquesSugeridos["Opción en empaques de 250 g/ml"] || 0}</Text><Text style={styles.necesitasLabel}>BOLSAS 250 G</Text></View> 
                </View> 
              </View>
            )}
          </ScrollView> 
        </View>

        {!tecladoVisible && (
          <View style={styles.bottomBarContainer}>
            <TouchableOpacity style={styles.homeButtonCircle} onPress={() => router.replace('/inicio')}><Ionicons name="home" size={24} color="#00AEEF" /><Text style={styles.homeButtonText}>Inicio</Text></TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Modales (S.A. y Correlativo) mantienen tu estilo intacto */}
      <Modal visible={modalSAVisible} transparent animationType="fade"><View style={styles.modalOverlay}><View style={styles.modalContent}><Text style={styles.modalTitle}>Seleccione Centro</Text><FlatList data={listaCentros} keyExtractor={(i) => String(i.value)} renderItem={({item}) => <TouchableOpacity style={styles.modalOption} onPress={() => manejarCambioSA(item)}><Text style={styles.modalOptionText}>{item.label}</Text></TouchableOpacity>} /><TouchableOpacity style={styles.closeModalButton} onPress={() => setModalSAVisible(false)}><Text style={styles.closeModalButtonText}>Cancelar</Text></TouchableOpacity></View></View></Modal>
      <Modal visible={modalCorrelativoVisible} transparent animationType="fade"><View style={styles.modalOverlay}><View style={styles.modalContent}><Text style={styles.modalTitle}>Seleccione Correlativo</Text><FlatList data={OPCIONES_CORRELATIVO} keyExtractor={(i) => i.value} renderItem={({item}) => <TouchableOpacity style={styles.modalOption} onPress={() => { setSelectedCorrelativo(item); setModalCorrelativoVisible(false); }}><Text style={styles.modalOptionText}>{item.label}</Text></TouchableOpacity>} /><TouchableOpacity style={styles.closeModalButton} onPress={() => setModalCorrelativoVisible(false)}><Text style={styles.closeModalButtonText}>Cancelar</Text></TouchableOpacity></View></View></Modal>
    </SafeAreaView> 
  ); 
}

const ResultItem = ({ label, value, color, onChangeText }: any) => ( 
  <View style={styles.resultItem}> 
    <Text style={styles.resultLabel}>{label}</Text> 
    <View style={styles.valueContainer}> 
      <TextInput
        style={[styles.resultInput, { color: color }]}
        value={value === "0" ? "" : value} 
        placeholder="0"
        placeholderTextColor="#CCCCCC"
        onChangeText={onChangeText}
        keyboardType="number-pad" 
        returnKeyType="done"
        maxLength={4}
      />
    </View> 
  </View> 
);
const styles = StyleSheet.create({
  // ... (Tus estilos originales, asegúrate de tener el objeto styles completo que ya tenías)
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  flexible: { flex: 1 },
  header: { backgroundColor: '#C5D800', borderBottomLeftRadius: 40, borderBottomRightRadius: 40, justifyContent: 'center' },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  welcomeText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  userName: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  backButton: { backgroundColor: '#FF0080', flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
  backButtonText: { color: '#FFFFFF', fontWeight: 'bold', marginLeft: 5, fontSize: 12 },
  scrollWrapper: { flex: 1 },
  scrollContent: { padding: 20 },
  pickerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  customPickerButton: { flex: 0.48, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#C5BBE3', borderRadius: 12, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  pickerButtonDisabled: { backgroundColor: '#F0F0F0', borderColor: '#E2E8F0', opacity: 0.6 },
  pickerButtonText: { fontSize: 13, color: '#888888', fontWeight: '600', flex: 1 },
  pickerSelectedText: { color: '#333333', fontWeight: '800' },
  sectionTitle: { color: '#006080', fontWeight: 'bold', fontSize: 16, marginBottom: 15 },
  resultsList: { marginBottom: 20 },
  resultItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#EEEEEE', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10, marginBottom: 10 },
  resultLabel: { fontSize: 14, color: '#333333', fontWeight: '500', flex: 1 },
  valueContainer: { backgroundColor: '#FFFFFF', borderRadius: 5, borderWidth: 1, borderColor: '#CCCCCC', width: 65, height: 38, justifyContent: 'center', alignItems: 'center' },
  resultInput: { width: '100%', height: '100%', textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
  indicacionContainer: { backgroundColor: '#E6F4EA', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#A7F3D0' },
  indicacionText: { color: '#047857', textAlign: 'center', marginTop: 8, fontSize: 13, fontWeight: '500' },
  guarnicionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0E0E0', padding: 15, borderRadius: 10, marginBottom: 25 },
  guarnicionText: { marginLeft: 15, color: '#333333', fontWeight: 'bold', fontSize: 14 },
  continueButton: { backgroundColor: '#006080', paddingVertical: 18, borderRadius: 30, alignItems: 'center', marginBottom: 25 },
  continueButtonDisabled: { backgroundColor: '#94A3B8' },
  continueButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  necesitasTitle: { fontSize: 16, fontWeight: 'bold', color: '#006080', marginBottom: 10 },
  necesitasRow: { flexDirection: 'row', justifyContent: 'space-between' },
  necesitasCard: { flex: 0.31, backgroundColor: '#EEEEEE', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  necesitasValue: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50', marginBottom: 5 },
  necesitasLabel: { fontSize: 9, fontWeight: 'bold', color: '#4CAF50', textAlign: 'center' },
  bottomBarContainer: { width: '100%', backgroundColor: '#F9F9F9', alignItems: 'center', paddingVertical: 15, paddingBottom: 50, borderTopWidth: 1, borderColor: '#E2E8F0' },
  homeButtonCircle: { backgroundColor: '#FFFFFF', borderRadius: 25, borderWidth: 1, borderColor: '#E2E8F0', width: 130, height: 60, justifyContent: 'center', alignItems: 'center' },
  homeButtonText: { color: '#00AEEF', fontWeight: '800', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', width: '90%', borderRadius: 20, padding: 20, maxHeight: '60%' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#006080', marginBottom: 15, textAlign: 'center' },
  modalOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalOptionText: { fontSize: 16, color: '#333333', fontWeight: '600' },
  closeModalButton: { marginTop: 15, backgroundColor: '#FF0080', paddingVertical: 12, borderRadius: 15, alignItems: 'center' },
  closeModalButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  loaderContainer: { marginVertical: 30, alignItems: 'center' }
});