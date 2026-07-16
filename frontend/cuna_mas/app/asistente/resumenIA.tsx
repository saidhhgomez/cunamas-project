import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ---------- TIPOS ----------
type Bloque =
  | { tipo: 'subtitulo'; texto: string }
  | { tipo: 'lista'; items: string[] }
  | { tipo: 'parrafo'; texto: string };

type Seccion = {
  titulo: string;
  icono: keyof typeof Ionicons.glyphMap;
  destacada: boolean;
  bloques: Bloque[];
};

// Detecta si una línea es un título de sección grande (ALIMENTO 1:, RESUMEN EJECUTIVO, etc.)
const esTituloSeccion = (linea: string) => {
  const t = linea.trim();
  if (!t) return false;
  if (t.length > 80) return false;
  // Todo en mayúsculas (permitiendo tildes, números, espacios, dos puntos)
  const soloMayusYSimbolos = t === t.toUpperCase();
  const tieneLetras = /[A-ZÁÉÍÓÚÑ]/.test(t);
  return soloMayusYSimbolos && tieneLetras && !t.startsWith('-');
};

// Iconos que rotan para cada "ALIMENTO N" para que no se vean todos iguales
const ICONOS_ALIMENTO: (keyof typeof Ionicons.glyphMap)[] = [
  'nutrition-outline', 'leaf-outline', 'restaurant-outline', 'egg-outline', 'fish-outline', 'pizza-outline',
];

const iconoPara = (titulo: string, indiceAlimento: number): keyof typeof Ionicons.glyphMap => {
  const t = titulo.toUpperCase();
  if (t.startsWith('ALIMENTO')) return ICONOS_ALIMENTO[indiceAlimento % ICONOS_ALIMENTO.length];
  if (t.includes('ANÁLISIS GENERAL') || t.includes('ANALISIS GENERAL')) return 'analytics-outline';
  if (t.includes('RESUMEN')) return 'document-text-outline';
  return 'information-circle-outline';
};

// Parsea el texto completo en secciones -> bloques (subtítulo / lista / párrafo)
const parsearContenido = (contenido: string): Seccion[] => {
  const lineas = contenido.split('\n');
  const secciones: Seccion[] = [];
  let seccionActual: Seccion | null = null;
  let contadorAlimentos = 0;

  let bufferParrafo: string[] = [];
  let bufferLista: string[] = [];

  const cerrarParrafo = () => {
    if (bufferParrafo.length && seccionActual) {
      seccionActual.bloques.push({ tipo: 'parrafo', texto: bufferParrafo.join(' ').trim() });
    }
    bufferParrafo = [];
  };
  const cerrarLista = () => {
    if (bufferLista.length && seccionActual) {
      seccionActual.bloques.push({ tipo: 'lista', items: [...bufferLista] });
    }
    bufferLista = [];
  };

  for (const raw of lineas) {
    const linea = raw.trim();

    if (!linea) {
      cerrarParrafo();
      cerrarLista();
      continue;
    }

    if (esTituloSeccion(linea)) {
      cerrarParrafo();
      cerrarLista();
      const esResumen = linea.toUpperCase().includes('RESUMEN');
      if (linea.toUpperCase().startsWith('ALIMENTO')) contadorAlimentos++;
      seccionActual = {
        titulo: linea,
        icono: iconoPara(linea, contadorAlimentos - 1),
        destacada: esResumen,
        bloques: [],
      };
      secciones.push(seccionActual);
      continue;
    }

    if (!seccionActual) {
      // Texto antes de la primera sección detectada -> lo ignoramos o podría ser intro
      continue;
    }

    if (linea.startsWith('- ')) {
      cerrarParrafo();
      bufferLista.push(linea.replace(/^- /, ''));
      continue;
    }

    // Subtítulo corto que termina en ':' y no es una viñeta
    if (linea.endsWith(':') && linea.length < 60) {
      cerrarParrafo();
      cerrarLista();
      seccionActual.bloques.push({ tipo: 'subtitulo', texto: linea.replace(/:$/, '') });
      continue;
    }

    // Párrafo normal
    cerrarLista();
    bufferParrafo.push(linea);
  }
  cerrarParrafo();
  cerrarLista();

  return secciones;
};

