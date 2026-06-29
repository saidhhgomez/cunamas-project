import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  FlatList,
  useWindowDimensions 
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router'; // 🚀 Enrutamiento nativo

export default function AsistenciaStatsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const esPantallaGrande = width > 600;

  // Estado con tus métricas e indicadores de color
  const [stats] = useState([
    { id: '1', label: "Niños de 6 a 8 Meses", value: 2, color: '#C5D800' },
    { id: '2', label: "Niños de 9 a 11 Meses", value: 2, color: '#FF7A00' },
    { id: '3', label: "Niños de 12 a 23 Meses", value: 5, color: '#00D12E' },
    { id: '4', label: "Niños de 24 a 36 Meses", value: 3, color: '#00AEEF' },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header con botón Volver Responsivo */}
      <View style={[styles.header, { height: esPantallaGrande ? 150 : 120 }]}>
        <TouchableOpacity 
          style={[styles.backButton, { width: esPantallaGrande ? 160 : 135, height: esPantallaGrande ? 50 : 44 }]}
          onPress={() => router.back()} // Retorna de forma nativa en la pila
          activeOpacity={0.8}
        >
          <View style={styles.backContent}>
            <ArrowLeft color="#FFF" size={esPantallaGrande ? 24 : 20} strokeWidth={3} />
            <Text style={[styles.backText, { fontSize: esPantallaGrande ? 16 : 14 }]}>VOLVER</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Listado de Estadísticas mediante FlatList Responsivo */}
      <FlatList
        data={stats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.scrollContent, 
          esPantallaGrande && styles.tabletContent
        ]}
        showsVerticalScrollIndicator={false}
        
        // Cabecera para el título del módulo
        ListHeaderComponent={
          <Text style={[styles.title, { fontSize: esPantallaGrande ? 38 : 32 }]}>
            EXPLORADORES
          </Text>
        }
        
        // Renderizado del indicador de métricas
        renderItem={({ item }) => (
          <View style={styles.statItem}>
            <Text style={[styles.statLabel, { fontSize: esPantallaGrande ? 18 : 16 }]}>
              {item.label}
            </Text>
            <Text style={[styles.statValue, { color: item.color, fontSize: esPantallaGrande ? 36 : 30 }]}>
              {item.value}
            </Text>
          </View>
        )}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    backgroundColor: '#C5D800',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: 'center',
    paddingHorizontal: '6%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    backgroundColor: '#FF007A',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  backContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingHorizontal: '6%',
    paddingBottom: 30,
    width: '100%',
  },
  tabletContent: {
    maxWidth: 550,
    alignSelf: 'center',
  },
  title: {
    fontWeight: '900',
    color: '#00AEEF',
    marginTop: 25,
    marginBottom: 35,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    paddingBottom: 16,
  },
  statLabel: {
    fontWeight: '700',
    color: '#334155',
    flex: 1,
    lineHeight: 22,
  },
  statValue: {
    fontWeight: '900',
    marginLeft: 15,
  },
});