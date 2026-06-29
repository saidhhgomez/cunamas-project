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
import { UserRound, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router'; // 🚀 Navegación nativa de Expo Router

export default function LocalesServicioScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const esPantallaGrande = width > 600;

  // Estado con tus categorías fijas
  const [categorias] = useState([
    { id: '1', name: "EXPLORADORES" },
    { id: '2', name: "CAMINADORES" },
    { id: '3', name: "AVENTUREROS" },
  ]);

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header con botón Volver Responsivo */}
      <View style={[styles.header, { height: esPantallaGrande ? 150 : 120 }]}>
        <TouchableOpacity 
          style={[styles.backButton, { width: esPantallaGrande ? 160 : 135, height: esPantallaGrande ? 50 : 44 }]}
          onPress={() => router.back()} // Volver de manera nativa
          activeOpacity={0.8}
        >
          <View style={styles.backContent}>
            <ArrowLeft color="#FFF" size={esPantallaGrande ? 24 : 20} strokeWidth={3} />
            <Text style={[styles.backText, { fontSize: esPantallaGrande ? 16 : 14 }]}>VOLVER</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* FlatList con soporte responsivo para Mobile y Tablet */}
      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.scrollContent, 
          esPantallaGrande && styles.tabletContent
        ]}
        showsVerticalScrollIndicator={false}
        
        // Cabecera de la lista para los títulos
        ListHeaderComponent={
          <View style={styles.titleContainer}>
            <Text style={[styles.titleBlue, { fontSize: esPantallaGrande ? 26 : 22 }]}>Locales:</Text>
            <Text style={[styles.titleSubtitle, { fontSize: esPantallaGrande ? 24 : 20 }]}>Nombre del Servicio</Text>
          </View>
        }
        
        // Renderizado responsivo de ítems
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.categoryItem}
            activeOpacity={0.7}
            // Aquí puedes redirigir usando router.push
          >
            <View style={styles.iconWrapper}>
              <UserRound color="#8A2BE2" size={esPantallaGrande ? 34 : 28} strokeWidth={2.5} />
            </View>
            <Text 
              style={[styles.categoryName, { fontSize: esPantallaGrande ? 20 : 16 }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
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
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 25,
  },
  titleBlue: {
    fontWeight: '900',
    color: '#00AEEF', 
    textAlign: 'center',
  },
  titleSubtitle: {
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginTop: 4,
  },
  categoryItem: {
    width: '100%',
    height: 72,
    borderWidth: 2,
    borderColor: '#8A2BE2', 
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontWeight: '800',
    color: '#1E293B',
    marginLeft: 14,
    textTransform: 'uppercase',
    flex: 1,
  },
});