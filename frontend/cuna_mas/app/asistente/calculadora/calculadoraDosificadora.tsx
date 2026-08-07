import React, { useState, useEffect, useRef } from 'react'; 
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView,
  useWindowDimensions, Modal, FlatList, TextInput, Keyboard, Platform,
  KeyboardAvoidingView, ActivityIndicator, Alert, StatusBar, Animated
} from 'react-native'; 
import { Ionicons } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router'; 
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import { CalculadoraService } from '../../../service/calculadoraService'; 
import { CentroAlimentarioService } from '../../../service/servicioAlimentario'; 
import { useAuth } from '../../../context/AuthContext';
import { analizarAlimentosService } from '../../../service/iaService';
import HeaderCocina from '../../components/sociaCocina/HeaderCocina';
import BottomNavCocina from '../../components/sociaCocina/BottomNavCocina';

const OPCIONES_CORRELATIVO = [
  { label: 'Media Mañana ', value: '1' },
  { label: 'Media Tarde', value: '2' },
];

const STORAGE_KEY = '@CalculadoraUnificada:lista_alimentos'; 

const MAPA_CATEGORIA_ETARIA: Record<string, string> = {
  '1': 'ninos6a9Meses',
  '2': 'ninos10a12Meses',
  '3': 'ninos13a23Meses',
  '4': 'ninos24a36Meses',
  '5': 'actoresComunales',
};

const ESTRUCTURA_VACIA = { alimentos: [] as any[] };

// Convierte el total en gramos/ml crudo a una unidad más legible (kg o L),
// redondeando a máximo 2 decimales y sin decimales innecesarios (ej. 15.0 -> 15).
const formatearTotalLegible = (valor: number, unidadOriginal?: string) => {
  const unidadDestino = unidadOriginal === 'g/ml' 
    ? (valor >= 1000 ? 'kg' : 'g') 
    : (valor >= 1000 ? 'L' : 'ml');

  const valorConvertido = valor >= 1000 ? valor / 1000 : valor;

  // Quita decimales sobrantes: 15.00 -> "15", 14.8 -> "14.8"
  const valorFormateado = Number(valorConvertido.toFixed(2))
    .toLocaleString('es-PE', { maximumFractionDigits: 2 });

  return `${valorFormateado} ${unidadDestino}`;
};

