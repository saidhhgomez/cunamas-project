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
    route: '/cuidadora/inicio',
    rutasRelacionadas: ['/cuidadora/inicio'],
    icon: 'home-outline',
    iconActivo: 'home',
  }
  // 👉 Para agregar un nuevo botón al nav, solo se suma un objeto aquí.
  // Ejemplo:
  // {
  //   key: 'usuarios',
  //   label: 'Usuarios',
  //   route: '/administrador/usuarios',
  //   rutasRelacionadas: ['/administrador/usuarios'],
  //   icon: 'people-outline',
  //   iconActivo: 'people',
  // },
] as const;

// Tipo derivado de las keys existentes en NAV_ITEMS, para tener autocompletado
// y evitar typos al indicar qué botones mostrar en cada pantalla.
export type NavItemKey = typeof NAV_ITEMS[number]['key'];

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
  /**
   * Lista opcional de keys de los botones que se deben mostrar en esta
   * pantalla puntual (ej. ['inicio', 'calculadora']). Si se omite, se
   * muestran TODOS los botones definidos en NAV_ITEMS (comportamiento
   * por defecto, compatible con las pantallas que ya usan el componente
   * sin este prop).
   *
   * Útil para pantallas donde un botón no aplica — por ejemplo, una
   * pantalla dentro del flujo de la calculadora donde no tiene sentido
   * mostrar el ícono de "Calculadora" porque ya estás ahí, o una pantalla
   * de solo lectura donde no corresponde mostrar cierto acceso.
   */
  itemsVisibles?: NavItemKey[];
};

export default function BottomNavCocina({ rutaActual, insetsBottom = 0, itemsVisibles }: Props) {
  const router = useRouter();

  // Si no se especifica itemsVisibles, se muestran todos los ítems (comportamiento actual).
  const itemsAMostrar = itemsVisibles
    ? NAV_ITEMS.filter((item) => itemsVisibles.includes(item.key))
    : NAV_ITEMS;

  return (
    <View style={[styles.bottomNav, { height: 68 + insetsBottom, paddingBottom: insetsBottom }]}>
      {itemsAMostrar.map((item) => {
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