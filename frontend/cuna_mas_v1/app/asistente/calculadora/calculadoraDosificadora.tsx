import React, { useState, useEffect, useRef } from 'react'; 
import {
  StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView,
  useWindowDimensions, Modal, FlatList, TextInput, Keyboard, Platform,
  KeyboardAvoidingView, ActivityIndicator, StatusBar, Animated
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
import ModalMensaje from '../../components/ModalMensaje';
import { useModalMensaje } from '../../../hooks/useModalMensaje';

const OPCIONES_CORRELATIVO = [
  { label: 'Media Mañana', value: '1' },
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

const formatearTotalLegible = (valor: number, unidadOriginal?: string) => {
  const unidad = (unidadOriginal || '').trim().toLowerCase();

  if (unidad === 'g/ml') {
    const valorFormateado = Number(valor.toFixed(2)).toLocaleString('es-PE', {
      maximumFractionDigits: 2,
    });
    return `${valorFormateado} g/ml`;
  }

  if (unidad === 'g' || unidad === 'gramos') {
    const valorConvertido = valor >= 1000 ? valor / 1000 : valor;
    const unidadDestino = valor >= 1000 ? 'kg' : 'g';
    const valorFormateado = Number(valorConvertido.toFixed(2)).toLocaleString('es-PE', {
      maximumFractionDigits: 2,
    });
    return `${valorFormateado} ${unidadDestino}`;
  }

  if (unidad === 'ml' || unidad === 'mililitros' || unidad === 'l' || unidad === 'litros') {
    const valorConvertido = valor >= 1000 ? valor / 1000 : valor;
    const unidadDestino = valor >= 1000 ? 'L' : 'ml';
    const valorFormateado = Number(valorConvertido.toFixed(2)).toLocaleString('es-PE', {
      maximumFractionDigits: 2,
    });
    return `${valorFormateado} ${unidadDestino}`;
  }

  const valorConvertido = valor >= 1000 ? valor / 1000 : valor;
  const unidadDestino = valor >= 1000 ? 'kg' : 'g';
  const valorFormateado = Number(valorConvertido.toFixed(2)).toLocaleString('es-PE', {
    maximumFractionDigits: 2,
  });

  return `${valorFormateado} ${unidadDestino}`;
};

const obtenerCantidadEmpaque = (empaquesSugeridos: any, presentacion: '1 Kg/L' | '500 g/ml' | '250 g/ml') => {
  if (!empaquesSugeridos || typeof empaquesSugeridos !== 'object') return 0;

  const claveEsperada = `Opción en empaques de ${presentacion}`;
  const claveEncontrada = Object.keys(empaquesSugeridos).find(
    (clave) => clave.trim().toLowerCase() === claveEsperada.toLowerCase(),
  );

  const cantidad = claveEncontrada ? Number(empaquesSugeridos[claveEncontrada]) : 0;
  return Number.isFinite(cantidad) ? cantidad : 0;
};

export default function CalculadoraUnificada() { 
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const { user } = useAuth(); 
  const RUTA_ACTUAL = '/asistente/calculadora/calculadoraDosificadora';
  const { mostrarError, mostrarExito, mostrarConfirmacion, modalProps } = useModalMensaje();

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
    { id: '1', label: "Niños de 6 a 8 Meses", value: "0", color: "#B7C900" }, 
    { id: '2', label: "Niños de 9 a 11 Meses", value: "0", color: "#F57C00" }, 
    { id: '3', label: "Niños de 12 a 23 Meses", value: "0", color: "#009B16" }, 
    { id: '4', label: "Niños de 24 a 36 Meses", value: "0", color: "#2F75B5" }, 
    { id: '5', label: "Actores Comunales", value: "0", color: "#9C27B0" }, 
  ]);
  const [datosInsumos, setDatosInsumos] = useState<any>(null);
  const [jsonActualFormateado, setJsonActualFormateado] = useState<string>(
    JSON.stringify(ESTRUCTURA_VACIA, null, 2)
  );

  const [necesitaRecalcular, setNecesitaRecalcular] = useState(true);
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
        bolsas1kg: obtenerCantidadEmpaque(insumos?.empaquesSugeridos, '1 Kg/L'),
        bolsas500g: obtenerCantidadEmpaque(insumos?.empaquesSugeridos, '500 g/ml'),
        bolsas250g: obtenerCantidadEmpaque(insumos?.empaquesSugeridos, '250 g/ml'),
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

      listaAlimentos.push(nuevosInsumos);

      const objetoFinal = { alimentos: listaAlimentos };
      const listaSerializada = JSON.stringify(objetoFinal, null, 2);
      await AsyncStorage.setItem(STORAGE_KEY, listaSerializada);
      setJsonActualFormateado(listaSerializada);

    } catch (e) {
      console.error("Error al acumular alimento en el JSON:", e);
    }
  };

  const limpiarHistorialJSON = async () => {
    mostrarConfirmacion(
      '¿Borrar historial?',
      'Se eliminarán todos los alimentos acumulados. Esta acción no se puede deshacer.',
      async () => {
        try {
          await AsyncStorage.removeItem(STORAGE_KEY);
          setJsonActualFormateado(JSON.stringify(ESTRUCTURA_VACIA, null, 2));
          setDatosInsumos(null);
          mostrarExito('Éxito', 'El historial acumulado de alimentos ha sido borrado.');
        } catch (e) {
          console.error('Error al limpiar:', e);
          mostrarError('Error', 'No se pudo borrar el historial.');
        }
      },
      { textoConfirmar: 'BORRAR', variantePeligro: true },
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
    setNecesitaRecalcular(true);
  };

  const manejarCambioPreparacion = (item: any) => {
    setSelectedPreparacion(item);
    setModalPreparacionVisible(false);
    setDatosInsumos(null);
    setNecesitaRecalcular(true);
  };

  const manejarCambioSA = async (item: any) => {
    setSelectedSA(item);
    setSelectedCorrelativo(null); 
    const resetResultados = resultados.map(r => ({ ...r, value: "0" }));
    setResultados(resetResultados);
    setDatosInsumos(null);
    setModalSAVisible(false);
    setNecesitaRecalcular(true);
  };

  const manejarCambioCorrelativo = async (item: any) => {
    setSelectedCorrelativo(item);
    setModalCorrelativoVisible(false);
    setDatosInsumos(null);
    setNecesitaRecalcular(true);
  };

  const manejarCambioFecha = (event: any, d?: Date) => {
    setMostrarDatePicker(false);
    if (d) {
      setFecha(d);
      setDatosInsumos(null);
      setNecesitaRecalcular(true);
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
    setNecesitaRecalcular(true);
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
        setNecesitaRecalcular(false);
        await acumularYGuardarAlimento(data);
        
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
      mostrarError('Error', 'Ocurrió un problema al procesar.'); 
    } finally { 
      setLoadingCalcular(false); 
    }
  };

  const manejarEnviarAIA = async () => {
    try {
      const guardado = await AsyncStorage.getItem(STORAGE_KEY);
      const payload = guardado ? JSON.parse(guardado) : ESTRUCTURA_VACIA;

      if (!payload.alimentos || payload.alimentos.length === 0) {
        mostrarError('Sin datos', 'Primero calcula al menos un alimento antes de enviar a la IA.');
        return;
      }

      setLoadingIA(true);
      const respuestaIA = await analizarAlimentosService(payload);
      await vaciarHistorialSilencioso();

      router.push({
        pathname: '/asistente/resumenIA',
        params: { data: JSON.stringify(respuestaIA) },
      });

    } catch (err) {
      console.error('Error al analizar con IA:', err);
      mostrarError('Error', 'No se pudo procesar el análisis con la IA. Inténtalo nuevamente.');
    } finally {
      setLoadingIA(false);
    }
  };

  const listoParaCalcular = selectedSA && selectedCorrelativo && selectedPreparacion;
  const botonCalcularDeshabilitado = !listoParaCalcular || loadingCalcular || !necesitaRecalcular;

  return ( 
    <SafeAreaView style={[styles.container, Platform.OS === 'android' && { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#C5D800" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flexible}>
        
        <HeaderCocina
          user={user}
          titulo=""
          modo=""
          onPress={() => router.replace('/asistente')}
        />

        <View style={styles.titleBar}>
          <Text style={styles.headerTitle} allowFontScaling={false}>Calculadora Unificada</Text>
        </View>

        <View style={styles.scrollWrapper}>
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={[
              styles.scrollContent, 
              { paddingBottom: 110 + insets.bottom },
              esPantallaGrande && styles.scrollContentGrande
            ]} 
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="handled"
          > 
            
            <Text style={styles.sectionTitle}>1. Configuración de Alimento:</Text>
            <View style={styles.pickerRow}> 
              <TouchableOpacity style={styles.customPickerButton} onPress={() => setModalCategoriaVisible(true)}>
                <Text style={[styles.pickerButtonText, selectedCategoria && styles.pickerSelectedText]} allowFontScaling={false} maxFontSizeMultiplier={1} numberOfLines={1}>
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
                    <Text style={[styles.pickerButtonText, selectedPreparacion && styles.pickerSelectedText]} allowFontScaling={false} maxFontSizeMultiplier={1} numberOfLines={1}>
                      {selectedPreparacion ? selectedPreparacion.nombrePreparacion : "Preparación"}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color={selectedCategoria ? "#006080" : "#B0B0B0"} />
                  </>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>2. Detalles de Control:</Text>
            <TouchableOpacity style={[styles.customPickerButton, { marginBottom: 15, flex: 1, width: '100%' }]} onPress={() => setMostrarDatePicker(true)}>
              <Text style={styles.pickerSelectedText} allowFontScaling={false}>Fecha: {fecha.toLocaleDateString()}</Text>
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
                <Text style={[styles.pickerButtonText, selectedSA && styles.pickerSelectedText]} allowFontScaling={false} maxFontSizeMultiplier={1} numberOfLines={1}>
                  {selectedSA ? selectedSA.label : "Seleccione S.A."}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#006080" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.customPickerButton, !selectedSA && styles.pickerButtonDisabled]} disabled={!selectedSA} onPress={() => setModalCorrelativoVisible(true)}>
                <Text style={[styles.pickerButtonText, selectedCorrelativo && styles.pickerSelectedText]} allowFontScaling={false} maxFontSizeMultiplier={1} numberOfLines={1}>
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
                  <ResultItem key={item.id} {...item} onChangeText={(t: string) => manejarCambioValor(item.id, t)} />
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
                {datosInsumos.alimento && (
                  <Text style={styles.alimentoNombre}>{datosInsumos.alimento}</Text>
                )}

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
                    <Text style={styles.necesitasValue}>{obtenerCantidadEmpaque(datosInsumos.empaquesSugeridos, '1 Kg/L')}</Text>
                    <Text style={styles.necesitasLabel}>EMPAQUES{"\n"}1 KG</Text>
                  </View>

                  <View style={styles.orDivider}>
                    <View style={styles.orCircle}><Text style={styles.orText}>O</Text></View>
                  </View>

                  <View style={styles.necesitasCard}>
                    <Text style={styles.necesitasValue}>{obtenerCantidadEmpaque(datosInsumos.empaquesSugeridos, '500 g/ml')}</Text>
                    <Text style={styles.necesitasLabel}>EMPAQUES{"\n"}500 G/ML</Text>
                  </View>

                  <View style={styles.orDivider}>
                    <View style={styles.orCircle}><Text style={styles.orText}>O</Text></View>
                  </View>

                  <View style={styles.necesitasCard}>
                    <Text style={styles.necesitasValue}>{obtenerCantidadEmpaque(datosInsumos.empaquesSugeridos, '250 g/ml')}</Text>
                    <Text style={styles.necesitasLabel}>EMPAQUES{"\n"}250 G/ML</Text>
                  </View>
                </View>
              </Animated.View>
            )}
          </ScrollView> 
        </View>

        <BottomNavCocina rutaActual={RUTA_ACTUAL} insetsBottom={insets.bottom} />
            
      </KeyboardAvoidingView>
        <ModalMensaje {...modalProps} />

      {/* --- MODALES --- */}
      <Modal visible={modalCategoriaVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccione Categoría</Text>
            <FlatList data={listaCategorias} keyExtractor={(i) => String(i.idCategoriaAlimento)} renderItem={({item}) => <TouchableOpacity style={styles.modalOption} onPress={() => manejarCambioCategoria(item)}><Text style={styles.modalOptionText}>{item.nombreCategoriaAlimento}</Text></TouchableOpacity>} />
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalCategoriaVisible(false)}><Text style={styles.closeModalButtonText}>Cancelar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalPreparacionVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccione Preparación</Text>
            <FlatList data={listaPreparaciones} keyExtractor={(i) => String(i.idTipoPreparacion)} renderItem={({item}) => <TouchableOpacity style={styles.modalOption} onPress={() => manejarCambioPreparacion(item)}><Text style={styles.modalOptionText}>{item.nombrePreparacion}</Text></TouchableOpacity>} />
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalPreparacionVisible(false)}><Text style={styles.closeModalButtonText}>Cancelar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalSAVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccione Centro</Text>
            {cargandoCentros ? (
              <ActivityIndicator size="large" color="#006080" style={{ marginVertical: 20 }} />
            ) : (
              <FlatList data={listaCentros} keyExtractor={(i) => String(i.value)} renderItem={({item}) => <TouchableOpacity style={styles.modalOption} onPress={() => manejarCambioSA(item)}><Text style={styles.modalOptionText}>{item.label}</Text></TouchableOpacity>} />
            )}
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalSAVisible(false)}><Text style={styles.closeModalButtonText}>Cancelar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={modalCorrelativoVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccione Correlativo</Text>
            <FlatList data={OPCIONES_CORRELATIVO} keyExtractor={(i) => i.value} renderItem={({item}) => <TouchableOpacity style={styles.modalOption} onPress={() => manejarCambioCorrelativo(item)}><Text style={styles.modalOptionText}>{item.label}</Text></TouchableOpacity>} />
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalCorrelativoVisible(false)}><Text style={styles.closeModalButtonText}>Cancelar</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    <View style={[styles.valueContainer, { backgroundColor: color }]}> 
      <TextInput
        style={[styles.resultInput, { color: '#FFFFFF' }]}
        value={value === "0" ? "" : value} 
        placeholder="0"
        placeholderTextColor="#CCCCCC"
        allowFontScaling={false}
        maxFontSizeMultiplier={1}
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

  titleBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 25,
  },
  headerTitle: { fontSize: 24, color: '#006080', fontWeight: '900' },

  scrollWrapper: { flex: 1 },
  scrollContent: { padding: 20 },
  scrollContentGrande: { maxWidth: 600, width: '100%', alignSelf: 'center' },
  pickerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  customPickerButton: { flex: 0.48, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#C5BBE3', borderRadius: 12, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12 },
  pickerButtonDisabled: { backgroundColor: '#F0F0F0', borderColor: '#E2E8F0', opacity: 0.6 },
  pickerButtonText: { fontSize: 16, lineHeight: 20, color: '#888888', fontWeight: '600', flex: 1 },
  pickerSelectedText: { color: '#333333', fontWeight: '800' },
  sectionTitle: { color: '#006080', fontWeight: 'bold', fontSize: 15, marginBottom: 10, marginTop: 5 },
  resultsList: { marginBottom: 20 },
  resultItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#EEEEEE', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10, marginBottom: 10 },
  resultLabel: { fontSize: 14, color: '#333333', fontWeight: '500', flex: 1 },
  valueContainer: { width: 70, height: 40, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#DDD', justifyContent: 'center', alignItems: 'center' },
  resultInput: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', width: '100%', padding: 0 },

  indicacionContainer: { padding: 20, backgroundColor: '#EBF8FF', borderRadius: 12, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#BEE3F8' },
  indicacionText: { color: '#2B6CB0', textAlign: 'center', marginTop: 8, fontSize: 13, fontWeight: '500' },
  loaderContainer: { padding: 30, alignItems: 'center' },

  continueButton: { backgroundColor: '#006080', borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  continueButtonDisabled: { backgroundColor: '#A0AEC0', opacity: 0.7 },
  continueButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  recalculoHint: { textAlign: 'center', color: '#718096', fontSize: 12, marginTop: 8 },

  iaButton: { backgroundColor: '#7F77DD', borderRadius: 12, height: 50, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  jsonButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },

  resultadosInsumosContainer: { marginTop: 25, padding: 18, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  alimentoNombre: { fontSize: 18, fontWeight: 'bold', color: '#006080', textAlign: 'center', marginBottom: 4 },
  totalGramosText: { fontSize: 15, fontWeight: '600', color: '#4A5568', textAlign: 'center', marginBottom: 15 },
  necesitasTitle: { fontSize: 13, fontWeight: 'bold', color: '#2D3748', textAlign: 'center' },
  necesitasSubtitle: { fontSize: 11, color: '#718096', textAlign: 'center', marginBottom: 15 },
  necesitasRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  necesitasCard: { flex: 1, backgroundColor: '#F7FAFC', paddingVertical: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: '#EDF2F7' },
  necesitasValue: { fontSize: 20, fontWeight: '900', color: '#2B6CB0' },
  necesitasLabel: { fontSize: 10, fontWeight: 'bold', color: '#4A5568', textAlign: 'center', marginTop: 4 },
  orDivider: { paddingHorizontal: 4 },
  orCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  orText: { fontSize: 10, fontWeight: 'bold', color: '#718096' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '90%', maxHeight: '70%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#006080', marginBottom: 15, textAlign: 'center' },
  modalOption: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EDF2F7' },
  modalOptionText: { fontSize: 15, color: '#2D3748', textAlign: 'center', fontWeight: '500' },
  closeModalButton: { marginTop: 15, backgroundColor: '#EDF2F7', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  closeModalButtonText: { color: '#4A5568', fontWeight: 'bold' },

  jsonConsoleContainer: { backgroundColor: '#1A202C', padding: 12, borderRadius: 8, marginTop: 10 },
  jsonText: { color: '#68D391', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontSize: 12 },

  overlayContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  overlayCard: { backgroundColor: '#FFFFFF', padding: 25, borderRadius: 16, alignItems: 'center', width: '80%' },
  overlayTitle: { fontSize: 16, fontWeight: 'bold', color: '#2D3748', marginTop: 15, textAlign: 'center' },
  overlaySubtitle: { fontSize: 12, color: '#718096', textAlign: 'center', marginTop: 5 }
});