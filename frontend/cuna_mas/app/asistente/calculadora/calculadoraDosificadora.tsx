import React, { useState, useEffect, useRef } from 'react'; 
import { 
  StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView,
  useWindowDimensions, Modal, FlatList, TextInput, Keyboard, Platform,
  KeyboardAvoidingView, ActivityIndicator, Alert
} from 'react-native'; 
import { Ionicons } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { CalculadoraService } from '../../../service/calculadoraService'; 
import { CentroAlimentarioService } from '../../../service/servicioAlimentario'; 
import { useAuth } from '../../../context/AuthContext';

const OPCIONES_CORRELATIVO = [
  { label: 'Media Mañana ', value: '1' },
  { label: 'Media Tarde', value: '2' },
];

// Clave única para guardar la lista acumulada
const STORAGE_KEY = '@CalculadoraUnificada:lista_alimentos'; 

// Mapeo fijo de id de categoría -> clave de categoría etaria en el JSON final
const MAPA_CATEGORIA_ETARIA: Record<string, string> = {
  '1': 'ninos6a9Meses',
  '2': 'ninos10a12Meses',
  '3': 'ninos13a23Meses',
  '4': 'ninos24a36Meses',
  '5': 'actoresComunales',
};

const ESTRUCTURA_VACIA = { alimentos: [] as any[] };

