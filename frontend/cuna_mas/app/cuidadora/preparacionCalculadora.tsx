import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  useWindowDimensions
} from 'react-native';
import { 
  Undo2, 
  Home 
} from 'lucide-react-native';
import { useRouter } from 'expo-router'; // 🌟 Cambiado a Expo Router

const PREPARATION_TYPES = [
  { id: '1', title: 'ARROZ' },
  { id: '2', title: 'FIDEOS' },
  { id: '3', title: 'QUINUA' },
  { id: '4', title: 'TRIGO' },
];

export default function TipoPreparacion() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const esPantallaGrande = width > 600;

  return (
    <SafeAreaView style={styles.container}>
      
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

      {/* 📜 LISTADO CON ENVOLTORIO FLEXIBLE */}
      <View style={styles.scrollWrapper}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainerInternal}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionTitle, { fontSize: esPantallaGrande ? 42 : 32 }]}>
            Tipo de{"\n"}Preparacion
          </Text>

          <View style={styles.list}>
            {PREPARATION_TYPES.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.optionCard, { height: esPantallaGrande ? 82 : 70 }]}
                activeOpacity={0.7}
                onPress={() => console.log(`Seleccionado: ${item.title}`)}
              >
                <Text style={[styles.optionText, { fontSize: esPantallaGrande ? 22 : 18 }]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 🌟 BOTÓN FIJO EN LA PARTE INFERIOR (Fuera del Scroll, igual que Calculadora) */}
      <View style={styles.bottomBarContainer}>
        <TouchableOpacity 
          style={styles.homeButtonCircle}
          onPress={() => router.replace('/inicio')}
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
    backgroundColor: '#F9F9F9', // Mismo fondo limpio que la calculadora
  },
  header: {
    backgroundColor: '#C5D800', // Verde Lima
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
    backgroundColor: '#D10069', // Fucsia/Cereza
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
    flex: 1, // Obliga al scroll a usar el espacio justo sin pisar la barra inferior
  },
  scrollContainerInternal: {
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 20, // Padding seguro normal
  },
  sectionTitle: {
    fontWeight: '900',
    color: '#00AEEF', // Azul Brillante
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
    borderWidth: 2,
    borderColor: '#C5BBE3', // Púrpura suave
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  optionText: {
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
  },
  /* 🌟 CONTENEDOR ESTÁTICO IGUAL A CALCULADORA */
  bottomBarContainer: {
    width: '100%',
    backgroundColor: '#F9F9F9', 
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15, 
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