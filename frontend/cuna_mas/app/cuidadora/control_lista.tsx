import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  useWindowDimensions 
} from 'react-native';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

import { CategoriaService } from '../../service/categoriaService';
import { AsistenciaService } from '../../service/asistenciaService';

const COLORES_INDICADORES = ['#C5D800', '#FF7A00', '#00D12E', '#00AEEF'];

export default function AsistenciaStatsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  
  const params = useLocalSearchParams();
  const idModuloReal = params.idModulo ? Number(params.idModulo) : 1; 
  const nombreModuloReal = params.nombreModulo ? String(params.nombreModulo) : "MODULO INICIAL";

  const esPantallaGrande = width > 600;

  const [categorias, setCategorias] = useState<any[]>([]);
  const [valoresAsistencia, setValoresAsistencia] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const datosCategorias = await CategoriaService.getListaCategorias();
        setCategorias(datosCategorias);

        const mapaInicial: { [key: number]: string } = {};
        datosCategorias.forEach((cat: any) => {
          mapaInicial[cat.idCategoriaGrupo] = "0";
        });
        setValoresAsistencia(mapaInicial);
      } catch (error) {
        console.error("Error al cargar categorías de asistencia:", error);
        Alert.alert("Error", "No se pudo sincronizar el catálogo.");
      } finally {
        setLoading(false);
      }
    };

    cargarCategorias();
  }, [idModuloReal]);

  const manejarCambioCantidad = (idCategoriaGrupo: number, texto: string) => {
    const textoLimpio = texto.replace(/[^0-9]/g, '');
    setValoresAsistencia(prev => ({
      ...prev,
      [idCategoriaGrupo]: textoLimpio === '' ? '0' : textoLimpio
    }));
  };

  const manejarGuardarAsistencia = async () => {
    setEnviando(true);
    try {
      const categoriasPayload = categorias.map((cat) => ({
        idCategoriaGrupo: cat.idCategoriaGrupo,
        cantidad: Number(valoresAsistencia[cat.idCategoriaGrupo] || 0)
      }));

      const payload = {
        idModulo: idModuloReal,
        idUsuarioCreacion: user?.idUsuario || 1, 
        registroCorrelativo: 2, 
        categorias: categoriasPayload
      };

      await AsistenciaService.registrarAsistenciaCiai(payload);
      
      Alert.alert("¡Éxito!", "Asistencia agregada correctamente.", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error("Error en el POST de asistencia:", error);
      Alert.alert("Error", "No se pudo guardar el registro.");
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer} accessible={false}>
        <ActivityIndicator size="large" color="#00AEEF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header Curvado de la Imagen */}
      <View style={[styles.header, { height: esPantallaGrande ? 140 : 115 }]}>
        <TouchableOpacity 
          style={[styles.backButton, { width: esPantallaGrande ? 150 : 125, height: esPantallaGrande ? 46 : 40 }]}
          onPress={() => router.back()}
          activeOpacity={0.85}
          focusable={true}
        >
          <View style={styles.backContent}>
            <ArrowLeft color="#FFF" size={esPantallaGrande ? 22 : 18} strokeWidth={3} />
            <Text style={[styles.backText, { fontSize: esPantallaGrande ? 15 : 13 }]}>VOLVER</Text>
          </View>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categorias}
        keyExtractor={(item) => item.idCategoriaGrupo.toString()}
        contentContainerStyle={[
          styles.scrollContent, 
          esPantallaGrande && styles.tabletContent
        ]}
        showsVerticalScrollIndicator={false}
        
        ListHeaderComponent={
          <Text style={[styles.title, { fontSize: esPantallaGrande ? 34 : 28 }]}>
            {nombreModuloReal.toUpperCase()}
          </Text>
        }
        
        renderItem={({ item, index }) => {
          const colorNumero = COLORES_INDICADORES[index % COLORES_INDICADORES.length];
          return (
            /* Tarjeta horizontal optimizada para evitar saltos de línea feos */
            <View style={styles.cardItem}>
              <Text style={[styles.statLabel, { fontSize: esPantallaGrande ? 16 : 15 }]}>
                Niños de {item.nombreCategoria}
              </Text>
              
              {/* Casilla limpia a la derecha para el número */}
              <View style={[styles.inputContainer, { borderColor: colorNumero }]}>
                <TextInput
                  style={[styles.statInput, { color: colorNumero, fontSize: esPantallaGrande ? 24 : 20 }]}
                  keyboardType="numeric"
                  value={valoresAsistencia[item.idCategoriaGrupo]}
                  onChangeText={(texto) => manejarCambioCantidad(item.idCategoriaGrupo, texto)}
                  selectTextOnFocus
                />
              </View>
            </View>
          );
        }}

        ListFooterComponent={
          <TouchableOpacity 
            style={[styles.submitButton, enviando && styles.disabledButton]}
            onPress={manejarGuardarAsistencia}
            disabled={enviando}
            activeOpacity={0.85}
            focusable={true}
          >
            {enviando ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <View style={styles.submitContent}>
                <Plus color="#FFF" size={20} strokeWidth={3} />
                <Text style={styles.submitText}>AGREGAR</Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#F8FAFC' 
  },
  header: { 
    backgroundColor: '#C5D800', 
    borderBottomLeftRadius: 35, 
    borderBottomRightRadius: 35, 
    justifyContent: 'center', 
    paddingHorizontal: 24, // Cambiado de '6%' a valor numérico estándar
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3 
  },
  backButton: { 
    backgroundColor: '#FF007A', 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  backContent: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  backText: { 
    color: '#FFF', 
    fontWeight: '800', 
    marginLeft: 4, 
  },
  scrollContent: { 
    paddingHorizontal: 20, // Cambiado de '5%' a numérico para evitar conflictos de tipo
    paddingBottom: 40, 
    width: '100%' 
  },
  tabletContent: { 
    maxWidth: 500, 
    alignSelf: 'center' 
  },
  title: { 
    fontWeight: '900', 
    color: '#00AEEF', 
    marginTop: 25, 
    marginBottom: 25, 
    textAlign: 'center' 
  },
  cardItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#FFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1.5 
  },
  statLabel: { 
    fontWeight: '700', 
    color: '#334155', 
    flex: 1, 
    paddingRight: 8,
  },
  inputContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    width: 68,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2, 
  },
  statInput: { 
    fontWeight: '900', // Validado en '900' (estilo string correcto)
    textAlign: 'center', 
    width: '100%',
    paddingVertical: 0 
  },
  submitButton: { 
    backgroundColor: '#FF007A', 
    height: 52, 
    borderRadius: 26, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 20, 
    shadowColor: '#FF007A', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 5, 
    elevation: 4 
  },
  disabledButton: { 
    backgroundColor: '#CBD5E1', 
    shadowColor: 'transparent' 
  },
  submitContent: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  submitText: { 
    color: '#FFF', 
    fontWeight: '800', 
    fontSize: 16, 
    marginLeft: 6, 
    letterSpacing: 0.5 
  }
});