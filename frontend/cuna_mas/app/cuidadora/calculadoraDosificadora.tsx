import React, { useState, useEffect } from 'react'; 
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView,
  useWindowDimensions,
  Modal,
  FlatList,
  TextInput,
  Keyboard, 
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert
} from 'react-native'; 
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import { CalculadoraService } from '../../service/calculadoraService'; 
import { CentroAlimentarioService } from '../../service/servicioAlimentario'; // Asegúrate de que la ruta sea correcta según tu estructura de carpetas

const OPCIONES_CORRELATIVO = [
  { label: 'Media Mañana ', value: '1' },
  { label: 'Media Tarde', value: '2' },
];

export default function DosificacionResultados() { 
  const router = useRouter();
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;

  // 📥 Recibimos de forma segura el nombrePreparacion enviado por la pantalla anterior
  const { nombrePreparacion } = useLocalSearchParams();

  // Estados para la carga dinámica de Centros (S.A.) desde tu API
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

  // 📥 ESTADO PARA GUARDAR LA RESPUESTA DE TU API (Dosificación)
  const [datosInsumos, setDatosInsumos] = useState<any>(null);

  // 🔌 CARGA DINÁMICA DE S.A. DESDE TU API CONFIGURADA CON TU JSON
  useEffect(() => {
    const cargarCentrosSA = async () => {
      try {
        setCargandoCentros(true);
        const data = await CentroAlimentarioService.getCentrosTodos();
        
        // 🛠️ CORRECCIÓN: Accedemos a data.content que es donde viene tu arreglo de comedores
        if (data && data.content && Array.isArray(data.content)) {
          const formateados = data.content.map((centro: any) => ({
            // 🛠️ CORRECCIÓN: Mapeamos con 'nombreCentro' e 'idCentroAlimentario'
            label: centro.nombreCentro || 'Centro sin nombre',
            value: centro.idCentroAlimentario
          }));
          setListaCentros(formateados);
        } else if (data && Array.isArray(data)) {
          // Caso de respaldo por si en algún entorno cambia la estructura
          const formateados = data.map((centro: any) => ({
            label: centro.nombreCentro || centro.nombre || 'Centro sin nombre',
            value: centro.idCentroAlimentario || centro.id
          }));
          setListaCentros(formateados);
        }
      } catch (err) {
        console.error("Error al cargar centros desde la API:", err);
      } finally {
        setCargandoCentros(false);
      }
    };

    cargarCentrosSA();
  }, []);

  // Resetear el correlativo si el usuario cambia de S.A. / Centro
  const manejarCambioSA = (item: any) => {
    setSelectedSA(item);
    setSelectedCorrelativo(null); // Resetea el paso 2
    setResultados(prev => prev.map(r => ({ ...r, value: "0" })));
    setDatosInsumos(null); // Limpia la sección Necesitas anterior
    setModalSAVisible(false);
  };

  // 🌟 useEffect: SOLO carga si AMBOS selectores están listos
  useEffect(() => {
    const cargarTotalesDesdeAPI = async () => {
      if (!selectedSA || !selectedCorrelativo) return;

      try {
        setLoading(true);
        setError(null);
        setDatosInsumos(null);
        
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        const fechaActual = `${yyyy}-${mm}-${dd}`;

        const correlativoParam = Number(selectedCorrelativo.value);

        // Tu API original para asistencias
        const data = await CalculadoraService.getResumenServicio(fechaActual, correlativoParam);

        if (data && data.totales) {
          const nuevosResultados = resultados.map(res => {
            const apiTotal = data.totales.find((t: any) => t.idCategoriaGrupo === Number(res.id));
            return {
              ...res,
              value: apiTotal ? String(apiTotal.cantidad) : "0"
            };
          });
          setResultados(nuevosResultados);
        }
      } catch (err) {
        console.error("Error al traer datos de asistencia:", err);
        setError("Error de conexión al recuperar los totales.");
      } finally {
        setLoading(false);
      }
    };

    cargarTotalesDesdeAPI();
  }, [selectedSA, selectedCorrelativo]);

  useEffect(() => {
    const tecladoMuestra = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setTecladoVisible(true)
    );
    const tecladoOculta = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setTecladoVisible(false)
    );

    return () => {
      tecladoMuestra.remove();
      tecladoOculta.remove();
    };
  }, []);

  const manejarCambioValor = (id: string, nuevoValor: string) => {
    const valorLimpio = nuevoValor.replace(/[^0-9]/g, '');
    setResultados(prevResultados => 
      prevResultados.map(item => 
        item.id === id ? { ...item, value: valorLimpio } : item
      )
    );
  };

  // 🚀 MANEJAR CONTINUAR INTEGRADO DIRECTAMENTE CON TU CALCULADORASERVICE
  const manejarContinuar = async () => {
    if (!nombrePreparacion) {
      console.error("❌ ERROR: No se recibió 'nombrePreparacion' desde la pantalla anterior.");
      Alert.alert(
        "Información Faltante", 
        "No se pudo identificar la preparación seleccionada. Por favor, regresa a la pantalla anterior e inténtalo de nuevo."
      );
      return; 
    }

    const payload = {
      categorias: resultados.map(item => ({
        idCategoriaGrupo: Number(item.id),
        cantidad: parseInt(item.value) || 0
      }))
    };

    try {
      setLoading(true);
      const data = await CalculadoraService.calcularDosificacionInsumos(payload);
      if (data) {
        setDatosInsumos(data); 
      } else {
        Alert.alert("Error", "No se recibieron datos del servidor.");
      }
    } catch (err) {
      console.error("Error al calcular con tu API:", err);
      Alert.alert("Error", "Ocurrió un problema al procesar los insumos con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return ( 
    <SafeAreaView style={styles.container}> 
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.flexible}
      >
        
        <View style={[styles.header, { height: esPantallaGrande ? 120 : 100 }]}> 
          <View style={styles.headerContent}> 
            <View style={styles.userInfo}> 
              <View style={styles.avatar}> 
                <Ionicons name="person" size={24} color="#C5D800" /> 
              </View> 
              <View> 
                <Text style={styles.welcomeText}>Bienvenid@</Text> 
                <Text style={styles.userName}>María Estela</Text> 
              </View> 
            </View> 
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            > 
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" /> 
              <Text style={styles.backButtonText}>VOLVER</Text> 
            </TouchableOpacity> 
          </View> 
        </View> 

        <View style={styles.scrollWrapper}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          > 
            
            <View style={styles.pickerRow}> 
              {/* Paso 1: Seleccionar S.A. / Centro */}
              <TouchableOpacity 
                style={styles.customPickerButton}
                activeOpacity={0.7}
                onPress={() => setModalSAVisible(true)}
              >
                <Text style={[styles.pickerButtonText, selectedSA && styles.pickerSelectedText]} numberOfLines={1}>
                  {selectedSA ? selectedSA.label : "Seleccione S.A."}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#006080" />
              </TouchableOpacity>

              {/* Paso 2: Seleccionar Correlativo */}
              <TouchableOpacity 
                style={[
                  styles.customPickerButton, 
                  !selectedSA && styles.pickerButtonDisabled
                ]}
                activeOpacity={0.7}
                disabled={!selectedSA}
                onPress={() => setModalCorrelativoVisible(true)}
              >
                <Text 
                  style={[
                    styles.pickerButtonText, 
                    selectedCorrelativo && styles.pickerSelectedText,
                    !selectedSA && { color: '#B0B0B0' }
                  ]} 
                  numberOfLines={1}
                >
                  {selectedCorrelativo ? selectedCorrelativo.label : "Correlativo"}
                </Text>
                <Ionicons name="chevron-down" size={18} color={selectedSA ? "#006080" : "#B0B0B0"} />
              </TouchableOpacity>
            </View> 

            <Text style={styles.sectionTitle}>TOTAL:</Text> 

            {!selectedSA || !selectedCorrelativo ? (
              <View style={styles.indicacionContainer}>
                <Ionicons name="information-circle-outline" size={32} color="#006080" />
                <Text style={styles.indicacionText}>
                  Por favor, seleccione una S.A. y su respectivo Correlativo para sincronizar los totales del día.
                </Text>
              </View>
            ) : loading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#006080" />
                <Text style={styles.loaderText}>Sincronizando...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : (
              <View style={styles.resultsList}> 
                {resultados.map((item) => (
                  <ResultItem 
                    key={item.id}
                    label={item.label} 
                    value={item.value} 
                    color={item.color} 
                    onChangeText={(texto) => manejarCambioValor(item.id, texto)}
                  /> 
                ))}
              </View> 
            )}

            <View style={styles.guarnicionCard}> 
              <MaterialCommunityIcons name="silverware-fork-knife" size={24} color="#006080" /> 
              <Text style={styles.guarnicionText}>
                {nombrePreparacion ? String(nombrePreparacion).toUpperCase() : "ARROZ COMO GUARNICIÓN"}
              </Text> 
            </View> 

            <TouchableOpacity 
              style={[styles.continueButton, (!selectedSA || !selectedCorrelativo) && styles.continueButtonDisabled]} 
              activeOpacity={0.8} 
              onPress={manejarContinuar}
              disabled={!selectedSA || !selectedCorrelativo || loading}
            > 
              <Text style={styles.continueButtonText}>CONTINUAR</Text> 
            </TouchableOpacity> 

            {/* SECCIÓN DINÁMICA: "NECESITAS" */}
            {datosInsumos && (
              <View>
                <Text style={styles.necesitasTitle}>
                  NECESITAS ({datosInsumos.alimento}):
                </Text> 
                <View style={styles.necesitasRow}> 
                  <View style={styles.necesitasCard}> 
                    <Text style={styles.necesitasValue}>
                      {datosInsumos.empaquesSugeridos["Opción en empaques de 1 Kg/L"] || 0}
                    </Text> 
                    <Text style={styles.necesitasLabel}>BOLSAS DE 1 KG</Text> 
                  </View> 
                  <View style={styles.necesitasCard}> 
                    <Text style={styles.necesitasValue}>
                      {datosInsumos.empaquesSugeridos["Opción en empaques de 500 g/ml"] || 0}
                    </Text> 
                    <Text style={styles.necesitasLabel}>BOLSAS DE 1/2 KG</Text> 
                  </View> 
                  <View style={styles.necesitasCard}> 
                    <Text style={styles.necesitasValue}>
                      {datosInsumos.empaquesSugeridos["Opción en empaques de 250 g/ml"] || 0}
                    </Text> 
                    <Text style={styles.necesitasLabel}>BOLSAS DE 250 G</Text> 
                  </View> 
                </View> 
                <Text style={styles.totalGramosText}>
                  Total requerido: {datosInsumos.totalGramosO_Ml} {datosInsumos.unidad}
                </Text>
              </View>
            )}
          </ScrollView> 
        </View>

        {!tecladoVisible && (
          <View style={styles.bottomBarContainer}>
            <TouchableOpacity 
              style={styles.homeButtonCircle}
              onPress={() => router.replace('/inicio')}
              activeOpacity={0.85}
            >
              <Ionicons name="home" size={24} color="#00AEEF" />
              <Text style={styles.homeButtonText}>Inicio</Text>
            </TouchableOpacity>
          </View>
        )}

      </KeyboardAvoidingView>

      {/* MODAL S.A. */}
      <Modal visible={modalSAVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccione Centro / S.A.</Text>
            {cargandoCentros ? (
              <ActivityIndicator size="small" color="#006080" style={{ marginVertical: 20 }} />
            ) : (
              <FlatList
                data={listaCentros}
                keyExtractor={(item, index) => item.value ? String(item.value) : `centro-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.modalOption} 
                    onPress={() => manejarCambioSA(item)}
                  >
                    <Text style={styles.modalOptionText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={{ textAlign: 'center', color: '#888', marginVertical: 10 }}>
                    No se encontraron centros disponibles.
                  </Text>
                }
              />
            )}
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalSAVisible(false)}>
              <Text style={styles.closeModalButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL CORRELATIVO */}
      <Modal visible={modalCorrelativoVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccione Correlativo</Text>
            <FlatList
              data={OPCIONES_CORRELATIVO}
              keyExtractor={(item, index) => item.value ? String(item.value) : `correlativo-${index}`}
              renderItem={({ item }) => (
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

    </SafeAreaView> 
  ); 
} 

const ResultItem = ({ label, value, color, onChangeText }) => ( 
  <View style={styles.resultItem}> 
    <Text style={styles.resultLabel}>{label}</Text> 
    <View style={styles.valueContainer}> 
      <TextInput
        style={[styles.resultInput, { color: color }]}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        selectTextOnFocus={true}
        maxLength={4}
      />
    </View> 
  </View> 
); 

const styles = StyleSheet.create({ 
  container: { 
    flex: 1, 
    backgroundColor: '#F9F9F9', 
  }, 
  flexible: {
    flex: 1,
  },
  header: { 
    backgroundColor: '#C5D800', 
    borderBottomLeftRadius: 40, 
    borderBottomRightRadius: 40, 
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  }, 
  headerContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
  }, 
  userInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
  }, 
  avatar: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: '#FFFFFF', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 10, 
  }, 
  welcomeText: { 
    color: '#FFFFFF', 
    fontSize: 12, 
    fontWeight: 'bold', 
  }, 
  userName: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '900', 
  }, 
  backButton: { 
    backgroundColor: '#FF0080', 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 8, 
    paddingHorizontal: 15, 
    borderRadius: 20, 
  }, 
  backButtonText: { 
    color: '#FFFFFF', 
    fontWeight: 'bold', 
    marginLeft: 5, 
    fontSize: 12, 
  }, 
  scrollWrapper: {
    flex: 1, 
  },
  scrollContent: { 
    padding: 20, 
    paddingBottom: 20, 
  }, 
  pickerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 25, 
    marginTop: 10, 
  }, 
  customPickerButton: {
    flex: 0.48,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#C5BBE3', 
    borderRadius: 12,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerButtonDisabled: {
    backgroundColor: '#F0F0F0',
    borderColor: '#E2E8F0',
    opacity: 0.6
  },
  pickerButtonText: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '600',
    flex: 1,
    marginRight: 4,
  },
  pickerSelectedText: {
    color: '#333333',
    fontWeight: '800',
  },
  sectionTitle: { 
    color: '#006080', 
    fontWeight: 'bold', 
    fontSize: 16, 
    marginBottom: 15, 
  }, 
  resultsList: { 
    marginBottom: 20, 
  }, 
  resultItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#EEEEEE', 
    paddingVertical: 10, 
    paddingHorizontal: 15,
    borderRadius: 10, 
    marginBottom: 10, 
  }, 
  resultLabel: { 
    fontSize: 14, 
    color: '#333333', 
    fontWeight: '500', 
    flex: 1,
  }, 
  valueContainer: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 5, 
    borderWidth: 1, 
    borderColor: '#CCCCCC', 
    width: 65, 
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  }, 
  resultInput: { 
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 16, 
    fontWeight: 'bold', 
    padding: 0,
  }, 
  indicacionContainer: {
    backgroundColor: '#E6F4EA',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  indicacionText: {
    color: '#047857',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18
  },
  guarnicionCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#E0E0E0', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 25, 
  }, 
  guarnicionText: { 
    marginLeft: 15, 
    color: '#333333', 
    fontWeight: 'bold', 
    fontSize: 14, 
  }, 
  continueButton: { 
    backgroundColor: '#006080', 
    paddingVertical: 18, 
    borderRadius: 30, 
    alignItems: 'center', 
    marginBottom: 25, 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 2, 
  }, 
  continueButtonDisabled: {
    backgroundColor: '#94A3B8',
    elevation: 0,
    shadowOpacity: 0,
  },
  continueButtonText: { 
    color: '#FFFFFF', 
    fontWeight: 'bold', 
    fontSize: 16, 
  }, 
  necesitasTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#006080', 
    marginBottom: 10, 
  }, 
  necesitasRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
  }, 
  necesitasCard: { 
    flex: 0.31, 
    backgroundColor: '#EEEEEE', 
    paddingVertical: 15, 
    paddingHorizontal: 5,
    borderRadius: 10, 
    alignItems: 'center', 
  }, 
  necesitasValue: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#4CAF50', 
    marginBottom: 5, 
  }, 
  necesitasLabel: { 
    fontSize: 9, 
    fontWeight: 'bold', 
    color: '#4CAF50', 
    textAlign: 'center', 
  }, 
  totalGramosText: {
    textAlign: 'right',
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
    marginTop: 8,
    fontStyle: 'italic'
  },
  bottomBarContainer: {
    width: '100%',
    backgroundColor: '#F9F9F9', 
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15, 
    paddingBottom: 50, 
    borderTopWidth: 1,
    borderColor: '#E2E8F0', 
  },
  homeButtonCircle: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: 130,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  homeButtonText: {
    color: '#00AEEF',
    fontWeight: '800',
    fontSize: 12,
    marginTop: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '90%',
    borderRadius: 20,
    padding: 20,
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#006080',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  closeModalButton: {
    marginTop: 15,
    backgroundColor: '#FF0080',
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loaderContainer: {
    marginVertical: 30,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    color: '#006080',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
  },
  errorText: {
    color: '#B91C1C',
    textAlign: 'center',
    fontWeight: '500',
  }
});