export default function CalculadoraUnificada() { 
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const { user } = useAuth(); 
  const RUTA_ACTUAL = '/asistente/calculadora/calculadoraDosificadora';

  const scrollViewRef = useRef<ScrollView>(null);

  const [listaCategorias, setListaCategorias] = useState<any[]>([]);
  const [listaPreparaciones, setListaPreparaciones] = useState<any[]>([]);
  const [listaCentros, setListaCentros] = useState<any[]>([]);

  const [selectedCategoria, setSelectedCategoria] = useState<any>(null);
  const [selectedPreparacion, setSelectedPreparacion] = useState<any>(null);
  const [selectedSA, setSelectedSA] = useState<any>(null); 
  const [selectedCorrelativo, setSelectedCorrelativo] = useState<any>(null); 
  const [fecha, setFecha] = useState(new Date());

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
  const [loadingIA, setLoadingIA] = useState(false);

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

  // 🚦 Evita recalcular en el servidor con los mismos valores: se habilita
  // solo cuando algo relevante cambia (categoría, preparación, S.A.,
  // correlativo, fecha o cualquier cantidad ingresada).
  const [necesitaRecalcular, setNecesitaRecalcular] = useState(true);

  // 🎬 Animación de aparición del bloque "NECESITAS"
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const formatearFechaParaAPI = (date: Date) => {
    const año = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0'); 
    const dia = String(date.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };

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

  const acumularYGuardarAlimento = async (nuevosInsumos: any) => {
    try {
      const stringExistente = await AsyncStorage.getItem(STORAGE_KEY);
      let listaAlimentos: any[] = [];

      if (stringExistente) {
        try {
          const parsed = JSON.parse(stringExistente);
          listaAlimentos = Array.isArray(parsed) ? parsed : (parsed.alimentos || []);
        } catch {
          listaAlimentos = [];
        }
      }

      const nuevoRegistro = crearEstructuraAlimento(nuevosInsumos);
      listaAlimentos.push(nuevoRegistro);

      const objetoFinal = { alimentos: listaAlimentos };
      const listaSerializada = JSON.stringify(objetoFinal, null, 2);
      await AsyncStorage.setItem(STORAGE_KEY, listaSerializada);
      setJsonActualFormateado(listaSerializada);

      imprimirJsonConsola(objetoFinal);

    } catch (e) {
      console.error("Error al acumular alimento en el JSON:", e);
    }
  };

  const limpiarHistorialJSON = async () => {
    Alert.alert(
      "¿Borrar historial?",
      "Se eliminarán todos los alimentos acumulados. Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(STORAGE_KEY);
              setJsonActualFormateado(JSON.stringify(ESTRUCTURA_VACIA, null, 2));
              setDatosInsumos(null);
              Alert.alert("Éxito", "El historial acumulado de alimentos ha sido borrado.");
            } catch (e) {
              console.error("Error al limpiar:", e);
              Alert.alert("Error", "No se pudo borrar el historial.");
            }
          }
        }
      ]
    );
  };

  const vaciarHistorialSilencioso = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setJsonActualFormateado(JSON.stringify(ESTRUCTURA_VACIA, null, 2));
      setDatosInsumos(null);
    } catch (e) {
      console.error("Error al vaciar historial silenciosamente:", e);
    }
  };

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
    setNecesitaRecalcular(true); // 🚦 cambió la categoría
  };

  const manejarCambioPreparacion = (item: any) => {
    setSelectedPreparacion(item);
    setModalPreparacionVisible(false);
    setDatosInsumos(null);
    setNecesitaRecalcular(true); // 🚦 cambió la preparación
  };

  const manejarCambioSA = async (item: any) => {
    setSelectedSA(item);
    setSelectedCorrelativo(null); 
    const resetResultados = resultados.map(r => ({ ...r, value: "0" }));
    setResultados(resetResultados);
    setDatosInsumos(null);
    setModalSAVisible(false);
    setNecesitaRecalcular(true); // 🚦 cambió el S.A.
  };

  const manejarCambioCorrelativo = async (item: any) => {
    setSelectedCorrelativo(item);
    setModalCorrelativoVisible(false);
    setDatosInsumos(null);
    setNecesitaRecalcular(true); // 🚦 cambió el correlativo
  };

  const manejarCambioFecha = (event: any, d?: Date) => {
    setMostrarDatePicker(false);
    if (d) {
      setFecha(d);
      setDatosInsumos(null);
      setNecesitaRecalcular(true); // 🚦 cambió la fecha
    }
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
    setNecesitaRecalcular(true); // 🚦 el usuario tocó una cantidad manualmente
  };

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
        setNecesitaRecalcular(false); // 🚦 ya calculamos con estos valores, bloqueamos el botón
        await acumularYGuardarAlimento(data);
        
        // 🎬 Animación de aparición del resultado
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }).start();

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

  const manejarEnviarAIA = async () => {
    try {
      const guardado = await AsyncStorage.getItem(STORAGE_KEY);
      const payload = guardado ? JSON.parse(guardado) : ESTRUCTURA_VACIA;

      if (!payload.alimentos || payload.alimentos.length === 0) {
        Alert.alert('Sin datos', 'Primero calcula al menos un alimento antes de enviar a la IA.');
        return;
      }

      setLoadingIA(true);

      console.log("Enviando a IA:", JSON.stringify(payload, null, 2));
      const respuestaIA = await analizarAlimentosService(payload);
      console.log("Respuesta de IA:", respuestaIA);

      await vaciarHistorialSilencioso();

      router.push({
        pathname: '/asistente/resumenIA',
        params: { data: JSON.stringify(respuestaIA) },
      });

    } catch (err) {
      console.error('Error al analizar con IA:', err);
      Alert.alert('Error', 'No se pudo procesar el análisis con la IA. Inténtalo nuevamente.');
    } finally {
      setLoadingIA(false);
    }
  };

  const manejarVolver = async () => {
    await vaciarHistorialSilencioso();
    router.back();
  };

  const manejarIrAInicio = async () => {
    await vaciarHistorialSilencioso();
    router.replace('/');
  };

  const listoParaCalcular = selectedSA && selectedCorrelativo && selectedPreparacion;
  const botonCalcularDeshabilitado = !listoParaCalcular || loadingCalcular || !necesitaRecalcular;

  return ( 
    <SafeAreaView style={styles.container}> 
      <StatusBar barStyle="light-content" backgroundColor="#C5D800" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flexible}>
        
        {/* HEADER (componente compartido del rol Socia de Cocina, con botón VOLVER) */}
        <HeaderCocina
          user={user}
          titulo=""
          modo="volver"
          onPress={() => {
            router.back();
          }}
        />

        {/* Barra de título blanca */}
        <View style={styles.titleBar}>
          <Text style={styles.headerTitle}>Calculadora Unificada</Text>
        </View>

        <View style={styles.scrollWrapper}>
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={[styles.scrollContent, esPantallaGrande && styles.scrollContentGrande]} 
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="handled"
          > 
            
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
                onChange={manejarCambioFecha} 
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

            <TouchableOpacity 
              style={[styles.continueButton, botonCalcularDeshabilitado && styles.continueButtonDisabled]} 
              onPress={manejarCalcular} 
              disabled={botonCalcularDeshabilitado}
            >
              {loadingCalcular ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.continueButtonText}>
                  {datosInsumos && !necesitaRecalcular ? "CALCULADO ✓" : "CALCULAR"}
                </Text>
              )}
            </TouchableOpacity> 
            {datosInsumos && !necesitaRecalcular && (
              <Text style={styles.recalculoHint}>
                Modifica una cantidad, la fecha, el S.A. o el correlativo para volver a calcular.
              </Text>
            )}

            <TouchableOpacity 
              style={[styles.iaButton, loadingIA && styles.continueButtonDisabled]} 
              onPress={manejarEnviarAIA}
              disabled={loadingIA}
              activeOpacity={0.8}
            >
              {loadingIA ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.jsonButtonText}>ANALIZAR CON IA</Text>
                </>
              )}
            </TouchableOpacity>

            {datosInsumos && (
              <Animated.View style={[styles.resultadosInsumosContainer, { opacity: fadeAnim }]}>

                {/* Nombre del alimento calculado */}
                {datosInsumos.alimento && (
                  <Text style={styles.alimentoNombre}>{datosInsumos.alimento}</Text>
                )}

                {/* Total, convertido a kg o L para que sea más legible que gramos/ml crudos */}
                {typeof datosInsumos.totalGramosO_Ml === 'number' && (
                  <Text style={styles.totalGramosText}>
                    Total: {formatearTotalLegible(datosInsumos.totalGramosO_Ml, datosInsumos.unidad)}
                  </Text>
                )}

                <Text style={styles.necesitasTitle}>NECESITAS UNA DE ESTAS PRESENTACIONES:</Text> 
                <Text style={styles.necesitasSubtitle}>
                  Elige solo una opción de empaque, no se suman entre sí.
                </Text>

                <View style={styles.necesitasRow}> 
                  <View style={styles.necesitasCard}>
                    <Text style={styles.necesitasValue}>{datosInsumos.empaquesSugeridos?.["Opción en empaques de 1 Kg/L"] || 0}</Text>
                    <Text style={styles.necesitasLabel}>BOLSAS{"\n"}1 KG</Text>
                  </View>

                  <View style={styles.orDivider}>
                    <View style={styles.orCircle}><Text style={styles.orText}>O</Text></View>
                  </View>

                  <View style={styles.necesitasCard}>
                    <Text style={styles.necesitasValue}>{datosInsumos.empaquesSugeridos?.["Opción en empaques de 500 g/ml"] || 0}</Text>
                    <Text style={styles.necesitasLabel}>BOLSAS{"\n"}1/2 KG</Text>
                  </View>

                  <View style={styles.orDivider}>
                    <View style={styles.orCircle}><Text style={styles.orText}>O</Text></View>
                  </View>

                  <View style={styles.necesitasCard}>
                    <Text style={styles.necesitasValue}>{datosInsumos.empaquesSugeridos?.["Opción en empaques de 250 g/ml"] || 0}</Text>
                    <Text style={styles.necesitasLabel}>BOLSAS{"\n"}250 G</Text>
                  </View>
                </View>
              </Animated.View>
            )}
          </ScrollView> 
        </View>

                <BottomNavCocina rutaActual={RUTA_ACTUAL} insetsBottom={insets.bottom} />
            
      </KeyboardAvoidingView>

      {/* --- MODALES --- */}
      <Modal visible={modalCategoriaVisible} transparent animationType="fade"><View style={styles.modalOverlay}><View style={styles.modalContent}><Text style={styles.modalTitle}>Seleccione Categoría</Text><FlatList data={listaCategorias} keyExtractor={(i) => String(i.idCategoriaAlimento)} renderItem={({item}) => <TouchableOpacity style={styles.modalOption} onPress={() => manejarCambioCategoria(item)}><Text style={styles.modalOptionText}>{item.nombreCategoriaAlimento}</Text></TouchableOpacity>} /><TouchableOpacity style={styles.closeModalButton} onPress={() => setModalCategoriaVisible(false)}><Text style={styles.closeModalButtonText}>Cancelar</Text></TouchableOpacity></View></View></Modal>
      <Modal visible={modalPreparacionVisible} transparent animationType="fade"><View style={styles.modalOverlay}><View style={styles.modalContent}><Text style={styles.modalTitle}>Seleccione Preparación</Text><FlatList data={listaPreparaciones} keyExtractor={(i) => String(i.idTipoPreparacion)} renderItem={({item}) => <TouchableOpacity style={styles.modalOption} onPress={() => manejarCambioPreparacion(item)}><Text style={styles.modalOptionText}>{item.nombrePreparacion}</Text></TouchableOpacity>} /><TouchableOpacity style={styles.closeModalButton} onPress={() => setModalPreparacionVisible(false)}><Text style={styles.closeModalButtonText}>Cancelar</Text></TouchableOpacity></View></View></Modal>
      <Modal visible={modalSAVisible} transparent animationType="fade"><View style={styles.modalOverlay}><View style={styles.modalContent}><Text style={styles.modalTitle}>Seleccione Centro</Text><FlatList data={listaCentros} keyExtractor={(i) => String(i.value)} renderItem={({item}) => <TouchableOpacity style={styles.modalOption} onPress={() => manejarCambioSA(item)}><Text style={styles.modalOptionText}>{item.label}</Text></TouchableOpacity>} /><TouchableOpacity style={styles.closeModalButton} onPress={() => setModalSAVisible(false)}><Text style={styles.closeModalButtonText}>Cancelar</Text></TouchableOpacity></View></View></Modal>
      <Modal visible={modalCorrelativoVisible} transparent animationType="fade"><View style={styles.modalOverlay}><View style={styles.modalContent}><Text style={styles.modalTitle}>Seleccione Correlativo</Text><FlatList data={OPCIONES_CORRELATIVO} keyExtractor={(i) => i.value} renderItem={({item}) => <TouchableOpacity style={styles.modalOption} onPress={() => manejarCambioCorrelativo(item)}><Text style={styles.modalOptionText}>{item.label}</Text></TouchableOpacity>} /><TouchableOpacity style={styles.closeModalButton} onPress={() => setModalCorrelativoVisible(false)}><Text style={styles.closeModalButtonText}>Cancelar</Text></TouchableOpacity></View></View></Modal>
      
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

      <Modal visible={loadingIA} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.overlayContainer}>
          <View style={styles.overlayCard}>
            <ActivityIndicator size="large" color="#7F77DD" />
            <Text style={styles.overlayTitle}>Generando análisis con IA...</Text>
            <Text style={styles.overlaySubtitle}>Esto puede tardar unos segundos, por favor espera.</Text>
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

  header: { 
    backgroundColor: '#C5D800', 
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  welcomeText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  userName: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  backButton: { backgroundColor: '#FF0080', flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
  backButtonText: { color: '#FFFFFF', fontWeight: 'bold', marginLeft: 5, fontSize: 12 },

  titleBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 25,
  },
  headerTitle: { fontSize: 24, color: '#006080', fontWeight: '900' },

  scrollWrapper: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  scrollContentGrande: { maxWidth: 600, width: '100%', alignSelf: 'center' },
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
  continueButton: { backgroundColor: '#006080', paddingVertical: 18, borderRadius: 30, alignItems: 'center', marginBottom: 8, flexDirection: 'row', justifyContent: 'center' },
  continueButtonDisabled: { backgroundColor: '#94A3B8' },
  continueButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  recalculoHint: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  jsonButton: { backgroundColor: '#FF8000', paddingVertical: 14, borderRadius: 30, alignItems: 'center', marginBottom: 25, flexDirection: 'row', justifyContent: 'center' },
  iaButton: { backgroundColor: '#7F77DD', paddingVertical: 14, borderRadius: 30, alignItems: 'center', marginBottom: 25, flexDirection: 'row', justifyContent: 'center' },
  jsonButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  jsonConsoleContainer: { flex: 1, backgroundColor: '#1E1E1E', borderRadius: 10, padding: 12, marginBottom: 15 },
  jsonText: { fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace', fontSize: 12, color: '#A9FF1C' },
  resultadosInsumosContainer: { marginTop: 10, padding: 15, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 35 },
  alimentoNombre: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  totalGramosText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },
  necesitasTitle: { fontSize: 16, fontWeight: 'bold', color: '#006080', marginBottom: 4, textAlign: 'center' },
  necesitasSubtitle: { fontSize: 12, color: '#64748B', fontWeight: '600', textAlign: 'center', marginBottom: 16 },
  necesitasRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  necesitasCard: { flex: 1, backgroundColor: '#F1F5F9', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  necesitasValue: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50', marginBottom: 5 },
  necesitasLabel: { fontSize: 9, fontWeight: 'bold', color: '#64748B', textAlign: 'center' },
  orDivider: { width: 26, alignItems: 'center', justifyContent: 'center' },
  orCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#006080',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900' },

  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    width: '100%',
  },
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navLabel: { fontSize: 11, marginTop: 4, color: '#757575' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', width: '90%', borderRadius: 20, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#006080', marginBottom: 15, textAlign: 'center' },
  modalOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  modalOptionText: { fontSize: 16, color: '#333333', fontWeight: '600' },
  closeModalButton: { paddingVertical: 12, borderRadius: 15, alignItems: 'center' },
  closeModalButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  loaderContainer: { marginVertical: 30, alignItems: 'center' },
  overlayContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 35,
    alignItems: 'center',
    width: '80%',
    maxWidth: 320,
  },
  overlayTitle: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 15,
    textAlign: 'center',
  },
  overlaySubtitle: {
    color: '#888888',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
  },
});