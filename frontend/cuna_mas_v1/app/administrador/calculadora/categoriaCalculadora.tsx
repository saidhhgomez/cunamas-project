import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  useWindowDimensions,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { 
  ArrowLeft, 
  Beef, Milk, Egg, Activity 
} from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
// 💡 Importamos la herramienta nativa para calcular el tamaño de las barras del sistema
import { useSafeAreaInsets } from 'react-native-safe-area-context';
 
import { CalculadoraService } from '../../../service/calculadoraService'; 
import ModalMensaje from '../../components/ModalMensaje';
import { useModalMensaje } from '../../../hooks/useModalMensaje';
 
const MAPA_ICONOS: { [key: string]: any } = {
  'LÁCTEOS': Milk,
  'PRODUCTOS DE ORIGEN ANIMAL': Beef,
  'HUEVO': Egg,
  'OVOPRODUCTO': Egg,
};
 
export default function CalculadoraCategorias() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets(); // 💡 Captura el espacio de la barra de navegación de Android/iOS
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;
 
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { mostrarError, modalProps } = useModalMensaje();
 
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const data = await CalculadoraService.getListaCategorias();
        setCategorias(data);
      } catch (error) {
        console.error(error);
        mostrarError('Error', 'No se pudieron obtener las categorías.');
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
 
      {/* 🟢 HEADER (rectangular, solo botón volver) */}
      <View style={[styles.customHeader, { height: esPantallaGrande ? 120 : 100 }]}>
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
            <ArrowLeft color="#FFF" size={esPantallaGrande ? 22 : 18} strokeWidth={3} />
            <Text style={[styles.backText, { fontSize: esPantallaGrande ? 21 : 20 }]} allowFontScaling={false}>VOLVER</Text>
          </View>
        </TouchableOpacity>
      </View>
 
      {/* 📜 LISTADO DE CATEGORÍAS */}
      <View style={styles.scrollWrapper}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainerInternal}
          showsVerticalScrollIndicator={false}
        >
            <Text style={[styles.title, { fontSize: esPantallaGrande ? 42 : 32 }]} allowFontScaling={false}> 
            Seleccionar Categoría
          </Text>
 
          <View style={styles.categoryList}>
            {categorias.map((category) => {
              const nombreNormalizado = category.nombreCategoriaAlimento ? category.nombreCategoriaAlimento.toUpperCase().trim() : '';
              const Icon = MAPA_ICONOS[nombreNormalizado] || Activity; 
 
              return (
                <TouchableOpacity 
                  key={category.idCategoriaAlimento.toString()} 
                  style={[styles.categoryItem, { minHeight: esPantallaGrande ? 96 : 84 }]} 
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
                    style={[styles.categoryLabel, { fontSize: 20, lineHeight: 24 }]} 
                    numberOfLines={3}
                    ellipsizeMode="tail"
                    allowFontScaling={true}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.8}
                  >
                    {category.nombreCategoriaAlimento}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
  // --- Header original, solo se le quitó el borderRadius para que sea rectángulo ---
  customHeader: {
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
 
  // --- Contenido propio de la calculadora (SIN TOCAR) ---
  scrollWrapper: {
    flex: 1,
  },
  scrollContainerInternal: {
    paddingHorizontal: 25, 
    paddingTop: 30, 
    paddingBottom: 100, // espacio para el navbar fijo
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
    flexShrink: 1,
    minHeight: 76,
  },
  iconWrapper: { 
    marginRight: 15, 
    justifyContent: 'center', 
    alignItems: 'center',
    width: 30,
    flexShrink: 0,
  },
  categoryLabel: { 
    fontWeight: '800', 
    color: '#333', 
    letterSpacing: 0.5,
    flex: 1,
    flexShrink: 1,
    lineHeight: 18,
    includeFontPadding: false,
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