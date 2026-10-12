import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react-native';

export type TipoModalMensaje = 'exito' | 'error' | 'atencion' | 'confirmacion';

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
  /** Callback del botón de confirmar (solo tipo confirmacion). */
  onConfirmar?: () => void;
  textoConfirmar?: string;
  textoCancelar?: string;
  /** Usa el rosa institucional en el botón de confirmar (acciones destructivas). */
  variantePeligro?: boolean;
};

/**
 * Modal de resultado (éxito / error / atención / confirmación) reutilizable.
 * Reemplaza a Alert.alert para tener una presentación consistente
 * y con la identidad visual del proyecto.
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
  onConfirmar,
  textoConfirmar,
  textoCancelar,
  variantePeligro,
}: Props) {
  const esExito = tipo === 'exito';
  const esError = tipo === 'error';
  const esConfirmacion = tipo === 'confirmacion';

  const colorBoton = colorAccento
    ?? (esExito ? '#C5D800' : esError || variantePeligro ? '#FF0080' : '#006080');
  const colorTextoBoton = esExito && !colorAccento ? '#006080' : '#FFFFFF';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View
            style={[
              styles.iconWrapper,
              esExito ? styles.iconExito : esError ? styles.iconError : styles.iconAtencion,
            ]}
          >
            {esExito ? (
              <CheckCircle2 color="#738000" size={40} strokeWidth={2.5} />
            ) : esError ? (
              <XCircle color="#FF0080" size={40} strokeWidth={2.5} />
            ) : esConfirmacion ? (
              <HelpCircle color="#006080" size={40} strokeWidth={2.5} />
            ) : (
              <AlertTriangle color="#006080" size={40} strokeWidth={2.5} />
            )}
          </View>

          <Text style={styles.titulo} maxFontSizeMultiplier={1.5}>{titulo}</Text>
          <Text style={styles.mensaje} maxFontSizeMultiplier={1.5}>{mensaje}</Text>

          {children ? <View style={styles.childrenWrapper}>{children}</View> : null}

          {esConfirmacion ? (
            <View style={styles.botonesFila}>
              <TouchableOpacity
                style={styles.botonCancelar}
                onPress={onCerrar}
                activeOpacity={0.85}
              >
                <Text style={styles.botonCancelarTexto} maxFontSizeMultiplier={1.3}>
                  {textoCancelar ?? 'CANCELAR'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.botonConfirmar, { backgroundColor: colorBoton }]}
                onPress={onConfirmar}
                activeOpacity={0.85}
              >
                <Text style={[styles.botonTexto, { color: colorTextoBoton }]} maxFontSizeMultiplier={1.3}>
                  {textoConfirmar ?? 'CONFIRMAR'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.boton, { backgroundColor: colorBoton }]}
              onPress={onCerrar}
              activeOpacity={0.85}
            >
              <Text style={[styles.botonTexto, { color: colorTextoBoton }]} maxFontSizeMultiplier={1.3}>
                {textoBoton ?? (esExito ? 'CONTINUAR' : 'ENTENDIDO')}
              </Text>
            </TouchableOpacity>
          )}
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
  iconExito: { backgroundColor: '#F3F8C9' },
  iconError: { backgroundColor: '#FFE0EF' },
  iconAtencion: { backgroundColor: '#E0F4F8' },
  titulo: { fontSize: 19, fontWeight: '900', color: '#1E293B', textAlign: 'center', marginBottom: 8, flexShrink: 1 },
  mensaje: { fontSize: 14, fontWeight: '500', color: '#64748B', textAlign: 'center', lineHeight: 20, flexShrink: 1 },
  childrenWrapper: { width: '100%', marginTop: 16, marginBottom: 8 },
  boton: { width: '100%', minHeight: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginTop: 16, paddingVertical: 10, paddingHorizontal: 12 },
  botonTexto: { fontWeight: '900', fontSize: 14, flexShrink: 1, textAlign: 'center' },
  botonesFila: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 16,
    gap: 10,
  },
  botonCancelar: {
    flex: 1,
    minHeight: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: '#F1F5F9',
  },
  botonCancelarTexto: { fontWeight: '900', fontSize: 13, color: '#64748B', flexShrink: 1, textAlign: 'center' },
  botonConfirmar: {
    flex: 1,
    minHeight: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
});