// ---------- COMPONENTE ----------
export default function ResultadoIA() {
  const { data } = useLocalSearchParams<{ data: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  let respuesta: { titulo?: string; contenido?: string } | null = null;
  try {
    respuesta = data ? JSON.parse(data) : null;
  } catch {
    respuesta = null;
  }

  const secciones = respuesta?.contenido ? parsearContenido(respuesta.contenido) : [];

  const [expandidas, setExpandidas] = useState<Record<number, boolean>>({ 0: true });

  const toggleSeccion = (idx: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandidas((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerLabel}>Análisis generado por IA</Text>
          <Text style={styles.headerTitle} numberOfLines={2}>
            {respuesta?.titulo || 'Resultado'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!respuesta?.contenido ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle-outline" size={28} color="#FF003C" />
            <Text style={styles.errorText}>No se pudo cargar el resultado del análisis.</Text>
          </View>
        ) : secciones.length === 0 ? (
          // Fallback: si el parser no detectó secciones, muestra el texto plano
          <View style={styles.card}>
            <Text style={styles.parrafoText}>{respuesta.contenido}</Text>
          </View>
        ) : (
          secciones.map((seccion, idx) => {
            const abierta = !!expandidas[idx];
            const colorAcento = seccion.destacada ? '#0C447C' : '#006080';
            return (
              <View
                key={idx}
                style={[styles.card, seccion.destacada && styles.cardDestacada]}
              >
                <TouchableOpacity
                  style={styles.cardHeader}
                  activeOpacity={0.7}
                  onPress={() => toggleSeccion(idx)}
                >
                  <View style={styles.cardHeaderLeft}>
                    <Ionicons name={seccion.icono} size={20} color={colorAcento} />
                    <Text style={[styles.cardTitle, { color: colorAcento }]} numberOfLines={2}>
                      {seccion.titulo}
                    </Text>
                  </View>
                  <Ionicons name={abierta ? 'chevron-up' : 'chevron-down'} size={20} color={colorAcento} />
                </TouchableOpacity>

                {abierta && (
                  <View style={styles.cardBody}>
                    {seccion.bloques.map((bloque, bIdx) => {
                      if (bloque.tipo === 'subtitulo') {
                        return (
                          <Text key={bIdx} style={styles.subtitulo}>{bloque.texto}</Text>
                        );
                      }
                      if (bloque.tipo === 'lista') {
                        return (
                          <View key={bIdx} style={styles.listaContainer}>
                            {bloque.items.map((item, iIdx) => (
                              <View key={iIdx} style={styles.listaItem}>
                                <View style={styles.bullet} />
                                <Text style={styles.listaText}>{item}</Text>
                              </View>
                            ))}
                          </View>
                        );
                      }
                      return (
                        <Text key={bIdx} style={styles.parrafoText}>{bloque.texto}</Text>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: {
    backgroundColor: '#006080',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    gap: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerLabel: { color: '#A9E5FF', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginTop: 2 },
  content: { padding: 16, paddingBottom: 40 },
  errorBox: {
    backgroundColor: '#FFF', padding: 24, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#FFD1D1', gap: 8,
  },
  errorText: { color: '#FF003C', textAlign: 'center', fontWeight: '600' },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden',
  },
  cardDestacada: {
    backgroundColor: '#E6F1FB', borderColor: '#378ADD',
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 14,
  },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, paddingRight: 8 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#006080', flexShrink: 1 },
  cardBody: { paddingHorizontal: 14, paddingBottom: 16, paddingTop: 4, gap: 10 },
  subtitulo: { fontSize: 13, fontWeight: '700', color: '#FF8000', marginTop: 6 },
  parrafoText: { fontSize: 13.5, color: '#334155', lineHeight: 20 },
  listaContainer: { gap: 6 },
  listaItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bullet: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#006080', marginTop: 7 },
  listaText: { flex: 1, fontSize: 13.5, color: '#334155', lineHeight: 20 },
});