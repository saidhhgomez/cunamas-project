import { useCallback, useRef, useState } from 'react';
import type { TipoModalMensaje } from '../app/components/ModalMensaje';

export type OpcionesModalMensaje = {
  textoBoton?: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  onCerrar?: () => void;
  onConfirmar?: () => void;
  colorAccento?: string;
  variantePeligro?: boolean;
};

export function useModalMensaje() {
  const [visible, setVisible] = useState(false);
  const [tipo, setTipo] = useState<TipoModalMensaje>('error');
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [textoBoton, setTextoBoton] = useState<string | undefined>();
  const [textoConfirmar, setTextoConfirmar] = useState<string | undefined>();
  const [textoCancelar, setTextoCancelar] = useState<string | undefined>();
  const [colorAccento, setColorAccento] = useState<string | undefined>();
  const [variantePeligro, setVariantePeligro] = useState(false);
  const [esConfirmacion, setEsConfirmacion] = useState(false);

  const onCerrarExtraRef = useRef<(() => void) | undefined>();
  const onConfirmarRef = useRef<(() => void) | undefined>();

  const mostrar = useCallback((
    tipoNuevo: TipoModalMensaje,
    tituloNuevo: string,
    mensajeNuevo: string,
    opciones?: OpcionesModalMensaje,
  ) => {
    setTipo(tipoNuevo);
    setTitulo(tituloNuevo);
    setMensaje(mensajeNuevo);
    setTextoBoton(opciones?.textoBoton);
    setTextoConfirmar(opciones?.textoConfirmar);
    setTextoCancelar(opciones?.textoCancelar);
    setColorAccento(opciones?.colorAccento);
    setVariantePeligro(!!opciones?.variantePeligro);
    setEsConfirmacion(tipoNuevo === 'confirmacion');
    onCerrarExtraRef.current = opciones?.onCerrar;
    onConfirmarRef.current = opciones?.onConfirmar;
    setVisible(true);
  }, []);

  const cerrar = useCallback(() => {
    setVisible(false);
    const extra = onCerrarExtraRef.current;
    onCerrarExtraRef.current = undefined;
    extra?.();
  }, []);

  const confirmar = useCallback(() => {
    setVisible(false);
    const fn = onConfirmarRef.current;
    onConfirmarRef.current = undefined;
    fn?.();
  }, []);

  const mostrarError = useCallback((tituloNuevo: string, mensajeNuevo: string, opciones?: OpcionesModalMensaje) => {
    mostrar('error', tituloNuevo, mensajeNuevo, opciones);
  }, [mostrar]);

  const mostrarExito = useCallback((tituloNuevo: string, mensajeNuevo: string, opciones?: OpcionesModalMensaje) => {
    mostrar('exito', tituloNuevo, mensajeNuevo, opciones);
  }, [mostrar]);

  const mostrarAtencion = useCallback((tituloNuevo: string, mensajeNuevo: string, opciones?: OpcionesModalMensaje) => {
    mostrar('atencion', tituloNuevo, mensajeNuevo, opciones);
  }, [mostrar]);

  const mostrarConfirmacion = useCallback((
    tituloNuevo: string,
    mensajeNuevo: string,
    onConfirmar: () => void,
    opciones?: Omit<OpcionesModalMensaje, 'onConfirmar'>,
  ) => {
    mostrar('confirmacion', tituloNuevo, mensajeNuevo, { ...opciones, onConfirmar });
  }, [mostrar]);

  return {
    mostrar,
    mostrarError,
    mostrarExito,
    mostrarAtencion,
    mostrarConfirmacion,
    modalProps: {
      visible,
      tipo,
      titulo,
      mensaje,
      textoBoton,
      textoConfirmar,
      textoCancelar,
      colorAccento,
      variantePeligro,
      onCerrar: cerrar,
      onConfirmar: esConfirmacion ? confirmar : undefined,
    },
  };
}
