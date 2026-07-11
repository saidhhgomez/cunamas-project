import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  useWindowDimensions 
} from 'react-native';
import { ArrowLeft, Plus, ChevronDown } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

// Importación de tus servicios
import { CategoriaService } from '../../service/categoriaService';
import { AsistenciaService } from '../../service/asistenciaService';

const COLORES_INDICADORES = ['#C5D800', '#FF7A00', '#00D12E', '#00AEEF'];

const OPCIONES_TURNO = [
  { id: 1, nombre: 'Media Mañana' },
  { id: 2, nombre: 'Media Tarde' }
];

export default function AsistenciaStatsScreen() {
  const router = useRouter();
  const { user } = useAuth(); 
  const { width } = useWindowDimensions();
  
  const params = useLocalSearchParams();
  const idModuloReal = params.idModulo ? Number(params.idModulo) : 1; 
  const nombreModuloReal = params.nombreModulo ? String(params.nombreModulo) : "MÓDULO CIAI";

  const esPantallaGrande = width > 600;

  const [categorias, setCategorias] = useState<any[]>([]);
  const [valoresAsistencia, setValoresAsistencia] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [turnoSeleccionado, setTurnoSeleccionado] = useState(OPCIONES_TURNO[0]);
  const [mostrarDropdown, setMostrarDropdown] = useState(false);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const datosCategorias = await CategoriaService.getListaCategorias();
        setCategorias(datosCategorias);

        const mapaInicial: { [key: number]: string } = {};
        datosCategorias.forEach((cat: any) => {
          mapaInicial[cat.idCategoriaGrupo] = "0";
        });
        setValoresAsistencia(mapaInicial);
      } catch (error) {
        console.error("Error al cargar categorías de asistencia:", error);
        Alert.alert("Error", "No se pudo sincronizar el catálogo de rangos de edad.");
      } finally {
        setLoading(false);
      }
    };

    cargarCategorias();
  }, [idModuloReal]);

  // 👈 NUEVA FUNCIÓN: Ahora usa router.back() con un fallback seguro
  const manejarRetornoSeguro = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      // Si por alguna razón se limpia el historial, te saca al inicio del flujo cuidadora
      router.replace('/cuidadora/control_lista'); 
    }
  };

  const manejarCambioCantidad = (idCategoriaGrupo: number, texto: string) => {
    const textoLimpio = texto.replace(/[^0-9]/g, '');
    setValoresAsistencia(prev => ({
      ...prev,
      [idCategoriaGrupo]: textoLimpio === '' ? '0' : textoLimpio
    }));
  };

  const manejarGuardarAsistencia = async () => {
    setEnviando(true); 
    try {
      const categoriasPayload = categorias.map((cat) => ({
        idCategoriaGrupo: cat.idCategoriaGrupo,
        cantidad: Number(valoresAsistencia[cat.idCategoriaGrupo] || 0)
      }));

      const payload = {
        idModulo: idModuloReal,
        idUsuarioCreacion: user?.idPersona || 1, 
        registroCorrelativo: turnoSeleccionado.id, 
        categorias: categoriasPayload
      };

      await AsistenciaService.registrarAsistenciaCiai(payload);
      
      Alert.alert("¡Éxito!", "Asistencia de raciones agregada correctamente.", [
        { text: "OK", onPress: manejarRetornoSeguro }
      ]);
    } catch (error) {
      console.error("Error al registrar asistencia:", error);
      Alert.alert("Error", "Hubo un problema al guardar el registro en el servidor.");
    } finally {
      setEnviando(false); 
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer} accessible={false}>
        <ActivityIndicator size="large" color="#00AEEF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header Superior */}
      <View style={[styles.header, { height: esPantallaGrande ? 140 : 115 }]}>
        <TouchableOpacity 
          style={[styles.backButton, { width: esPantallaGrande ? 150 : 125, height: esPantallaGrande ? 46 : 40 }]}
          onPress={manejarRetornoSeguro}
          activeOpacity={0.85}
        >
          <View style={styles.backContent}>
            <ArrowLeft color="#FFF" size={esPantallaGrande ? 22 : 18} strokeWidth={3} />
            <Text style={[styles.backText, { fontSize: esPantallaGrande ? 15 : 13 }]}>VOLVER</Text>
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categorias}
        keyExtractor={(item) => item.idCategoriaGrupo.toString()}
        contentContainerStyle={[styles.scrollContent, esPantallaGrande && styles.tabletContent]}
        showsVerticalScrollIndicator={false}
        
        ListHeaderComponent={
          <View style={styles.headerComponentContainer}>
            <Text style={[styles.title, { fontSize: esPantallaGrande ? 34 : 28 }]}>
              {nombreModuloReal.toUpperCase()}
            </Text>

            {/* Selector de Turno */}
            <View style={styles.comboWrapper}>
              <TouchableOpacity 
                style={styles.comboSelector} 
                activeOpacity={0.9}
                onPress={() => setMostrarDropdown(true)}
              >
                <Text style={styles.comboSelectorText}>{turnoSeleccionado.nombre}</Text>
                <ChevronDown color="#64748B" size={20} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </View>
        }
        
        renderItem={({ item, index }) => {
          const colorNumero = COLORES_INDICADORES[index % COLORES_INDICADORES.length];
          
          const nombreLimpio = item.nombreCategoria?.toLowerCase().trim();
          const esActorComunal = nombreLimpio === 'actor comunal';

          return (
            <View style={styles.cardItem}>
              <Text style={[styles.statLabel, { fontSize: esPantallaGrande ? 16 : 15 }]}>
                {esActorComunal ? item.nombreCategoria : `Niños de ${item.nombreCategoria}`}
              </Text>
              
              <View style={[styles.inputContainer, { borderColor: colorNumero }]}>
                <TextInput
                  style={[styles.statInput, { color: colorNumero, fontSize: esPantallaGrande ? 24 : 20 }]}
                  keyboardType="numeric"
                  value={valoresAsistencia[item.idCategoriaGrupo]}
                  onChangeText={(texto) => manejarCambioCantidad(item.idCategoriaGrupo, texto)}
                  selectTextOnFocus
                  editable={!enviando}
                />
              </View>
            </View>
          );
        }}

        ListFooterComponent={
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={manejarGuardarAsistencia}
            activeOpacity={0.85}
          >
            <View style={styles.submitContent}>
              <Plus color="#FFF" size={20} strokeWidth={3} />
              <Text style={styles.submitText}>AGREGAR</Text>
            </View>
          </TouchableOpacity>
        }
      />

      {/* MODAL DEL COMBOBOX */}
      <Modal
        visible={mostrarDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMostrarDropdown(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMostrarDropdown(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalDropdownMenu, esPantallaGrande && { maxWidth: 460 }]}>
              <Text style={styles.modalTitle}>Selecciona un Turno</Text>
              {OPCIONES_TURNO.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.dropdownItem,
                    turnoSeleccionado.id === item.id && styles.dropdownItemActive
                  ]}
                  onPress={() => {
                    setTurnoSeleccionado(item);
                    setMostrarDropdown(false);
                  }}
                >
                  <Text style={[
                    styles.dropdownItemText,
                    turnoSeleccionado.id === item.id && styles.dropdownItemTextActive
                  ]}>
                    {item.nombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* MODAL DE CARGA ABSOLUTA */}
      <Modal
        visible={enviando}
        transparent={true}
        animationType="none"
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#FF007A" />
            <Text style={styles.loadingText}>Guardando asistencia...</Text>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F8FAFC' 
  },
  header: { 
    backgroundColor: '#C5D800', 
    borderBottomLeftRadius: 35, 
    borderBottomRightRadius: 35, 
    justifyContent: 'center', 
    paddingHorizontal: 24, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3 
  },
  backButton: { 
    backgroundColor: '#FF007A', 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  backContent: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  backText: { 
    color: '#FFF', 
    fontWeight: '800', 
    marginLeft: 4, 
  },
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingBottom: 40, 
    width: '100%' 
  },
  tabletContent: { 
    maxWidth: 500, 
    alignSelf: 'center' 
  },
  headerComponentContainer: {
    marginBottom: 20,
  },
  title: { 
    fontWeight: '900', 
    color: '#00AEEF', 
    marginTop: 25, 
    marginBottom: 15, 
    textAlign: 'center' 
  },
  comboWrapper: {
    width: '100%',
    marginBottom: 10,
  },
  comboSelector: {
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  comboSelectorText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)', 
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  modalDropdownMenu: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginBottom: 10
  },
  dropdownItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
  },
  dropdownItemActive: {
    backgroundColor: '#F8FAFC',
  },
  dropdownItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  dropdownItemTextActive: {
    color: '#FF007A',
    fontWeight: '800',
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  cardItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#FFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1.5 
  },
  statLabel: { 
    fontWeight: '700', 
    color: '#334155', 
    flex: 1, 
    paddingRight: 8,
  },
  inputContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    width: 68,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2, 
  },
  statInput: { 
    fontWeight: '900', 
    textAlign: 'center', 
    width: '100%',
    paddingVertical: 0 
  },
  submitButton: { 
    backgroundColor: '#FF007A', 
    height: 52, 
    borderRadius: 26, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 20, 
    shadowColor: '#FF007A', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 5, 
    elevation: 4 
  },
  submitContent: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  submitText: { 
    color: '#FFF', 
    fontWeight: '800', 
    fontSize: 16, 
    marginLeft: 6, 
    letterSpacing: 0.5 
  }
});