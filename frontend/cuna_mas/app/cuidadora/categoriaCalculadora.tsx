import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  useWindowDimensions,
  SafeAreaView
} from 'react-native';
import { 
  ArrowLeft, 
  Home,
  BookOpen, Layers, Beef, Leaf, Milk, Apple, Droplet, Nut, Egg, Fish, CupSoda, Cookie, Candy, Sparkles, Activity 
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const CATEGORIES = [
  { id: '1', title: 'CEREALES', icon: BookOpen },
  { id: '2', title: 'TUBÉRCULOS', icon: Layers },
  { id: '3', title: 'LEGUMINOSAS', icon: BookOpen },
  { id: '4', title: 'PROTEINAS', icon: Beef },
  { id: '5', title: 'VERDURAS', icon: Leaf },
  { id: '6', title: 'LACTEOS', icon: Milk },
  { id: '7', title: 'FRUTAS', icon: Apple },
  { id: '8', title: 'GRASAS Y ACEITES', icon: Droplet },
  { id: '9', title: 'FRUTOS SECOS', icon: Nut },
  { id: '10', title: 'HUEVOS', icon: Egg },
  { id: '11', title: 'PESCADOS Y MARISCOS', icon: Fish },
  { id: '12', title: 'BEBIDAS E INFUSIONES', icon: CupSoda },
  { id: '13', title: 'ACOMPAÑAMIENTOS', icon: Cookie },
  { id: '14', title: 'AZÚCARES Y DULCES', icon: Candy },
  { id: '15', title: 'CONDIMENTOS', icon: Sparkles },
  { id: '16', title: 'SUPLEMENTOS', icon: Activity },
];

export default function CalculadoraCategorias() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;

  return (
    <SafeAreaView style={styles.container}>
      
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

      {/* 📜 LISTADO DE CATEGORÍAS (flex: 1 toma todo el espacio restante disponible) */}
      <View style={styles.scrollWrapper}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainerInternal}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { fontSize: esPantallaGrande ? 42 : 32 }]}>
            Seleccionar Categoría
          </Text>

          <View style={styles.categoryList}>
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <TouchableOpacity 
                  key={category.id} 
                  style={[styles.categoryItem, { height: esPantallaGrande ? 82 : 70 }]}
                  activeOpacity={0.7}
                  onPress={() => console.log(`Selected: ${category.title}`)}
                >
                  <View style={styles.iconWrapper}>
                    <Icon color="#333" size={esPantallaGrande ? 28 : 24} strokeWidth={2.5} />
                  </View>
                  <Text style={[styles.categoryLabel, { fontSize: esPantallaGrande ? 20 : 18 }]}>
                    {category.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* 🌟 LA SOLUCIÓN DEFINITIVA: BOTÓN FIJO EN LA PARTE INFERIOR (Fuera del Scroll) */}
      <View style={styles.bottomBarContainer}>
        <TouchableOpacity 
          style={styles.homeButtonCircle}
          onPress={() => router.replace('/cuidadora/calculadoraDosificadora')}
          activeOpacity={0.85}
        >
          <Home color="#00AEEF" size={24} />
          <Text style={styles.homeButtonText}>Inicio</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9F9F9' 
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
    flex: 1, // Obliga al contenedor del scroll a estirarse llenando la pantalla sin pisar el botón de abajo
  },
  scrollContainerInternal: {
    paddingHorizontal: 25, 
    paddingTop: 30, 
    paddingBottom: 20, // Padding normal porque el botón ya no flota encima
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
    borderWidth: 1, 
    borderColor: '#D8D8E8' 
  },
  iconWrapper: { 
    marginRight: 15, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  categoryLabel: { 
    fontWeight: '800', 
    color: '#333', 
    letterSpacing: 0.5 
  },
  /* 🌟 NUEVO CONTENEDOR ESTÁTICO INFERIOR */
  bottomBarContainer: {
    width: '100%',
    backgroundColor: '#F9F9F9', // Mismo color de fondo para mimetizarse perfectamente
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15, // Le da espacio por arriba y abajo al botón
    borderTopWidth: 1,
    borderColor: '#E2E8F0', // Una línea sutil para delimitar la zona de navegación de forma limpia
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