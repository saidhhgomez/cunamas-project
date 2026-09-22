import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  useWindowDimensions,
  ActivityIndicator
} from 'react-native';
import { Undo2 } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, usePathname } from 'expo-router'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 
import { CalculadoraService } from '../../../service/calculadoraService'; 
import ModalMensaje from '../../components/ModalMensaje';
import { useModalMensaje } from '../../../hooks/useModalMensaje';

export default function TipoPreparacion() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  
  // 📥 Recibimos de forma segura el idCategoria enviado por la pantalla anterior
  const { idCategoria } = useLocalSearchParams();

  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;

  // 🔄 Estados para la API
  const [preparaciones, setPreparaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { mostrarError, modalProps } = useModalMensaje();

  // 🚀 Llamada a tu Endpoint de Postman
  useEffect(() => {
    const cargarPreparaciones = async () => {
      try {
        if (!idCategoria) {
          mostrarError('Error', 'No se especificó ninguna categoría.');
          setLoading(false);
          return;
        }

        // Ejecuta tu servicio Axios enviando el id dinámico
        const data = await CalculadoraService.getPreparacionesPorCategoria(idCategoria);
        setPreparaciones(data);
      } catch (error) {
        console.error("Error al obtener preparaciones:", error);
        mostrarError('Error', 'No se pudieron obtener las preparaciones de la base de datos.');
      } finally {
        setLoading(false);
      }
    };

    // 🌟 SOLUCIÓN: Reiniciamos los estados inmediatamente cuando cambia idCategoria 
    // para evitar el flash visual con los datos de la categoría previa.
    setLoading(true);
    setPreparaciones([]);

    cargarPreparaciones();
  }, [idCategoria]);

  // ⏳ Pantalla de carga activa mientras responde Axios
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00AEEF" />
        <Text style={styles.loadingText}>Cargando preparaciones...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      
      {/* 🟢 HEADER (rectangular, solo botón volver) */}
      <View style={[styles.header, { height: esPantallaGrande ? 120 : 100 }]}>
        <TouchableOpacity 
          style={[styles.backButton, { width: esPantallaGrande ? 140 : 125, height: esPantallaGrande ? 46 : 40 }]} 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/administrador/inicio');
            }
          }}
          activeOpacity={0.85}
        >
          <View style={styles.backContent}>
            <Undo2 color="#FFF" size={esPantallaGrande ? 22 : 18} strokeWidth={3} />
            <Text style={[styles.backText, { fontSize: esPantallaGrande ? 21 : 20 }]} allowFontScaling={false}>Volver</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 📜 LISTADO DINÁMICO */}
      <View style={styles.scrollWrapper}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainerInternal}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionTitle, { fontSize: esPantallaGrande ? 42 : 32 }]} allowFontScaling={false}> 
            Tipo de{"\n"}Preparación
          </Text>

          <View style={styles.list}>
            {preparaciones.length === 0 ? (
              <Text style={styles.noDataText}>No se encontraron preparaciones para esta categoría.</Text>
            ) : (
              preparaciones.map((item) => (
                <TouchableOpacity 
                  key={item.idTipoPreparacion.toString()} 
                  style={[styles.optionCard, { minHeight: esPantallaGrande ? 96 : 84 }]}
                  activeOpacity={0.7}
                  onPress={() => {
                    // 🔀 Redirección pasando idCategoria, el idTipoPreparacion y el nombrePreparacion recién elegido
                    router.push({
                      pathname: '/administrador/calculadora/calculadoraDosificadora', 
                      params: {
                        idCategoria: idCategoria,
                        idTipoPreparacion: item.idTipoPreparacion,
                        nombrePreparacion: item.nombrePreparacion // 👈 Parametro añadido aquí
                      }
                    });
                  }}
                >
                  <Text
                    style={[styles.optionText, { fontSize: 18, lineHeight: 22 }]}
                    numberOfLines={3}
                    ellipsizeMode="tail"
                    allowFontScaling={true}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.8}
                  >
                    {item.nombrePreparacion}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      {/* Navegación Inferior (mismo diseño que las demás pantallas, solo Inicio) */}
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
      <ModalMensaje {...modalProps} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9'
  },
  loadingText: {
    marginTop: 10,
    color: '#64748B',
    fontWeight: '600'
  },
  noDataText: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 16,
    marginTop: 20,
    fontWeight: '600'
  },

  // --- Header original, solo se le quitó el borderRadius para que sea rectángulo ---
  header: {
    backgroundColor: '#C5D800',
    // sin borderBottomLeftRadius / borderBottomRightRadius -> queda rectangular
    justifyContent: 'center',
    paddingHorizontal: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    backgroundColor: '#FF007F',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#FFF',
    fontWeight: '900',
    marginLeft: 6,
  },

  // --- Contenido propio de la calculadora (SIN TOCAR) ---
  scrollWrapper: {
    flex: 1,
  },
  scrollContainerInternal: {
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 100, // espacio para el navbar fijo
  },
  sectionTitle: {
    fontWeight: '900',
    color: '#00AEEF',
    textAlign: 'center',
    marginBottom: 35,
    letterSpacing: -0.5,
  },
  list: {
    gap: 15,
    width: '100%',
  },
  optionCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 2,
    borderColor: '#C5BBE3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    minHeight: 76,
  },
  optionText: {
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 18,
    includeFontPadding: false,
    flexShrink: 1,
  },

  // --- Navbar estándar (mismo diseño que las demás pantallas, solo Inicio) ---
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navLabel: { fontSize: 11, marginTop: 4, color: '#757575' },
});