import React, { useState, useEffect, useRef } from 'react'; 
import { 
  StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView,
  useWindowDimensions, Modal, FlatList, TextInput, Keyboard, Platform,
  KeyboardAvoidingView, ActivityIndicator, Animated
} from 'react-native'; 
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useRouter, useLocalSearchParams, usePathname } from 'expo-router'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CalculadoraService } from '../../../service/calculadoraService'; 
import { CentroAlimentarioService } from '../../../service/servicioAlimentario'; 
import { useAuth } from '../../../context/AuthContext';
import ModalMensaje from '../../components/ModalMensaje';
import { useModalMensaje } from '../../../hooks/useModalMensaje';

const OPCIONES_CORRELATIVO = [
  { label: 'Media Mañana', value: '1' },
];

export default function DosificacionResultados() { 
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const { user } = useAuth(); 
  const { mostrarError, modalProps } = useModalMensaje();
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
    { id: '1', label: "Niños de 6 a 8 Meses", value: "0", color: "#B7C900" },
    { id: '2', label: "Niños de 9 a 11 Meses", value: "0", color: "#F57C00" },
    { id: '3', label: "Niños de 12 a 23 Meses", value: "0", color: "#009B16" },
    { id: '4', label: "Niños de 24 a 36 Meses", value: "0", color: "#2F75B5" },
    { id: '5', label: "Actores Comunales", value: "0", color: "#9C27B0" },
  ]);
  const [datosInsumos, setDatosInsumos] = useState<any>(null);

  // 🚦 Evita recalcular con los mismos valores: se habilita solo si algo relevante cambió
  const [necesitaRecalcular, setNecesitaRecalcular] = useState(true);

  // 🎬 Animación de aparición del bloque "NECESITAS"
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 🛠️ CORRECCIÓN: Formatea la fecha usando el tiempo local, no UTC
  const formatearFechaParaAPI = (date: Date) => {
    const año = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0'); 
    const dia = String(date.getDate()).padStart(2, '0');
    
    return `${año}-${mes}-${dia}`;
  };

  // 🔌 CARGA DINÁMICA DE S.A.
  useEffect(() => {
    const cargarCentrosSA = async () => {
      try {
        setCargandoCentros(true);
        const data = await CentroAlimentarioService.getCentrosTodos();
        
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
    setNecesitaRecalcular(true); // 🚦 cambió el S.A., hay que volver a calcular
    setModalSAVisible(false);
  };

  const manejarCambioCorrelativo = (item: any) => {
    setSelectedCorrelativo(item);
    setDatosInsumos(null);
    setNecesitaRecalcular(true); // 🚦 cambió el correlativo
    setModalCorrelativoVisible(false);
  };

  const manejarCambioFecha = (event: any, date?: Date) => {
    setMostrarDatePicker(false);
    if (date) {
      setFecha(date);
      setDatosInsumos(null);
      setNecesitaRecalcular(true); // 🚦 cambió la fecha
    }
  };

  // useEffect sincronizado con Fecha, SA y Correlativo (trae los totales base desde el servidor)
  useEffect(() => {
    const cargarTotalesDesdeAPI = async () => {
      if (!selectedSA || !selectedCorrelativo) return;
      try {
        setLoading(true);
        setError(null);
        setDatosInsumos(null);
        
        const data = await CalculadoraService.getResumenServicio(
          Number(selectedSA.value),
          formatearFechaParaAPI(fecha), 
          Number(selectedCorrelativo.value)
        );
        
        if (data && data.totales) {
          setResultados(resultados.map(res => {
            const apiTotal = data.totales.find((t: any) => t.idCategoriaGrupo === Number(res.id));
            return { ...res, value: apiTotal ? String(apiTotal.cantidad) : "0" };
          }));
        } else {
          setResultados(prev => prev.map(r => ({ ...r, value: "0" })));
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
    const valorLimpio = nuevoTexto.replace(/[^0-9]/g, '');

    setResultados(prev => prev.map(item => {
      if (item.id === id) {
        if (valorLimpio === "") return { ...item, value: "0" };
        const valorNormalizado = valorLimpio.replace(/^0+(?=\d)/, '');
        return { ...item, value: valorNormalizado };
      }
      return item;
    }));

    // 🚦 El usuario tocó una cantidad manualmente: hay que permitir recalcular
    setNecesitaRecalcular(true);
  };

  const manejarContinuar = async () => {
    const payload = { categorias: resultados.map(item => ({ idCategoriaGrupo: Number(item.id), cantidad: parseInt(item.value) || 0 })) };
    try {
      setLoading(true);
      const data = await CalculadoraService.calcularDosificacionInsumos(payload, idTipoPreparacion);
      if (data) {
        setDatosInsumos(data);
        setNecesitaRecalcular(false); // 🚦 ya calculamos con estos valores, bloqueamos el botón

        // 🎬 Animación de aparición del resultado
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();
      }
    } catch (err) { mostrarError('Error', 'Ocurrió un problema al procesar los insumos.'); }
    finally { setLoading(false); }
  };

  const botonCalcularDeshabilitado = !selectedSA || !selectedCorrelativo || loading || !necesitaRecalcular;

  return ( 
    <SafeAreaView style={styles.container}> 
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flexible}>
        <View style={[styles.header, { height: (esPantallaGrande ? 120 : 100) + insets.top, paddingTop: insets.top }]}> 
          <View style={styles.headerContent}> 

            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                }
              }} 
              activeOpacity={0.8}
            > 
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
              <DateTimePicker value={fecha} mode="date" display="default" onChange={manejarCambioFecha} />
            )}

            <View style={styles.pickerRow}> 
              <TouchableOpacity style={styles.customPickerButton} onPress={() => setModalSAVisible(true)}>
                <Text style={[styles.pickerButtonText, selectedSA && styles.pickerSelectedText]} allowFontScaling={false} maxFontSizeMultiplier={1} numberOfLines={1}>{selectedSA ? selectedSA.label : "Seleccione S.A."}</Text>
                <Ionicons name="chevron-down" size={18} color="#006080" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.customPickerButton, !selectedSA && styles.pickerButtonDisabled]} disabled={!selectedSA} onPress={() => setModalCorrelativoVisible(true)}>
                <Text style={[styles.pickerButtonText, selectedCorrelativo && styles.pickerSelectedText]} allowFontScaling={false} maxFontSizeMultiplier={1} numberOfLines={1}>{selectedCorrelativo ? selectedCorrelativo.label : "Correlativo"}</Text>
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
            
            <TouchableOpacity 
              style={[styles.continueButton, botonCalcularDeshabilitado && styles.continueButtonDisabled]} 
              onPress={manejarContinuar} 
              disabled={botonCalcularDeshabilitado}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.continueButtonText}>
                  {datosInsumos && !necesitaRecalcular ? "CALCULADO ✓" : "Calcular"}
                </Text>
              )}
            </TouchableOpacity> 
            {datosInsumos && !necesitaRecalcular && (
              <Text style={styles.recalculoHint}>
                Modifica una cantidad, la fecha, el S.A. o el correlativo para volver a calcular.
              </Text>
            )}

            {datosInsumos && (
              <Animated.View style={{ opacity: fadeAnim }}>
                <Text style={styles.necesitasTitle}>NECESITAS UNA DE ESTAS PRESENTACIONES:</Text> 
                <Text style={styles.necesitasSubtitle}>
                  Elige solo una opción de empaque, no se suman entre sí.
                </Text>

                <View style={styles.necesitasRow}> 
                  <View style={styles.necesitasCard}>
                    <Text style={styles.necesitasValue}>{datosInsumos.empaquesSugeridos["Opción en empaques de 1 Kg/L"] || 0}</Text>
                    <Text style={styles.necesitasLabel}>BOLSAS{"\n"}1 KG</Text>
                  </View>

                  <View style={styles.orDivider}>
                    <View style={styles.orCircle}><Text style={styles.orText}>O</Text></View>
                  </View>

                  <View style={styles.necesitasCard}>
                    <Text style={styles.necesitasValue}>{datosInsumos.empaquesSugeridos["Opción en empaques de 500 g/ml"] || 0}</Text>
                    <Text style={styles.necesitasLabel}>BOLSAS{"\n"}1/2 KG</Text>
                  </View>

                  <View style={styles.orDivider}>
                    <View style={styles.orCircle}><Text style={styles.orText}>O</Text></View>
                  </View>

                  <View style={styles.necesitasCard}>
                    <Text style={styles.necesitasValue}>{datosInsumos.empaquesSugeridos["Opción en empaques de 250 g/ml"] || 0}</Text>
                    <Text style={styles.necesitasLabel}>BOLSAS{"\n"}250 G</Text>
                  </View>
                </View>
              </Animated.View>
            )}
          </ScrollView> 
        </View>

        {/* Navegación Inferior (mismo diseño que las demás pantallas, solo Inicio) */}
        {!tecladoVisible && (
          <View style={[styles.bottomNav, { minHeight: 68 + insets.bottom, paddingBottom: insets.bottom }]}>
            <TouchableOpacity
              style={styles.navItem}
              activeOpacity={0.6}
              onPress={() => {
                if (pathname !== '/administrador/inicio') {
                  router.replace('/administrador/inicio');
                }
              }}
            >
              <Ionicons name="home-outline" size={22} color="#006080" />
              <Text style={[styles.navLabel, { color: '#006080', fontWeight: 'bold' }]}>Inicio</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Modales (S.A. y Correlativo) mantienen tu estilo intacto */}
      <Modal visible={modalSAVisible} transparent animationType="fade"><View style={styles.modalOverlay}><View style={styles.modalContent}><Text style={styles.modalTitle}>Seleccione Centro</Text><FlatList data={listaCentros} keyExtractor={(i) => String(i.value)} renderItem={({item}) => <TouchableOpacity style={styles.modalOption} onPress={() => manejarCambioSA(item)}><Text style={styles.modalOptionText}>{item.label}</Text></TouchableOpacity>} /><TouchableOpacity style={styles.closeModalButton} onPress={() => setModalSAVisible(false)}><Text style={styles.closeModalButtonText}>Cancelar</Text></TouchableOpacity></View></View></Modal>
      <Modal visible={modalCorrelativoVisible} transparent animationType="fade"><View style={styles.modalOverlay}><View style={styles.modalContent}><Text style={styles.modalTitle}>Seleccione Correlativo</Text><FlatList data={OPCIONES_CORRELATIVO} keyExtractor={(i) => i.value} renderItem={({item}) => <TouchableOpacity style={styles.modalOption} onPress={() => manejarCambioCorrelativo(item)}><Text style={styles.modalOptionText}>{item.label}</Text></TouchableOpacity>} /><TouchableOpacity style={styles.closeModalButton} onPress={() => setModalCorrelativoVisible(false)}><Text style={styles.closeModalButtonText}>Cancelar</Text></TouchableOpacity></View></View></Modal>
      <ModalMensaje {...modalProps} />
    </SafeAreaView> 
  ); 
}

