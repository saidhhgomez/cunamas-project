import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Fuente única de verdad para la barra inferior de todas las pantallas de administrador.
// Si mañana agregan/quitan un botón, se edita SOLO aquí y se refleja en toda la app.
export const NAV_ITEMS = [
  {
    key: 'inicio',
    label: 'Inicio',
    route: '/administrador/inicio',
    rutasRelacionadas: ['/administrador/inicio'],
    icon: 'home-outline',
    iconActivo: 'home',
  },
  {
    key: 'gestion',
    label: 'Gestión',
    route: '/administrador/consultas',
    rutasRelacionadas: [
      '/administrador/consultas',
      '/administrador/consultaLocales',
      '/administrador/consultasModulo',
      '/administrador/resumen',
    ],
    icon: 'briefcase-outline',
    iconActivo: 'briefcase',
  },
  {
    key: 'calculadora',
    label: 'Calculadora',
    route: '/administrador/calculadora/categoriaCalculadora',
    rutasRelacionadas: [
      '/administrador/calculadora/categoriaCalculadora'
    ],
    icon: 'calculator-outline',
    iconActivo: 'calculator',
  },
] as const;

type Props = {
  /**
   * Ruta fija que representa a la pantalla que renderiza este componente
   * (ej. '/administrador/inicio'). Se pasa como constante, NO desde
   * usePathname(), porque justo después de un router.replace() (como el
   * redirect del login) el pathname puede tardar un ciclo de render en
   * actualizarse y provoca un replace fantasma sobre la misma pantalla.
   */
  rutaActual: string;
  /** Alto seguro inferior (insets.bottom) para no invadir la barra de gestos. */
  insetsBottom?: number;
};

export default function BottomNavAdmin({ rutaActual, insetsBottom = 0 }: Props) {
  const router = useRouter();

  return (
    <View style={[styles.bottomNav, { height: 68 + insetsBottom, paddingBottom: insetsBottom }]}>
      {NAV_ITEMS.map((item) => {
        const activo = item.rutasRelacionadas.includes(rutaActual);
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.navItem}
            activeOpacity={0.6}
            onPress={() => {
              if (item.route !== rutaActual) {
                router.replace(item.route);
              }
            }}
          >
            <Ionicons
              name={activo ? item.iconActivo : item.icon}
              size={22}
              color={activo ? '#006080' : '#757575'}
            />
            <Text style={[styles.navLabel, activo && styles.navLabelActivo]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
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
  navLabelActivo: { color: '#006080', fontWeight: 'bold' },
});