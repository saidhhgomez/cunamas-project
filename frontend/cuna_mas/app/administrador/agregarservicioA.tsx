import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../service/api'; 
import { DistritoService, DistritoResponse } from '../../service/direccion'; 
import { CentroAlimentarioService } from '../../service/servicioAlimentario';

export default function AgregarServicioA() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);

  // Estados para el formulario
  const [nombreCentro, setNombreCentro] = useState('');
  const [nombreComite, setNombreComite] = useState('');
  const [nombreDireccion, setNombreDireccion] = useState('');
  
  // Estados para la búsqueda asíncrona de Distritos
  const [busquedaDistrito, setBusquedaDistrito] = useState('');
  const [distritoSeleccionado, setDistritoSeleccionado] = useState<DistritoResponse | null>(null);
  const [listaDistritos, setListaDistritos] = useState<DistritoResponse[]>([]);
  const [buscandoDistrito, setBuscandoDistrito] = useState(false);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  // Estado para controlar el scroll principal mientras interactuamos con la lista flotante
  const [scrollPrincipalHabilitado, setScrollPrincipalHabilitado] = useState(true);

  // Estado para detectar si el teclado físico está visible en pantalla
  const [tecladoVisible, setTecladoVisible] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  // Posicionamiento dinámico de la lista de sugerencias
  const [buscadorY, setBuscadorY] = useState(0);

  // Listener para saber si el teclado está activo
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setTecladoVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setTecladoVisible(false));

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Búsqueda con debounce para evitar llamadas innecesarias al servidor
  useEffect(() => {
    if (busquedaDistrito.trim().length < 2 || (distritoSeleccionado && busquedaDistrito === `${distritoSeleccionado.distrito} (${distritoSeleccionado.provincia})`)) {
      setListaDistritos([]);
      setMostrarSugerencias(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        setBuscandoDistrito(true);
        const resultados = await DistritoService.buscarDistritos(busquedaDistrito);
        setListaDistritos(resultados);
        setMostrarSugerencias(resultados.length > 0);
        
        // Hacemos un scroll suave automático al buscador si el teclado está abierto
        if (resultados.length > 0) {
          scrollViewRef.current?.scrollTo({ y: buscadorY - 60, animated: true });
        }
      } catch (err) {
        console.log("ERROR AXIOS:", err);
      } finally {
        setBuscandoDistrito(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [busquedaDistrito]);

  const handleSeleccionarDistrito = (distrito: DistritoResponse) => {
    setDistritoSeleccionado(distrito);
    setBusquedaDistrito(`${distrito.distrito} (${distrito.provincia})`);
    setMostrarSugerencias(false);
    setScrollPrincipalHabilitado(true);
    Keyboard.dismiss(); // Ocultamos el teclado al seleccionar para limpiar la vista
  };

const handleGuardarTransaccion = async () => {
  // 1. Validaciones iniciales de formulario
  if (!distritoSeleccionado || !nombreDireccion || !nombreCentro || !nombreComite) {
    Alert.alert("Campos incompletos", "Por favor, complete todos los campos requeridos.");
    return;
  }

  try {
    setIsSaving(true);
    
    console.log("Paso 1: Registrando dirección...");
    // 2. Primer POST: Registrar dirección física (según tu primera captura de Postman)
// Llamamos al método que acabamos de registrar en DistritoService
const resDireccion = await DistritoService.registrarDireccion({
  idDistrito: distritoSeleccionado.idDistrito,
  nombreDireccion: nombreDireccion
});

const idDireccionGenerado = resDireccion.idGenerado;

    if (!idDireccionGenerado) {
      throw new Error("No se pudo obtener el ID de la dirección creada.");
    }

    console.log(`Paso 1 Completado. ID Dirección Generado: ${idDireccionGenerado}`);
    console.log("Paso 2: Registrando Servicio Alimentario...");

    // 3. Segundo POST: Registrar el Servicio Alimentario usando el ID anterior
    const resCentro = await CentroAlimentarioService.registrar({
      idDireccion: idDireccionGenerado, // Pasamos el número retornado en el paso 1
      nombreCentro: nombreCentro,
      nombreComite: nombreComite
    });

    console.log("Paso 2 Completado con éxito.");

    // 4. Si todo salió bien, avisamos al usuario y regresamos
    Alert.alert(
      "¡Registro Exitoso!", 
      "El servicio alimentario y su dirección han sido guardados correctamente.", 
      [{ text: "Entendido", onPress: () => router.back() }]
    );

  } catch (error: any) {
    console.error("Error durante el flujo de registro:", error);
    
    // Mostramos un mensaje claro del error
    const mensajeError = error.response?.data?.mensaje || error.message || "Fallo en la comunicación con el servidor.";
    Alert.alert("Error al registrar", mensajeError);
  } finally {
    setIsSaving(false);
  }
};

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 20}
    >
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        {/* Barra superior de navegación */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#006080" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nuevo Centro Alimentario</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Zona de contenido relativo intermedio */}
        <View style={{ flex: 1, position: 'relative' }}>
          
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            scrollEnabled={scrollPrincipalHabilitado}
          >
            {/* SECCIÓN 1: DATOS DEL COMEDOR */}
            <Text style={styles.sectionTitle}>Datos del Servicio Alimentario</Text>

            <Text style={styles.label}>Nombre del Centro *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Comedor Popular Cartagena"
              placeholderTextColor="#94A3B8"
              value={nombreCentro}
              onChangeText={(txt) => {
                setNombreCentro(txt);
                if(distritoSeleccionado) setMostrarSugerencias(false);
              }}
            />

            <Text style={styles.label}>Nombre del Comité *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Comité De la Mar"
              placeholderTextColor="#94A3B8"
              value={nombreComite}
              onChangeText={(txt) => {
                setNombreComite(txt);
                if(distritoSeleccionado) setMostrarSugerencias(false);
              }}
            />

            {/* SECCIÓN 2: UBICACIÓN Y BÚSQUEDA ASÍNCRONA */}
            <Text style={styles.sectionTitle}>Ubicación y Geografía</Text>
            
            <Text style={styles.label}>Buscar Distrito *</Text>
            
            <View 
              style={styles.searchContainer}
              onLayout={(event) => {
                const layout = event.nativeEvent.layout;
                setBuscadorY(layout.y); // Guardamos el Y inicial del input
              }}
            >
              <View style={styles.searchSection}>
                <TextInput
                  style={[styles.input, { marginBottom: 0, flex: 1, paddingRight: 45 }]}
                  placeholder="Escriba un distrito para buscar..."
                  placeholderTextColor="#94A3B8"
                  value={busquedaDistrito}
                  onChangeText={(text) => {
                    setBusquedaDistrito(text);
                    if (distritoSeleccionado && text !== `${distritoSeleccionado.distrito} (${distritoSeleccionado.provincia})`) {
                      setDistritoSeleccionado(null);
                    }
                  }}
                />
                
                <View style={styles.searchIconContainer}>
                  {buscandoDistrito ? (
                    <ActivityIndicator size="small" color="#006080" />
                  ) : (
                    <Ionicons name="search" size={20} color="#64748B" />
                  )}
                </View>
              </View>
            </View>

            <Text style={styles.label}>Dirección Exacta *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Av. Santo 1443"
              placeholderTextColor="#94A3B8"
              value={nombreDireccion}
              onChangeText={(txt) => {
                setNombreDireccion(txt);
                if(distritoSeleccionado) setMostrarSugerencias(false);
              }}
            />

            {/* Botón de envío principal */}
            <TouchableOpacity 
              style={[styles.submitButton, (!distritoSeleccionado || isSaving) && styles.submitButtonDisabled]} 
              onPress={handleGuardarTransaccion}
              disabled={isSaving || !distritoSeleccionado}
              activeOpacity={0.8}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Registrar Completo</Text>
              )}
            </TouchableOpacity>

          </ScrollView>

          {/* LISTA FLOTANTE INTELIGENTE: Se coloca arriba del input si el teclado está abierto */}
          {mostrarSugerencias && (
            <View 
              style={[
                styles.suggestionsContainer, 
                tecladoVisible 
                  ? { bottom: (450 - buscadorY) } // Abre HACIA ARRIBA del input cuando el teclado está activo
                  : { top: buscadorY + 68 }       // Abre HACIA ABAJO del input si el teclado está cerrado
              ]}
              onTouchStart={() => setScrollPrincipalHabilitado(false)}
              onTouchEnd={() => setScrollPrincipalHabilitado(true)}
              onCancel={() => setScrollPrincipalHabilitado(true)}
            >
              <FlatList
                data={listaDistritos}
                keyExtractor={(item) => item.idDistrito.toString()}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="always"
                style={{ maxHeight: 160 }}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.suggestionItem} 
                    onPress={() => handleSeleccionarDistrito(item)}
                  >
                    <Ionicons name="location-sharp" size={16} color="#006080" style={{ marginRight: 8 }} />
                    <Text style={styles.suggestionText} numberOfLines={1}>
                      {item.distrito}, {item.provincia} - <Text style={styles.ubigeoText}>Ubigeo {item.ubigeo}</Text>
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: { 
    width: 40, 
    height: 40, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#006080' 
  },
  scrollContent: { 
    padding: 24, 
    paddingBottom: 60 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: '#006080', 
    marginTop: 15, 
    marginBottom: 16 
  },
  label: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#475569', 
    marginBottom: 6 
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 15,
    color: '#333333',
    marginBottom: 20,
  },
  searchContainer: { 
    position: 'relative', 
    marginBottom: 20 
  },
  searchSection: { 
    flexDirection: 'row', 
    position: 'relative', 
    alignItems: 'center' 
  },
  searchIconContainer: { 
    position: 'absolute', 
    right: 14, 
    height: '100%', 
    justifyContent: 'center',
    alignItems: 'center'
  },
  suggestionsContainer: {
    position: 'absolute',
    left: 24,
    right: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    elevation: 10,         
    shadowColor: '#000',  
    shadowOffset: { width: 0, height: -4 }, // Sombra invertida si sube
    shadowOpacity: 0.25,
    shadowRadius: 6,
    zIndex: 99999,      
  },
  suggestionItem: {
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  suggestionText: { 
    flex: 1, 
    fontSize: 14, 
    color: '#334155', 
    fontWeight: '500' 
  },
  ubigeoText: { 
    fontSize: 12, 
    color: '#64748B' 
  },
  submitButton: {
    backgroundColor: '#C5D800',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    elevation: 2,
  },
  submitButtonDisabled: { 
    backgroundColor: '#E2E8F0' 
  },
  submitButtonText: { 
    color: '#006080', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});