const ResultItem = ({ label, value, color, onChangeText }: any) => ( 
  <View style={styles.resultItem}> 
    <Text style={styles.resultLabel}>{label}</Text> 
    <View style={[styles.valueContainer, { backgroundColor: color }]}> 
      <TextInput
        style={[styles.resultInput, { color: '#FFFFFF' }]}
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
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  flexible: { flex: 1 },
  header: { backgroundColor: '#C5D800', justifyContent: 'center' },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  welcomeText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  userName: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  backButton: { backgroundColor: '#FF0080', flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
  backButtonText: { color: '#FFFFFF', fontWeight: 'bold', marginLeft: 5, fontSize: 12 },
  scrollWrapper: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  pickerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  customPickerButton: { flex: 0.48, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#C5BBE3', borderRadius: 12, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  pickerButtonDisabled: { backgroundColor: '#F0F0F0', borderColor: '#E2E8F0', opacity: 0.6 },
  pickerButtonText: { fontSize: 16, lineHeight: 20, color: '#888888', fontWeight: '600', flex: 1 },
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
  continueButton: { backgroundColor: '#006080', paddingVertical: 18, borderRadius: 30, alignItems: 'center' },
  continueButtonDisabled: { backgroundColor: '#94A3B8' },
  continueButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  recalculoHint: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 25,
  },

  // Bloque "NECESITAS" con aclaración de que es una elección (OR)
  necesitasTitle: { fontSize: 16, fontWeight: 'bold', color: '#006080', marginTop: 10, marginBottom: 4, textAlign: 'center' },
  necesitasSubtitle: { fontSize: 12, color: '#64748B', fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  necesitasRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  necesitasCard: { flex: 1, backgroundColor: '#EEEEEE', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  necesitasValue: { fontSize: 18, fontWeight: 'bold', color: '#4CAF50', marginBottom: 5 },
  necesitasLabel: { fontSize: 9, fontWeight: 'bold', color: '#4CAF50', textAlign: 'center' },
  orDivider: { width: 28, alignItems: 'center', justifyContent: 'center' },
  orCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#006080',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },

  // --- Navbar estándar (mismo diseño que las demás pantallas, solo Inicio) ---
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    width: '100%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navLabel: { fontSize: 11, marginTop: 4, color: '#757575' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', width: '90%', borderRadius: 20, padding: 20, maxHeight: '60%' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#006080', marginBottom: 15, textAlign: 'center' },
  modalOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalOptionText: { fontSize: 16, color: '#333333', fontWeight: '600' },
  closeModalButton: { marginTop: 15, backgroundColor: '#FF0080', paddingVertical: 12, borderRadius: 15, alignItems: 'center' },
  closeModalButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  loaderContainer: { marginVertical: 30, alignItems: 'center' }
});