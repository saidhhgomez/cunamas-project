import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
  SafeAreaView,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { UserRound, User, LogOut, Home, Calculator, RefreshCw, WifiOff, MapPin } from 'lucide-react-native';
import { LocalService } from '../../service/centroAtencionService'; 
import { DistritoService, DistritoResponse, DireccionRequest } from '../../service/direccion'; 
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function InicioCuidadora() {
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
  const router = useRouter();
const { user, logout, updateUser } = useAuth(); // 👈 Destructura updateUser aquí  
  const insets = useSafeAreaInsets(); 

  const [locales, setLocales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [errorRed, setErrorRed] = useState(false); 

  // Estados para el Modal de Registro de Dirección
  const [mostrarModalUbicacion, setMostrarModalUbicacion] = useState(false);
  const [busquedaDistrito, setBusquedaDistrito] = useState('');
  const [distritosFiltrados, setDistritosFiltrados] = useState<DistritoResponse[]>([]);
  const [distritoSeleccionado, setDistritoSeleccionado] = useState<DistritoResponse | null>(null);
  const [direccionFisica, setDireccionFisica] = useState('');
  const [guardandoDireccion, setGuardandoDireccion] = useState(false);

  // Evalúa si se debe abrir el modal según el estado del backend
  useEffect(() => {
    if (user && user.tieneDireccion === false) {
      setMostrarModalUbicacion(true);
    } else {
      setMostrarModalUbicacion(false);
    }
  }, [user?.tieneDireccion]);

  // Lógica de búsqueda de Distritos (Debounce)
  useEffect(() => {
    // Si ya seleccionó uno, no disparamos búsquedas al limpiar el string parcial
    if (distritoSeleccionado) return;

    if (busquedaDistrito.trim().length < 3) {
      setDistritosFiltrados([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const data = await DistritoService.buscarDistritos(busquedaDistrito);
        setDistritosFiltrados(data);
      } catch (error) {
        console.warn("Error al buscar coincidencias de distritos.");
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [busquedaDistrito, distritoSeleccionado]);

  const reintentarConexion = () => {
    setLocales([]);
    setIsInitialLoad(true);
    setErrorRed(false);
  };

  const cargarLocales = async () => {
    const distritoUsuario = user?.distrito;

    
    if (loading || errorRed) return;

    setLoading(true);
    try {
      const resultado = await LocalService.getLocalesPorCentro(distritoUsuario);
      setLocales(resultado);
    } catch (error) {
      console.warn("⚠️ Servidor desconectado o IP incorrecta.");
      if (isInitialLoad) {
        setErrorRed(true);
      }
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  useEffect(() => {
    if (user?.tieneDireccion === true && user?.distrito) {
      cargarLocales();
    }
  }, [user?.distrito, user?.tieneDireccion, isInitialLoad]);

const manejarGuardarDireccion = async () => {
  if (!distritoSeleccionado || !direccionFisica) return;

  setGuardandoDireccion(true);
  try {
    const payload: DireccionRequest = {
      idDistrito: distritoSeleccionado.idDistrito,
      nombreDireccion: direccionFisica
    };

    // 1. Guardamos en el backend
    await DistritoService.actualizarDireccionPerfil(payload);
    
    // 3. Esperamos 2 segundos antes de cerrar y actualizar el contexto
    // Esto asegura que el usuario vea el mensaje y haya una pausa natural
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Cerramos el modal
    setMostrarModalUbicacion(false);

    // 5. ACTUALIZAMOS EL ESTADO GLOBAL
    // Esto disparará automáticamente el useEffect que carga los locales
    await updateUser({ 
      tieneDireccion: true, 
      distrito: distritoSeleccionado.distrito 
    });

  } catch (error) {
    console.error("Error al guardar:", error);
    Alert.alert("Error", "No se pudo guardar la ubicación");
    setGuardandoDireccion(false); // Solo desactivamos el loading si hay error
  }
};

  return (
    <SafeAreaView style={styles.container}>
      
      {/* HEADER */}
      <View style={[styles.header, { height: esPantallaGrande ? 160 : 130 }]}>
        <View style={styles.userInfo}>
          <View style={styles.avatarCircle}>
            <User color="#000" size={esPantallaGrande ? 32 : 26} />
          </View>
          <View style={styles.welcomeContainer}>
            <Text style={[styles.welcomeTitle, { fontSize: esPantallaGrande ? 24 : 20 }]}>
              Bienvenid@
            </Text>
            <Text style={[styles.userName, { fontSize: esPantallaGrande ? 18 : 15 }]} numberOfLines={1}>
              {user?.nombre || "María Estela"}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.8}>
          <LogOut color="#FFF" size={esPantallaGrande ? 26 : 22} />
        </TouchableOpacity>
      </View>

      {/* LISTADO DE LOCALES */}
      <FlatList
        data={locales}
        keyExtractor={(item, index) => `${item.idLocal || 'local'}-${index}`} 
        contentContainerStyle={[
          styles.scrollContent, 
          esPantallaGrande && styles.tabletContent
        ]}
        showsVerticalScrollIndicator={false}
        
        ListHeaderComponent={
          <Text style={[styles.title, { fontSize: esPantallaGrande ? 38 : 32 }]}>
            Locales
          </Text>
        }
        
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#00AEEF" />
            </View>
          ) : errorRed ? (
            <View style={styles.errorContainer}>
              <WifiOff color="#FF007A" size={54} strokeWidth={2} />
              <Text style={styles.errorTitle}>Problemas de Conexión</Text>
              <Text style={styles.errorText}>
                No logramos conectar con el servidor. Verifica que el sistema backend esté encendido o intenta nuevamente.
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={reintentarConexion}>
                <RefreshCw color="#FFF" size={18} style={{ marginRight: 8 }} />
                <Text style={styles.retryButtonText}>REINTENTAR</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No se encontraron locales de atención disponibles en {user?.distrito || "tu zona"}.
              </Text>
            </View>
          )
        }
        
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.localItem}
            activeOpacity={0.7}
            onPress={() => {
              router.push({
                pathname: '/cuidadora/modulo', 
                params: { idLocal: item.idLocal }
              });
            }}
          >
            <View style={styles.iconWrapper}>
              <UserRound color="#8A2BE2" size={esPantallaGrande ? 36 : 28} strokeWidth={2.5} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.localName, { fontSize: esPantallaGrande ? 19 : 15 }]} numberOfLines={1}>
                {item.localNombre} 
              </Text>
              <Text style={styles.localSubtitle} numberOfLines={1}>
                {item.direccion || "Dirección no especificada"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* MODAL EMERGENTE DE UBICACIÓN TOTALMENTE REESTRUCTURADO */}
      <Modal
        visible={mostrarModalUbicacion}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, esPantallaGrande && { maxWidth: 500 }]}>
            
            {/* Usamos FlatList como el motor contenedor del formulario interno del modal. 
                Esto arregla el scroll al 100% en iOS/Android ya que la lista de búsquedas 
                es parte del scroll nativo del modal y no flota de forma absoluta flotante. */}
            <FlatList
              data={distritosFiltrados.length > 0 && !distritoSeleccionado ? distritosFiltrados : []}
              keyExtractor={(item) => item.idDistrito.toString()}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              style={{ maxHeight: 520 }} 
              
              ListHeaderComponent={
                <View>
                  <View style={styles.modalHeader}>
                    <MapPin color="#00AEEF" size={32} />
                    <Text style={styles.modalTitle}>Configura tu Dirección</Text>
                    <Text style={styles.modalSubtitleLabel}>
                      Para poder asignarte tus locales de atención, necesitamos conocer tu ubicación actual.
                    </Text>
                  </View>

                  {/* Grupo 1: Buscador de Distrito */}
                  <View style={styles.formGroupDistrito}>
                    <Text style={styles.inputLabel}>Buscar Distrito (Escribe 3 letras o más):</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Ej: Villa El Salvador"
                      placeholderTextColor="#94A3B8"
                      value={busquedaDistrito}
                      onChangeText={(texto) => {
                        if (distritoSeleccionado) {
                          setDistritoSeleccionado(null);
                        }
                        setBusquedaDistrito(texto);
                      }}
                    />
                  </View>
                  
                  {/* Título de control si hay resultados activos para guiar al usuario */}
                  {distritosFiltrados.length > 0 && !distritoSeleccionado && (
                    <Text style={styles.resultsLabel}>Coincidencias encontradas (Desliza para ver más):</Text>
                  )}
                </View>
              }
              
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => {
                    // Juntamos Distrito, Provincia y Departamento para el campo visual
                    const cadenaUnificada = `${item.distrito} - ${item.provincia} (${item.departamento})`;
                    setDistritoSeleccionado(item);
                    setBusquedaDistrito(cadenaUnificada);
                    setDistritosFiltrados([]);
                  }}
                >
                  {/* Se muestra unificado en una sola línea clara */}
                  <Text style={styles.suggestionText}>
                    {item.distrito} - {item.provincia} ({item.departamento})
                  </Text>
                </TouchableOpacity>
              )}
              
              ListFooterComponent={
                <View style={{ marginTop: 10 }}>
                  {/* Grupo 2: Dirección Física */}
                  <View style={styles.formGroupDireccion}>
                    <Text style={styles.inputLabel}>Dirección Exacta (Av, Calle, Mz y Lote):</Text>
                    <TextInput
                      style={[styles.textInput, { height: 75, textAlignVertical: 'top', paddingTop: 10 }]}
                      placeholder="Ej: Av. Los Próceres 456 Int. 3"
                      placeholderTextColor="#94A3B8"
                      multiline={true}
                      value={direccionFisica}
                      onChangeText={setDireccionFisica}
                    />
                  </View>

                  {/* Botones de Acción */}
                  <View style={styles.modalActionRow}>
                    <TouchableOpacity style={[styles.modalButton, styles.btnCancel]} onPress={logout}>
                      <Text style={styles.btnCancelText}>Salir</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.modalButton, styles.btnSave]} 
                      onPress={manejarGuardarDireccion}
                      disabled={guardandoDireccion}
                    >
                      {guardandoDireccion ? (
                        <ActivityIndicator color="#FFF" size="small" />
                      ) : (
                        <Text style={styles.btnSaveText}>Guardar</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              }
            />

          </View>
        </View>
      </Modal>

      {/* BARRA TAB INFERIOR FLOATING */}
      <View style={[styles.floatingTabBarContainer, { bottom: Math.max(insets.bottom, 16) }]}>
        <View style={[styles.floatingTabBar, { width: esPantallaGrande ? 320 : '90%' }]}>
          <TouchableOpacity style={styles.tabButton} activeOpacity={0.7}>
            <Home color="#00AEEF" size={24} />
            <Text style={[styles.tabLabel, { color: '#00AEEF' }]}>Inicio</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.tabButton} 
            activeOpacity={0.7}
            onPress={() => router.push('/cuidadora/categoriaCalculadora')}
          >
            <Calculator color="#94A3B8" size={24} />
            <Text style={[styles.tabLabel, { color: '#94A3B8' }]}>Calculadora</Text>
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    backgroundColor: '#C5D800', borderBottomLeftRadius: 40, borderBottomRightRadius: 40,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: '6%', shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 4,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 15 },
  avatarCircle: { backgroundColor: '#FFF', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  welcomeContainer: { marginLeft: 12, flex: 1 },
  welcomeTitle: { color: '#00AEEF', fontWeight: 'bold' },
  userName: { color: '#FFF', fontWeight: '600', marginTop: 2 },
  logoutButton: { backgroundColor: '#FF007A', padding: 12, borderRadius: 25 },
  scrollContent: { paddingHorizontal: '6%', paddingBottom: 160, width: '100%' },
  tabletContent: { maxWidth: 550, alignSelf: 'center' },
  title: { fontWeight: '900', color: '#00AEEF', marginBottom: 20, marginTop: 25 },
  localItem: {
    width: '100%', height: 76, borderWidth: 2, borderColor: '#8A2BE2', borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 14,
    backgroundColor: '#FFF', elevation: 2,
  },
  iconWrapper: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center' },
  textContainer: { marginLeft: 14, flex: 1, justifyContent: 'center' },
  localName: { fontWeight: '800', color: '#1E293B', textTransform: 'uppercase' },
  localSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyText: { fontSize: 16, color: '#94A3B8', fontWeight: '700', textAlign: 'center', lineHeight: 22 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 40, paddingHorizontal: 25 },
  errorTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginTop: 15, marginBottom: 8, textAlign: 'center' },
  errorText: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  retryButton: { backgroundColor: '#00AEEF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20 },
  retryButtonText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  floatingTabBarContainer: { position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  floatingTabBar: { backgroundColor: '#FFFFFF', borderRadius: 25, borderWidth: 1, borderColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', height: 65, elevation: 5 },
  tabButton: { flex: 1, justifyContent: 'center', alignItems: 'center', height: '100%' },
  tabLabel: { fontWeight: '800', fontSize: 12, marginTop: 2 },
  
  // ESTILOS DEL MODAL OPTIMIZADOS
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContainer: { width: '100%', backgroundColor: '#FFF', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOpacity: 0.15, elevation: 10 },
  modalHeader: { alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#1E293B', marginTop: 10, marginBottom: 6 },
  modalSubtitleLabel: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18 },
  
  formGroupDistrito: { marginBottom: 10 }, 
  formGroupDireccion: { marginTop: 14, marginBottom: 16 },
  resultsLabel: { fontSize: 12, fontWeight: '700', color: '#00AEEF', marginTop: 6, marginBottom: 6 },
  
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 6 },
  textInput: { height: 50, borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 14, fontSize: 15, color: '#1E293B', backgroundColor: '#F8FAFC' },
  
  suggestionItem: { 
    paddingVertical: 14, 
    paddingHorizontal: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    marginVertical: 2,
    borderRadius: 8
  },
  suggestionText: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  modalActionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  modalButton: { flex: 1, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  btnCancel: { marginRight: 10, backgroundColor: '#F1F5F9' },
  btnCancelText: { color: '#64748B', fontWeight: '700', fontSize: 16 },
  btnSave: { marginLeft: 10, backgroundColor: '#00AEEF' },
  btnSaveText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});