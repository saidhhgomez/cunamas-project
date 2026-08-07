import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { CheckCircle2, XCircle } from 'lucide-react-native';

export type TipoModalMensaje = 'exito' | 'error';

type Props = {
  visible: boolean;
  tipo: TipoModalMensaje;
  titulo: string;
  mensaje: string;
  onCerrar: () => void;
  textoBoton?: string;
  /** Color del botón cuando tipo === 'exito'. Por defecto usa el verde de éxito. */
  colorAccento?: string;
  /**
   * Contenido adicional a mostrar entre el mensaje y el botón
   * (por ejemplo, una caja destacada con una contraseña temporal).
   */
  children?: React.ReactNode;
};

/**
 * Modal de resultado (éxito / error) reutilizable en toda la app.
 * Reemplaza a Alert.alert para tener una presentación consistente
 * y con la identidad visual del proyecto, en vez del modal nativo del sistema.
 *
 * Uso:
 *   const [modalVisible, setModalVisible] = useState(false);
 *   const [modalTipo, setModalTipo] = useState<TipoModalMensaje>('error');
 *   const [modalTitulo, setModalTitulo] = useState('');
 *   const [modalMensaje, setModalMensaje] = useState('');
 *
 *   <ModalMensaje
 *     visible={modalVisible}
 *     tipo={modalTipo}
 *     titulo={modalTitulo}
 *     mensaje={modalMensaje}
 *     onCerrar={() => setModalVisible(false)}
 *   />
 */
export default function ModalMensaje({
  visible,
  tipo,
  titulo,
  mensaje,
  onCerrar,
  textoBoton,
  colorAccento,
  children,
}: Props) {
  const esExito = tipo === 'exito';
  const colorBoton = colorAccento ?? (esExito ? '#16A34A' : '#DC2626');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={[styles.iconWrapper, esExito ? styles.iconExito : styles.iconError]}>
            {esExito ? (
              <CheckCircle2 color="#16A34A" size={40} strokeWidth={2} />
            ) : (
              <XCircle color="#DC2626" size={40} strokeWidth={2} />
            )}
          </View>

          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.mensaje}>{mensaje}</Text>

          {children ? <View style={styles.childrenWrapper}>{children}</View> : null}

          <TouchableOpacity
            style={[styles.boton, { backgroundColor: colorBoton }]}
            onPress={onCerrar}
            activeOpacity={0.85}
          >
            <Text style={styles.botonTexto}>
              {textoBoton ?? (esExito ? 'CONTINUAR' : 'ENTENDIDO')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconExito: { backgroundColor: '#DCFCE7' },
  iconError: { backgroundColor: '#FEE2E2' },
  titulo: { fontSize: 19, fontWeight: '900', color: '#1E293B', textAlign: 'center', marginBottom: 8 },
  mensaje: { fontSize: 14, fontWeight: '500', color: '#64748B', textAlign: 'center', lineHeight: 20 },
  childrenWrapper: { width: '100%', marginTop: 16, marginBottom: 8 },
  boton: { width: '100%', height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  botonTexto: { color: '#FFF', fontWeight: '800', fontSize: 14 },
});