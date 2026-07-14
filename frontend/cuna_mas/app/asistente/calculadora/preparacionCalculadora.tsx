import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import { 
  Undo2, 
  Home 
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 
import { CalculadoraService } from '../../../service/calculadoraService'; 

export default function TipoPreparacion() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // 📥 Recibimos de forma segura el idCategoria enviado por la pantalla anterior
  const { idCategoria } = useLocalSearchParams();

  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;

  // 🔄 Estados para la API
  const [preparaciones, setPreparaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // 🚀 Llamada a tu Endpoint de Postman
  useEffect(() => {
    const cargarPreparaciones = async () => {
      try {
        if (!idCategoria) {
          Alert.alert("Error", "No se especificó ninguna categoría.");
          setLoading(false);
          return;
        }

        // Ejecuta tu servicio Axios enviando el id dinámico
        const data = await CalculadoraService.getPreparacionesPorCategoria(idCategoria);
        setPreparaciones(data);
      } catch (error) {
        console.error("Error al obtener preparaciones:", error);
        Alert.alert("Error", "No se pudieron obtener las preparaciones de la base de datos.");
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
      
      {/* 🟢 HEADER CURVO PROPIO */}
      <View style={[styles.header, { height: esPantallaGrande ? 120 : 100 }]}>
        <TouchableOpacity 
          style={[styles.backButton, { width: esPantallaGrande ? 140 : 125, height: esPantallaGrande ? 46 : 40 }]} 
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <View style={styles.backContent}>
            <Undo2 color="#FFF" size={esPantallaGrande ? 22 : 18} strokeWidth={3} />
            <Text style={[styles.backText, { fontSize: esPantallaGrande ? 15 : 13 }]}>VOLVER</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 📜 LISTADO DINÁMICO */}
      <View style={styles.scrollWrapper}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainerInternal}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionTitle, { fontSize: esPantallaGrande ? 42 : 32 }]}>
            Tipo de{"\n"}Preparación
          </Text>

          <View style={styles.list}>
            {preparaciones.length === 0 ? (
              <Text style={styles.noDataText}>No se encontraron preparaciones para esta categoría.</Text>
            ) : (
              preparaciones.map((item) => (
                <TouchableOpacity 
                  key={item.idTipoPreparacion.toString()} 
                  style={[styles.optionCard, { minHeight: esPantallaGrande ? 82 : 70 }]}
                  activeOpacity={0.7}
                  onPress={() => {
                    // 🔀 Redirección pasando idCategoria, el idTipoPreparacion y el nombrePreparacion recién elegido
                    router.push({
                      pathname: '/asistente/calculadora/calculadoraDosificadora', 
                      params: {
                        idCategoria: idCategoria,
                        idTipoPreparacion: item.idTipoPreparacion,
                        nombrePreparacion: item.nombrePreparacion // 👈 Parametro añadido aquí
                      }
                    });
                  }}
                >
                  <Text style={[styles.optionText, { fontSize: esPantallaGrande ? 20 : 16 }]}>
                    {item.nombrePreparacion}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      {/* 🌟 BOTÓN FIJO INFERIOR */}
      <View style={[styles.bottomBarContainer, { paddingBottom: Math.max(insets.bottom, 15) }]}>
        <TouchableOpacity 
          style={styles.homeButtonCircle}
          onPress={() => router.replace('/')}
          activeOpacity={0.85}
        >
          <Home color="#00AEEF" size={24} />
          <Text style={styles.homeButtonText}>Inicio</Text>
        </TouchableOpacity>
      </View>

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
  header: {
    backgroundColor: '#C5D800',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: 'center',
    paddingHorizontal: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    backgroundColor: '#D10069',
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
  scrollWrapper: {
    flex: 1,
  },
  scrollContainerInternal: {
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 20,
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
  },
  optionText: {
    fontWeight: '800',
    color: '#000',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  bottomBarContainer: {
    width: '100%',
    backgroundColor: '#F9F9F9', 
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 15, 
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
  }
});