export default function CalculadoraUnificada() { 
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const { user } = useAuth(); 

  const scrollViewRef = useRef<ScrollView>(null);

  // --- ESTADOS DE DATOS API ---
  const [listaCategorias, setListaCategorias] = useState<any[]>([]);
  const [listaPreparaciones, setListaPreparaciones] = useState<any[]>([]);
  const [listaCentros, setListaCentros] = useState<any[]>([]);

  // --- ESTADOS DE SELECCIÓN ---
  const [selectedCategoria, setSelectedCategoria] = useState<any>(null);
  const [selectedPreparacion, setSelectedPreparacion] = useState<any>(null);
  const [selectedSA, setSelectedSA] = useState<any>(null); 
  const [selectedCorrelativo, setSelectedCorrelativo] = useState<any>(null); 
  const [fecha, setFecha] = useState(new Date());

  // --- ESTADOS DE FLUJO / UI ---
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [modalCategoriaVisible, setModalCategoriaVisible] = useState(false);
  const [modalPreparacionVisible, setModalPreparacionVisible] = useState(false);
  const [modalSAVisible, setModalSAVisible] = useState(false);
  const [modalCorrelativoVisible, setModalCorrelativoVisible] = useState(false);
  const [modalJsonVisible, setModalJsonVisible] = useState(false);
  const [tecladoVisible, setTecladoVisible] = useState(false);
  
  const [cargandoCentros, setCargandoCentros] = useState(false);
  const [cargandoPreparaciones, setCargandoPreparaciones] = useState(false);
  const [loadingTotales, setLoadingTotales] = useState(false);
  const [loadingCalcular, setLoadingCalcular] = useState(false);

  const [resultados, setResultados] = useState([
    { id: '1', label: "Niños de 6 a 9 Meses", value: "0", color: "#4CAF50" }, 
    { id: '2', label: "Niños de 10 a 12 Meses", value: "0", color: "#FF4081" }, 
    { id: '3', label: "Niños de 13 a 23 Meses", value: "0", color: "#FFB300" }, 
    { id: '4', label: "Niños de 24 a 36 Meses", value: "0", color: "#FFB300" }, 
    { id: '5', label: "Actores Comunales", value: "0", color: "#FFB300" }, 
  ]);
  const [datosInsumos, setDatosInsumos] = useState<any>(null);
  const [jsonActualFormateado, setJsonActualFormateado] = useState<string>(
    JSON.stringify(ESTRUCTURA_VACIA, null, 2)
  );

  const formatearFechaParaAPI = (date: Date) => {
    const año = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0'); 
    const dia = String(date.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };

  // 💾 Crea el objeto con el formato exacto solicitado
  const crearEstructuraAlimento = (insumos: any) => {
    return {
      nombre: selectedPreparacion ? (selectedPreparacion.nombrePreparacion || "Sin nombre") : "",
      categoriaEtaria: resultados.reduce((acc: any, item: any) => {
        const clave = MAPA_CATEGORIA_ETARIA[item.id];
        if (clave) {
          acc[clave] = parseInt(item.value) || 0;
        }
        return acc;
      }, {}),
      presentacion: {
        bolsas1kg: insumos?.empaquesSugeridos?.["Opción en empaques de 1 Kg/L"] || 0,
        bolsas500g: insumos?.empaquesSugeridos?.["Opción en empaques de 500 g/ml"] || 0,
        bolsas250g: insumos?.empaquesSugeridos?.["Opción en empaques de 250 g/ml"] || 0,
      }
    };
  };

  // 🔥 Obtiene la lista actual, añade el nuevo cálculo y guarda todo dentro de { alimentos: [...] }
  const acumularYGuardarAlimento = async (nuevosInsumos: any) => {
    try {
      // 1. Obtener lista previa de AsyncStorage
      const stringExistente = await AsyncStorage.getItem(STORAGE_KEY);
      let listaAlimentos: any[] = [];

      if (stringExistente) {
        try {
          const parsed = JSON.parse(stringExistente);
          // Soporta formato viejo (array plano) y el nuevo ({ alimentos: [] })
          listaAlimentos = Array.isArray(parsed) ? parsed : (parsed.alimentos || []);
        } catch {
          listaAlimentos = [];
        }
      }

      // 2. Crear nuevo objeto formateado
      const nuevoRegistro = crearEstructuraAlimento(nuevosInsumos);

      // 3. Añadir a la lista acumulada
      listaAlimentos.push(nuevoRegistro);

      // 4. Guardar objeto completo envuelto en "alimentos"
      const objetoFinal = { alimentos: listaAlimentos };
      const listaSerializada = JSON.stringify(objetoFinal, null, 2);
      await AsyncStorage.setItem(STORAGE_KEY, listaSerializada);
      setJsonActualFormateado(listaSerializada);

      // Mostrar en consola el JSON actualizado
      imprimirJsonConsola(objetoFinal);

    } catch (e) {
      console.error("Error al acumular alimento en el JSON:", e);
    }
  };

  // Borrar todo el historial acumulado
  const limpiarHistorialJSON = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setJsonActualFormateado(JSON.stringify(ESTRUCTURA_VACIA, null, 2));
      Alert.alert("Éxito", "El historial acumulado de alimentos ha sido borrado.");
    } catch (e) {
      console.error("Error al limpiar:", e);
    }
  };

  // 🔄 CARGA INICIAL
  useEffect(() => {
    const inicializarCatalogos = async () => {
      try {
        setCargandoCentros(true);
        const cats = await CalculadoraService.getListaCategorias();
        setListaCategorias(cats || []);

        const centros = await CentroAlimentarioService.getCentrosTodos();
        if (Array.isArray(centros)) {
          setListaCentros(centros.map((c: any) => ({
            label: c.nombreCentro || 'Centro sin nombre',
            value: c.idCentroAlimentario
          })));
        }

        // Cargar lo que ya esté acumulado en memoria
        const guardado = await AsyncStorage.getItem(STORAGE_KEY);
        if (guardado) {
          setJsonActualFormateado(guardado);
        }
      } catch (err) {
        console.error("Error en carga inicial:", err);
      } finally {
        setCargandoCentros(false);
      }
    };
    inicializarCatalogos();
  }, []);

  useEffect(() => {
    const cargarPreparaciones = async () => {
      if (!selectedCategoria) {
        setListaPreparaciones([]);
        return;
      }
      try {
        setCargandoPreparaciones(true);
        const data = await CalculadoraService.getPreparacionesPorCategoria(selectedCategoria.idCategoriaAlimento);
        setListaPreparaciones(data || []);
      } catch (err) {
        console.error("Error al cargar preparaciones:", err);
      } finally {
        setCargandoPreparaciones(false);
      }
    };
    cargarPreparaciones();
  }, [selectedCategoria]);

  useEffect(() => {
    const cargarTotalesBase = async () => {
      if (!selectedSA || !selectedCorrelativo || !selectedPreparacion) return;
      
      try {
        setLoadingTotales(true);
        const data = await CalculadoraService.getResumenServicio(
          Number(selectedSA.value),     
          formatearFechaParaAPI(fecha), 
          Number(selectedCorrelativo.value)
        );
        
        let nuevosResultados = [...resultados];
        if (data && data.totales) {
          nuevosResultados = resultados.map(res => {
            const apiTotal = data.totales.find((t: any) => t.idCategoriaGrupo === Number(res.id));
            return { ...res, value: apiTotal ? String(apiTotal.cantidad) : "0" };
          });
          setResultados(nuevosResultados);
        } else {
          nuevosResultados = resultados.map(r => ({ ...r, value: "0" }));
          setResultados(nuevosResultados);
        }
      } catch (err) {
        console.error("Error al recuperar totales:", err);
      } finally { setLoadingTotales(false); }
    };
    
    cargarTotalesBase();
  }, [selectedSA, selectedCorrelativo, fecha, selectedPreparacion]);

  const manejarCambioCategoria = async (cat: any) => {
    setSelectedCategoria(cat);
    setSelectedPreparacion(null); 
    setDatosInsumos(null);
    setModalCategoriaVisible(false);
  };

  const manejarCambioSA = async (item: any) => {
    setSelectedSA(item);
    setSelectedCorrelativo(null); 
    const resetResultados = resultados.map(r => ({ ...r, value: "0" }));
    setResultados(resetResultados);
    setDatosInsumos(null);
    setModalSAVisible(false);
  };

  const manejarCambioCorrelativo = async (item: any) => {
    setSelectedCorrelativo(item);
    setModalCorrelativoVisible(false);
  };

  useEffect(() => {
    const tecladoMuestra = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setTecladoVisible(true));
    const tecladoOculta = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setTecladoVisible(false));
    return () => { tecladoMuestra.remove(); tecladoOculta.remove(); };
  }, []);

  const manejarCambioValor = (id: string, nuevoTexto: string) => {
    const valorLimpio = nuevoTexto.replace(/[^0-9]/g, '');
    const nuevosResultados = resultados.map(item => {
      if (item.id === id) {
        if (valorLimpio === "") return { ...item, value: "0" };
        return { ...item, value: valorLimpio.replace(/^0+(?=\d)/, '') };
      }
      return item;
    });
    setResultados(nuevosResultados);
  };

  // 🔥 CALCULAR Y ADICIONAR AL JSON ACUMULADO
  const manejarCalcular = async () => {
    if (!selectedPreparacion) return;
    
    const payload = { 
      categorias: resultados.map(item => ({ 
        idCategoriaGrupo: Number(item.id), 
        cantidad: parseInt(item.value) || 0 
      })) 
    };

    try {
      setLoadingCalcular(true);
      const data = await CalculadoraService.calcularDosificacionInsumos(payload, selectedPreparacion.idTipoPreparacion);
      if (data) {
        setDatosInsumos(data);
        
        // 💾 Guardamos y acumulamos el alimento con el formato exacto solicitado
        await acumularYGuardarAlimento(data);
        
        Alert.alert("¡Éxito!", "Cálculo procesado y añadido a la lista JSON.");
        
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 120);
      }
    } catch (err) { 
      Alert.alert("Error", "Ocurrió un problema al procesar."); 
    } finally { 
      setLoadingCalcular(false); 
    }
  };

  const imprimirJsonConsola = (objetoJson: any) => {
    console.log("==================================================");
    console.log("🔥 LISTA JSON COMPLETA (alimentos) 🔥");
    console.log("==================================================");
    console.log(JSON.stringify(objetoJson, null, 2));
    console.log("==================================================");
  };

  const manejarMostrarJSON = async () => {
    const guardado = await AsyncStorage.getItem(STORAGE_KEY);
    setJsonActualFormateado(guardado || JSON.stringify(ESTRUCTURA_VACIA, null, 2));
    setModalJsonVisible(true);
  };

  const listoParaCalcular = selectedSA && selectedCorrelativo && selectedPreparacion;

  return ( 
    <SafeAreaView style={styles.container}> 
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flexible}>
        
        {/* HEADER */}
        <View style={[styles.header, { height: esPantallaGrande ? 120 : 100, paddingTop: insets.top }]}> 
          <View style={styles.headerContent}> 
            <View style={styles.userInfo}> 
              <View style={styles.avatar}><Ionicons name="person" size={24} color="#C5D800" /></View> 
              <View><Text style={styles.welcomeText}>Socia de Cocina</Text><Text style={styles.userName}>{user?.nombre || 'Usuario'}</Text></View> 
            </View> 
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.8}> 
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" /><Text style={styles.backButtonText}>VOLVER</Text> 
            </TouchableOpacity> 
          </View> 
        </View> 

        <View style={styles.scrollWrapper}>
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="handled"
          > 
            
            {/* BLOQUE 1 */}
            <Text style={styles.sectionTitle}>1. Configuración de Alimento:</Text>
            <View style={styles.pickerRow}> 
              <TouchableOpacity style={styles.customPickerButton} onPress={() => setModalCategoriaVisible(true)}>
                <Text style={[styles.pickerButtonText, selectedCategoria && styles.pickerSelectedText]} numberOfLines={1}>
                  {selectedCategoria ? selectedCategoria.nombreCategoriaAlimento : "Categoría"}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#006080" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.customPickerButton, !selectedCategoria && styles.pickerButtonDisabled]} 
                disabled={!selectedCategoria || cargandoPreparaciones} 
                onPress={() => setModalPreparacionVisible(true)}
              >
                {cargandoPreparaciones ? (
                  <ActivityIndicator size="small" color="#006080" />
                ) : (
                  <>
                    <Text style={[styles.pickerButtonText, selectedPreparacion && styles.pickerSelectedText]} numberOfLines={1}>
                      {selectedPreparacion ? selectedPreparacion.nombrePreparacion : "Preparación"}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color={selectedCategoria ? "#006080" : "#B0B0B0"} />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* BLOQUE 2 */}
            <Text style={styles.sectionTitle}>2. Detalles de Control:</Text>
            <TouchableOpacity style={[styles.customPickerButton, { marginBottom: 15, flex: 1, width: '100%' }]} onPress={() => setMostrarDatePicker(true)}>
              <Text style={styles.pickerSelectedText}>Fecha: {fecha.toLocaleDateString()}</Text>
              <Ionicons name="calendar-outline" size={18} color="#006080" />
            </TouchableOpacity>
            {mostrarDatePicker && (
              <DateTimePicker 
                value={fecha} 
                mode="date" 
                display="default" 
                onChange={(e, d) => { 
                  setMostrarDatePicker(false); 
                  if(d) setFecha(d); 
                }} 
              />
            )}

            <View style={styles.pickerRow}> 
              <TouchableOpacity style={styles.customPickerButton} onPress={() => setModalSAVisible(true)}>
                <Text style={[styles.pickerButtonText, selectedSA && styles.pickerSelectedText]} numberOfLines={1}>
                  {selectedSA ? selectedSA.label : "Seleccione S.A."}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#006080" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.customPickerButton, !selectedSA && styles.pickerButtonDisabled]} disabled={!selectedSA} onPress={() => setModalCorrelativoVisible(true)}>
                <Text style={[styles.pickerButtonText, selectedCorrelativo && styles.pickerSelectedText]}>
                  {selectedCorrelativo ? selectedCorrelativo.label : "Correlativo"}
                </Text>
                <Ionicons name="chevron-down" size={18} color={selectedSA ? "#006080" : "#B0B0B0"} />
              </TouchableOpacity>
            </View> 

            {/* BLOQUE 3 */}
            <Text style={styles.sectionTitle}>3. Raciones por Grupo Etario:</Text> 
            {!listoParaCalcular ? (
              <View style={styles.indicacionContainer}>
                <Ionicons name="information-circle-outline" size={32} color="#006080" />
                <Text style={styles.indicacionText}>Complete la Categoría, Preparación, S.A. y Correlativo para habilitar.</Text>
              </View>
            ) : loadingTotales ? (
              <View style={styles.loaderContainer}><ActivityIndicator size="large" color="#006080" /></View>
            ) : (
              <View style={styles.resultsList}>
                {resultados.map((item) => (
                  <ResultItem key={item.id} {...item} onChangeText={(t) => manejarCambioValor(item.id, t)} />
                ))}
              </View>
            )}

            {/* BOTÓN CALCULAR */}
            <TouchableOpacity 
              style={[styles.continueButton, (!listoParaCalcular || loadingCalcular) && styles.continueButtonDisabled]} 
              onPress={manejarCalcular} 
              disabled={!listoParaCalcular || loadingCalcular}
            >
              {loadingCalcular ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.continueButtonText}>CALCULAR Y AÑADIR AL JSON</Text>
              )}
            </TouchableOpacity> 

            {/* BOTÓN VER JSON COMPLETO */}
            <TouchableOpacity 
              style={styles.jsonButton} 
              onPress={manejarMostrarJSON}
              activeOpacity={0.8}
            >
              <Ionicons name="code-working" size={22} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.jsonButtonText}>VER JSON ACUMULADO</Text>
            </TouchableOpacity>

            {/* VISTA DE INSUMOS */}
            {datosInsumos && (
              <View style={styles.resultadosInsumosContainer}>
                <Text style={styles.necesitasTitle}>NECESITAS:</Text> 
                <View style={styles.necesitasRow}> 
                  <View style={styles.necesitasCard}><Text style={styles.necesitasValue}>{datosInsumos.empaquesSugeridos?.["Opción en empaques de 1 Kg/L"] || 0}</Text><Text style={styles.necesitasLabel}>BOLSAS 1 KG</Text></View> 
                  <View style={styles.necesitasCard}><Text style={styles.necesitasValue}>{datosInsumos.empaquesSugeridos?.["Opción en empaques de 500 g/ml"] || 0}</Text><Text style={styles.necesitasLabel}>BOLSAS 1/2 KG</Text></View> 
                  <View style={styles.necesitasCard}><Text style={styles.necesitasValue}>{datosInsumos.empaquesSugeridos?.["Opción en empaques de 250 g/ml"] || 0}</Text><Text style={styles.necesitasLabel}>BOLSAS 250 G</Text></View> 
                </View> 
              </View>
            )}
          </ScrollView> 
        </View>

        {!tecladoVisible && (
          <View style={styles.bottomBarContainer}>
            <TouchableOpacity style={styles.homeButtonCircle} onPress={() => router.replace('/')}><Ionicons name="home" size={24} color="#00AEEF" /><Text style={styles.homeButtonText}>Inicio</Text></TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* --- MODALES --- */}
      <Modal visible={modalCategoriaVisible} transparent animationType="fade"><View style={styles.modalOverlay}><View style={styles.modalContent}><Text style={styles.modalTitle}>Seleccione Categoría</Text><FlatList data={listaCategorias} keyExtractor={(i) => String(i.idCategoriaAlimento)} renderItem={({item}) => <TouchableOpacity style={styles.modalOption} onPress={() => manejarCambioCategoria(item)}><Text style={styles.modalOptionText}>{item.nombreCategoriaAlimento}</Text></TouchableOpacity>} /><TouchableOpacity style={styles.closeModalButton} onPress={() => setModalCategoriaVisible(false)}><Text style={styles.closeModalButtonText}>Cancelar</Text></TouchableOpacity></View></View></Modal>
      <Modal visible={modalPreparacionVisible} transparent animationType="fade"><View style={styles.modalOverlay}><View style={styles.modalContent}><Text style={styles.modalTitle}>Seleccione Preparación</Text><FlatList data={listaPreparaciones} keyExtractor={(i) => String(i.idTipoPreparacion)} renderItem={({item}) => <TouchableOpacity style={styles.modalOption} onPress={() => { setSelectedPreparacion(item); setModalPreparacionVisible(false); }}><Text style={styles.modalOptionText}>{item.nombrePreparacion}</Text></TouchableOpacity>} /><TouchableOpacity style={styles.closeModalButton} onPress={() => setModalPreparacionVisible(false)}><Text style={styles.closeModalButtonText}>Cancelar</Text></TouchableOpacity></View></View></Modal>
      <Modal visible={modalSAVisible} transparent animationType="fade"><View style={styles.modalOverlay}><View style={styles.modalContent}><Text style={styles.modalTitle}>Seleccione Centro</Text><FlatList data={listaCentros} keyExtractor={(i) => String(i.value)} renderItem={({item}) => <TouchableOpacity style={styles.modalOption} onPress={() => manejarCambioSA(item)}><Text style={styles.modalOptionText}>{item.label}</Text></TouchableOpacity>} /><TouchableOpacity style={styles.closeModalButton} onPress={() => setModalSAVisible(false)}><Text style={styles.closeModalButtonText}>Cancelar</Text></TouchableOpacity></View></View></Modal>
      <Modal visible={modalCorrelativoVisible} transparent animationType="fade"><View style={styles.modalOverlay}><View style={styles.modalContent}><Text style={styles.modalTitle}>Seleccione Correlativo</Text><FlatList data={OPCIONES_CORRELATIVO} keyExtractor={(i) => i.value} renderItem={({item}) => <TouchableOpacity style={styles.modalOption} onPress={() => { setSelectedCorrelativo(item); setModalCorrelativoVisible(false); }}><Text style={styles.modalOptionText}>{item.label}</Text></TouchableOpacity>} /><TouchableOpacity style={styles.closeModalButton} onPress={() => setModalCorrelativoVisible(false)}><Text style={styles.closeModalButtonText}>Cancelar</Text></TouchableOpacity></View></View></Modal>
      
      {/* MODAL DEL VISOR JSON ACUMULADO */}
      <Modal visible={modalJsonVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%', width: '95%' }]}>
            <Text style={styles.modalTitle}>Lista Acumulada JSON</Text>
            
            <ScrollView style={styles.jsonConsoleContainer} showsVerticalScrollIndicator={true}>
              <Text style={styles.jsonText}>{jsonActualFormateado}</Text>
            </ScrollView>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={[styles.closeModalButton, { backgroundColor: '#FF003C', flex: 0.48, marginTop: 15 }]} onPress={limpiarHistorialJSON}>
                <Text style={styles.closeModalButtonText}>Limpiar Historial</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.closeModalButton, { backgroundColor: '#006080', flex: 0.48, marginTop: 15 }]} onPress={() => setModalJsonVisible(false)}>
                <Text style={styles.closeModalButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  pickerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  customPickerButton: { flex: 0.48, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#C5BBE3', borderRadius: 12, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  pickerButtonDisabled: { backgroundColor: '#F0F0F0', borderColor: '#E2E8F0', opacity: 0.6 },
  pickerButtonText: { fontSize: 13, color: '#888888', fontWeight: '600', flex: 1 },
  pickerSelectedText: { color: '#333333', fontWeight: '800' },
  sectionTitle: { color: '#006080', fontWeight: 'bold', fontSize: 15, marginBottom: 10, marginTop: 5 },
  resultsList: { marginBottom: 20 },
  resultItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#EEEEEE', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10, marginBottom: 10 },
  resultLabel: { fontSize: 14, color: '#333333', fontWeight: '500', flex: 1 },
  valueContainer: { backgroundColor: '#FFFFFF', borderRadius: 5, borderWidth: 1, borderColor: '#CCCCCC', width: 65, height: 38, justifyContent: 'center', alignItems: 'center' },
  resultInput: { width: '100%', height: '100%', textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
  indicacionContainer: { backgroundColor: '#E2E8F0', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#CBD5E1' },
  indicacionText: { color: '#475569', textAlign: 'center', marginTop: 8, fontSize: 13, fontWeight: '500' },
  continueButton: { backgroundColor: '#006080', paddingVertical: 18, borderRadius: 30, alignItems: 'center', marginBottom: 12, flexDirection: 'row', justifyContent: 'center' },
  continueButtonDisabled: { backgroundColor: '#94A3B8' },
  continueButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  jsonButton: { backgroundColor: '#FF8000', paddingVertical: 14, borderRadius: 30, alignItems: 'center', marginBottom: 25, flexDirection: 'row', justifyContent: 'center' },
  jsonButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  jsonConsoleContainer: { flex: 1, backgroundColor: '#1E1E1E', borderRadius: 10, padding: 12, marginBottom: 15 },
  jsonText: { fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', fontSize: 12, color: '#A9FF1C' },
  resultadosInsumosContainer: { marginTop: 10, padding: 15, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 35 },
  necesitasTitle: { fontSize: 16, fontWeight: 'bold', color: '#006080', marginBottom: 12, textAlign: 'center' },
  necesitasRow: { flexDirection: 'row', justifyContent: 'space-between' },
  necesitasCard: { flex: 0.31, backgroundColor: '#F1F5F9', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  necesitasValue: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50', marginBottom: 5 },
  necesitasLabel: { fontSize: 9, fontWeight: 'bold', color: '#64748B', textAlign: 'center' },
  bottomBarContainer: { width: '100%', backgroundColor: '#F9F9F9', alignItems: 'center', paddingVertical: 15, paddingBottom: 30, borderTopWidth: 1, borderColor: '#E2E8F0' },
  homeButtonCircle: { backgroundColor: '#FFFFFF', borderRadius: 25, borderWidth: 1, borderColor: '#E2E8F0', width: 130, height: 60, justifyContent: 'center', alignItems: 'center' },
  homeButtonText: { color: '#00AEEF', fontWeight: '800', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', width: '90%', borderRadius: 20, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#006080', marginBottom: 15, textAlign: 'center' },
  modalOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalOptionText: { fontSize: 16, color: '#333333', fontWeight: '600' },
  closeModalButton: { paddingVertical: 12, borderRadius: 15, alignItems: 'center' },
  closeModalButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  loaderContainer: { marginVertical: 30, alignItems: 'center' }
});