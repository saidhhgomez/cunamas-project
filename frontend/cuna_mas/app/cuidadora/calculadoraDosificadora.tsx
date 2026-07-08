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
  Keyboard, // 🌟 Importamos Keyboard para controlar la visibilidad de la barra inferior
  Platform,
  KeyboardAvoidingView
} from 'react-native'; 
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router'; 

const OPCIONES_SA = [
  { label: 'S.A. Opción 1', value: '1' },
  { label: 'S.A. Opción 2', value: '2' },
  { label: 'S.A. Opción 3', value: '3' },
];

const OPCIONES_CORRELATIVO = [
  { label: 'Correlativo 1', value: '1' },
  { label: 'Correlativo 2', value: '2' },
  { label: 'Correlativo 3', value: '3' },
];

export default function DosificacionResultados() { 
  const router = useRouter();
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;

  // Estados de los selectores
  const [selectedSA, setSelectedSA] = useState<any>(null); 
  const [selectedCorrelativo, setSelectedCorrelativo] = useState<any>(null); 

  // Estados para abrir los Modales de selección estética
  const [modalSAVisible, setModalSAVisible] = useState(false);
  const [modalCorrelativoVisible, setModalCorrelativoVisible] = useState(false);

  // Estado para controlar si el teclado está abierto
  const [tecladoVisible, setTecladoVisible] = useState(false);

  // Estado dinámico para los resultados editables
  const [resultados, setResultados] = useState([
    { id: '1', label: "Niños de 6 a 9 Meses", value: "26", color: "#4CAF50" }, 
    { id: '2', label: "Niños de 10 a 12 Meses", value: "18", color: "#FF4081" }, 
    { id: '3', label: "Niños de 13 a 23 Meses", value: "12", color: "#FFB300" }, 
    { id: '4', label: "Niños de 24 a 36 Meses", value: "20", color: "#FFB300" }, 
    { id: '5', label: "Actores Comunales", value: "6", color: "#FFB300" }, 
  ]);

  // Escuchadores del teclado para ocultar la barra inferior al escribir
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

  const manejarContinuar = () => {
    console.log("Datos listos para enviar:", resultados);
  };

  return ( 
    <SafeAreaView style={styles.container}> 
      {/* 🌟 Envolvemos en KeyboardAvoidingView para evitar bugs en iOS */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.flexible}
      >
        
        {/* 🟢 ENCABEZADO VERDE CURVO */} 
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

        {/* 📜 CONTENEDOR SEGURO PARA EL SCROLL */} 
        <View style={styles.scrollWrapper}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          > 
            
            {/* SELECTORES PERSONALIZADOS */} 
            <View style={styles.pickerRow}> 
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

              <TouchableOpacity 
                style={styles.customPickerButton}
                activeOpacity={0.7}
                onPress={() => setModalCorrelativoVisible(true)}
              >
                <Text style={[styles.pickerButtonText, selectedCorrelativo && styles.pickerSelectedText]} numberOfLines={1}>
                  {selectedCorrelativo ? selectedCorrelativo.label : "Correlativo"}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#006080" />
              </TouchableOpacity>
            </View> 

            <Text style={styles.sectionTitle}>TOTAL:</Text> 

            {/* LISTA DE RESULTADOS EDITABLES */} 
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

            {/* Guarnición */} 
            <View style={styles.guarnicionCard}> 
              <MaterialCommunityIcons name="silverware-fork-knife" size={24} color="#006080" /> 
              <Text style={styles.guarnicionText}>ARROZ COMO GUARNICIÓN</Text> 
            </View> 

            {/* Botón Continuar */} 
            <TouchableOpacity style={styles.continueButton} activeOpacity={0.8} onPress={manejarContinuar}> 
              <Text style={styles.continueButtonText}>CONTINUAR</Text> 
            </TouchableOpacity> 

            {/* Necesitas */} 
            <Text style={styles.necesitasTitle}>NECESITAS:</Text> 
            <View style={styles.necesitasRow}> 
              <View style={styles.necesitasCard}> 
                <Text style={styles.necesitasValue}>16</Text> 
                <Text style={styles.necesitasLabel}>BOLSAS DE 1 KG</Text> 
              </View> 
              <View style={styles.necesitasCard}> 
                <Text style={styles.necesitasValue}>24</Text> 
                <Text style={styles.necesitasLabel}>BOLSAS DE 1/2</Text> 
              </View> 
            </View> 
          </ScrollView> 
        </View>

        {/* 🌟 BARRA ESTÁTICA INFERIOR: Corregida con separación de 50px y se oculta con el teclado */} 
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

      {/* 🎭 MODAL PARA SELECCIONAR S.A. */}
      <Modal visible={modalSAVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccione S.A.</Text>
            <FlatList
              data={OPCIONES_SA}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalOption} 
                  onPress={() => { setSelectedSA(item); setModalSAVisible(false); }}
                >
                  <Text style={styles.modalOptionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalSAVisible(false)}>
              <Text style={styles.closeModalButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 🎭 MODAL PARA SELECCIONAR CORRELATIVO */}
      <Modal visible={modalCorrelativoVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccione Correlativo</Text>
            <FlatList
              data={OPCIONES_CORRELATIVO}
              keyExtractor={(item) => item.value}
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
  continueButtonText: { 
    color: '#FFFFFF', 
    fontWeight: 'bold', 
    fontSize: 16, 
  }, 
  necesitasTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333333', 
    marginBottom: 10, 
  }, 
  necesitasRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
  }, 
  necesitasCard: { 
    flex: 0.48, 
    backgroundColor: '#EEEEEE', 
    padding: 20, 
    borderRadius: 10, 
    alignItems: 'center', 
  }, 
  necesitasValue: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#4CAF50', 
    marginBottom: 5, 
  }, 
  necesitasLabel: { 
    fontSize: 10, 
    fontWeight: 'bold', 
    color: '#4CAF50', 
    textAlign: 'center', 
  }, 
  /* 🌟 BARRA ESTÁTICA INFERIOR ACTUALIZADA */
  bottomBarContainer: {
    width: '100%',
    backgroundColor: '#F9F9F9', 
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15, 
    paddingBottom: 50, // 🌟 Forzamos 50px de aire limpio para separarlo de la barra del celular
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
  }
});