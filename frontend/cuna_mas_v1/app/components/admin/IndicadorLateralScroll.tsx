import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

// Ajusta estos valores si tu lista ocupa más o menos alto de pantalla.
const ALTURA_TRACK = 220;
const ALTURA_THUMB = 42;

type Props = {
  /** Controla si el indicador está visible (aparece al hacer scroll, se oculta al detenerse) */
  visible: boolean;
  /** Progreso de 0 a 1 dentro de la lista (0 = arriba del todo, 1 = abajo del todo) */
  progreso: number;
  /** Número a mostrar dentro de la burbuja (por defecto, la página actual cargada) */
  valor: number | string;
};

/**
 * Barra lateral de navegación con burbuja indicadora, similar al índice
 * rápido de contactos en iOS. Se usa junto al scroll de un FlatList:
 * el padre calcula `progreso` (0-1) a partir de contentOffset/contentSize
 * y controla `visible` con un pequeño timeout tras dejar de scrollear.
 */
export default function IndicadorLateralScroll({ visible, progreso, valor }: Props) {
  const progresoClamp = Math.min(Math.max(progreso, 0), 1);
  const posicionVertical = progresoClamp * (ALTURA_TRACK - ALTURA_THUMB);

  return (
    <View style={styles.wrapper} pointerEvents="none">
      <View
        style={[
          styles.track,
          { opacity: visible ? 1 : 0 },
        ]}
      >
        <View style={styles.trackInner}>
          <View style={[styles.thumb, { top: posicionVertical }]} />
        </View>
      </View>

      <View
        style={[
          styles.badge,
          { top: posicionVertical + (ALTURA_THUMB - 28) / 2, opacity: visible ? 1 : 0 },
        ]}
      >
        <Text style={styles.badgeTexto}>{valor}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    right: 6,
    top: '50%',
    marginTop: -(ALTURA_TRACK / 2),
    height: ALTURA_TRACK,
    justifyContent: 'center',
    zIndex: 20,
  },
  track: {
    width: 20,
    height: ALTURA_TRACK,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    paddingVertical: 6,
  },
  trackInner: {
    width: 5,
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  thumb: {
    position: 'absolute',
    width: 5,
    height: ALTURA_THUMB,
    borderRadius: 3,
    backgroundColor: '#006080',
  },
  badge: {
    position: 'absolute',
    right: 28,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  badgeTexto: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});