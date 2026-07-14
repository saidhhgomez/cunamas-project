import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  useWindowDimensions,
  SafeAreaView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { 
  ArrowLeft, 
  Home,
  Beef, Milk, Egg, Activity 
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
// 💡 Importamos la herramienta nativa para calcular el tamaño de las barras del sistema
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CalculadoraService } from '../../../service/calculadoraService'; 

const MAPA_ICONOS: { [key: string]: any } = {
  'LÁCTEOS': Milk,
  'PRODUCTOS DE ORIGEN ANIMAL': Beef,
  'HUEVO': Egg,
  'OVOPRODUCTO': Egg,
};

export default function CalculadoraCategorias() {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // 💡 Captura el espacio de la barra de navegación de Android/iOS
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;

  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const data = await CalculadoraService.getListaCategorias();
        setCategorias(data);
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "No se pudieron obtener las categorías.");
      } finally {
        setLoading(false);
      }
    };
    cargarCategorias();
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00AEEF" />
        <Text style={styles.loadingText}>Cargando categorías...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* 🟢 TOP SAFE AREA */}
      <SafeAreaView style={styles.topSafeArea} />

      {/* 🟢 HEADER CURVO */}
      <View style={[styles.customHeader, { height: esPantallaGrande ? 120 : 100 }]}>
        <TouchableOpacity 
          style={[styles.backButton, { width: esPantallaGrande ? 140 : 125, height: esPantallaGrande ? 46 : 40 }]} 
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <View style={styles.backContent}>
            <ArrowLeft color="#FFF" size={esPantallaGrande ? 22 : 18} strokeWidth={3} />
            <Text style={[styles.backText, { fontSize: esPantallaGrande ? 15 : 13 }]}>VOLVER</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 📜 LISTADO DE CATEGORÍAS */}
      <View style={styles.scrollWrapper}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainerInternal}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { fontSize: esPantallaGrande ? 42 : 32 }]}>
            Seleccionar Categoría
          </Text>

          <View style={styles.categoryList}>
            {categorias.map((category) => {
              const nombreNormalizado = category.nombreCategoriaAlimento ? category.nombreCategoriaAlimento.toUpperCase().trim() : '';
              const Icon = MAPA_ICONOS[nombreNormalizado] || Activity; 

              return (
                <TouchableOpacity 
                  key={category.idCategoriaAlimento.toString()} 
                  style={[styles.categoryItem, { minHeight: esPantallaGrande ? 82 : 70 }]} 
                  activeOpacity={0.7}
                  onPress={() => {
                    router.push({
                      pathname: 'administrador/calculadora/preparacionCalculadora', 
                      params: { 
                        idCategoria: category.idCategoriaAlimento, 
                      }
                    });
                  }}
                >
                  <View style={styles.iconWrapper}>
                    <Icon color="#333" size={esPantallaGrande ? 28 : 24} strokeWidth={2.5} />
                  </View>
                  <Text 
                    style={[styles.categoryLabel, { fontSize: esPantallaGrande ? 20 : 16 }]} 
                    numberOfLines={2} 
                  >
                    {category.nombreCategoriaAlimento}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* 🌟 BARRA INFERIOR CONTROLADA NATIVAMENTE */}
      {/* Cambiamos SafeAreaView por un View común y corriente usando los insets calculados */}
      <View style={[
        styles.bottomBarContainer, 
        { paddingBottom: Math.max(insets.bottom, 16) } // Asegura separación en dispositivos con gestos o botones virtuales
      ]}>
        <TouchableOpacity 
          style={styles.homeButtonCircle}
          onPress={() => router.replace('/administrador/inicio')}
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
    backgroundColor: '#F9F9F9' 
  },
  topSafeArea: {
    flex: 0,
    backgroundColor: '#C5D800', 
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
  customHeader: {
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
    backgroundColor: '#FF007F', 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  backContent: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  backText: { 
    color: '#FFF', 
    fontWeight: '900', 
    marginLeft: 6 
  },
  scrollWrapper: {
    flex: 1,
  },
  scrollContainerInternal: {
    paddingHorizontal: 25, 
    paddingTop: 30, 
    paddingBottom: 20, 
  },
  title: { 
    fontWeight: '900', 
    color: '#00AEEF', 
    textAlign: 'center', 
    marginBottom: 35, 
    letterSpacing: -0.5 
  },
  categoryList: { 
    gap: 15, 
    width: '100%' 
  },
  categoryItem: { 
    backgroundColor: '#FFF', 
    borderRadius: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    borderWidth: 1, 
    borderColor: '#D8D8E8',
    flexShrink: 1 
  },
  iconWrapper: { 
    marginRight: 15, 
    justifyContent: 'center', 
    alignItems: 'center',
    width: 30 
  },
  categoryLabel: { 
    fontWeight: '800', 
    color: '#333', 
    letterSpacing: 0.5,
    flex: 1, 
    flexWrap: 'wrap' 
  },
  /* 🌟 ESTILIZACIÓN DE LA BARRA CONTENEDORA REAL EN LA PARTE INFERIOR */
  bottomBarContainer: {
    width: '100%',
    backgroundColor: '#F9F9F9', // Mismo fondo grisáceo limpio del layout de la app
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
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