import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, StatusBar, Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ReportePDF } from '../../service/reportePdf';
import { CentroAlimentarioService } from '../../service/servicioAlimentario';
import { useAuth } from '../../context/AuthContext';
import HeaderCocina from '../components/sociaCocina/HeaderCocina';
import BottomNavCocina from '../components/sociaCocina/BottomNavCocina';

const CORRELATIVOS = [
  { value: 1, label: 'Mañana', icon: 'sunny-outline' },
  { value: 2, label: 'Tarde', icon: 'partly-sunny-outline' },
];

const formatearFecha = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatearFechaVisual = (date: Date) => {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

const obtenerIdServicioAlimentario = (centro: any) => centro.idCentroAlimentario;

// Guardamos la carpeta de Descargas elegida por el usuario en un archivo de
// preferencias propio, para pedir el permiso UNA sola vez y no volver a
// mostrar el selector de carpeta en descargas futuras.
const ARCHIVO_PREFERENCIA_CARPETA = `${FileSystem.documentDirectory}carpeta-descargas.json`;

const obtenerCarpetaGuardada = async (): Promise<string | null> => {
  try {
    const info = await FileSystem.getInfoAsync(ARCHIVO_PREFERENCIA_CARPETA);
    if (!info.exists) return null;
    const contenido = await FileSystem.readAsStringAsync(ARCHIVO_PREFERENCIA_CARPETA);
    const datos = JSON.parse(contenido);
    return datos.directoryUri || null;
  } catch {
    return null;
  }
};

const guardarCarpetaElegida = async (directoryUri: string) => {
  try {
    await FileSystem.writeAsStringAsync(
      ARCHIVO_PREFERENCIA_CARPETA,
      JSON.stringify({ directoryUri })
    );
  } catch (err) {
    console.warn('No se pudo guardar la preferencia de carpeta:', err);
  }
};

export default function SeleccionarReportePdf() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const RUTA_ACTUAL = '/asistente/reportePdf';

  const [fecha, setFecha] = useState(new Date());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [correlativo, setCorrelativo] = useState(1);

  const [centros, setCentros] = useState<any[]>([]);
  const [idCentro, setIdCentro] = useState<number | null>(
    params.idCentro ? Number(params.idCentro) : null
  );
  const [cargandoCentros, setCargandoCentros] = useState(true);
  const [errorCentros, setErrorCentros] = useState<string | null>(null);

  const [generando, setGenerando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [base64Pdf, setBase64Pdf] = useState<string | null>(null);

  // Bloquea el formulario una vez generado el reporte
  const [reporteGenerado, setReporteGenerado] = useState(false);

  useEffect(() => {
    const cargarCentros = async () => {
      try {
        setCargandoCentros(true);
        setErrorCentros(null);
        const resultado = await CentroAlimentarioService.getCentrosPorDistrito(0, 100);
        setCentros(resultado.centros);
      } catch (err) {
        console.error('Error al cargar servicios alimentarios:', err);
        setErrorCentros('No se pudo cargar la lista de servicios alimentarios.');
      } finally {
        setCargandoCentros(false);
      }
    };
    cargarCentros();
  }, []);

  const avisarCambioYResetear = (accionQueCambia: () => void) => {
    if (reporteGenerado) {
      Alert.alert('Atención', 'Cambiaste un filtro. Debes volver a generar el reporte.');
    }
    accionQueCambia();
    setReporteGenerado(false);
    setBase64Pdf(null);
  };

  const manejarCambioFecha = (event: any, fechaSeleccionada?: Date) => {
    setMostrarCalendario(Platform.OS === 'ios');
    if (fechaSeleccionada) {
      avisarCambioYResetear(() => setFecha(fechaSeleccionada));
    }
  };

  const manejarGenerar = async () => {
    try {
      setGenerando(true);
      setBase64Pdf(null);

      if (!idCentro) {
        throw new Error('Selecciona un servicio alimentario.');
      }

      const base64 = await ReportePDF.obtenerReportePdfBase64(
        Number(idCentro),
        formatearFecha(fecha),
        Number(correlativo)
      );

      if (!base64) {
        throw new Error('El servidor no devolvió el PDF.');
      }

      setBase64Pdf(base64);
      setReporteGenerado(true);
    } catch (err: any) {
      console.error('Error al generar el reporte:', err);
      Alert.alert('Error', err?.message || 'No se pudo generar el reporte. Intenta nuevamente.');
    } finally {
      setGenerando(false);
    }
  };

  const manejarDescargar = async () => {
    if (!base64Pdf) return;

    const nombreArchivo = `reporte-${formatearFecha(fecha)}-${correlativo}.pdf`;

    try {
      setGuardando(true);

      if (Platform.OS === 'android') {
        let directoryUri = await obtenerCarpetaGuardada();

        if (!directoryUri) {
          const permisos = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (!permisos.granted) {
            Alert.alert(
              'Permiso necesario',
              'Debes seleccionar la carpeta de Descargas para poder guardar el archivo ahí.'
            );
            return;
          }
          directoryUri = permisos.directoryUri;
          await guardarCarpetaElegida(directoryUri);
        }

        let uriArchivoFinal: string;
        try {
          uriArchivoFinal = await FileSystem.StorageAccessFramework.createFileAsync(
            directoryUri,
            nombreArchivo,
            'application/pdf'
          );
          await FileSystem.writeAsStringAsync(uriArchivoFinal, base64Pdf, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } catch (errCarpetaInvalida) {
          console.warn('Carpeta guardada inválida, se pedirá de nuevo:', errCarpetaInvalida);
          const permisos = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (!permisos.granted) {
            Alert.alert('Permiso necesario', 'Debes seleccionar una carpeta para guardar el archivo.');
            return;
          }
          await guardarCarpetaElegida(permisos.directoryUri);
          uriArchivoFinal = await FileSystem.StorageAccessFramework.createFileAsync(
            permisos.directoryUri,
            nombreArchivo,
            'application/pdf'
          );
          await FileSystem.writeAsStringAsync(uriArchivoFinal, base64Pdf, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }

        const copiaCache = `${FileSystem.cacheDirectory}${nombreArchivo}`;
        await FileSystem.writeAsStringAsync(copiaCache, base64Pdf, {
          encoding: FileSystem.EncodingType.Base64,
        });

        try {
          const contentUri = await FileSystem.getContentUriAsync(copiaCache);
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: contentUri,
            flags: 1,
            type: 'application/pdf',
          });
        } catch (errAbrirDirecto) {
          console.warn('No se pudo abrir directo:', errAbrirDirecto);
          Alert.alert(
            'Guardado',
            'El reporte se guardó en la carpeta seleccionada. No se pudo abrir automáticamente porque no hay una app de PDF instalada.'
          );
        }
      } else {
        const destino = `${FileSystem.documentDirectory}${nombreArchivo}`;
        await FileSystem.writeAsStringAsync(destino, base64Pdf, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const disponible = await Sharing.isAvailableAsync();
        if (!disponible) {
          Alert.alert('No disponible', 'Compartir archivos no está disponible en este dispositivo.');
          return;
        }
        await Sharing.shareAsync(destino, {
          mimeType: 'application/pdf',
          dialogTitle: 'Guardar o abrir reporte',
          UTI: 'com.adobe.pdf',
        });
      }
    } catch (err) {
      console.error('Error al guardar el PDF:', err);
      Alert.alert('Error', 'No se pudo guardar el archivo.');
    } finally {
      setGuardando(false);
    }
  };

  const manejarNuevoReporte = () => {
    setReporteGenerado(false);
    setBase64Pdf(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#C5D800" />

      {/* FIX: antes era onPress={() => router.back} (sin ejecutar la función,
          por eso el botón no reaccionaba). Ahora sí llama router.back(). */}
      <HeaderCocina
        user={user}
        titulo=""
        modo="volver"
        onPress={() => router.back()}
      />

      <View style={styles.titleBar}>
        <Text style={styles.headerTitle}>Generar Reporte</Text>
        <Text style={styles.headerSubtitle}>
          Selecciona los filtros para generar tu reporte en PDF
        </Text>
      </View>

      <View style={styles.content}>

        {reporteGenerado && (
          <View style={styles.bannerGenerado}>
            <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
            <Text style={styles.bannerGeneradoTexto}>
              Reporte generado. Solo puedes descargarlo, o toca "Nuevo reporte" para cambiar filtros.
            </Text>
          </View>
        )}

        <Text style={styles.label}>Servicio Alimentario</Text>
        <View style={[styles.pickerWrapper, reporteGenerado && styles.deshabilitado]}>
          {cargandoCentros ? (
            <View style={styles.pickerLoading}>
              <ActivityIndicator size="small" color="#006080" />
            </View>
          ) : errorCentros ? (
            <View style={styles.pickerLoading}>
              <Text style={styles.errorTexto}>{errorCentros}</Text>
            </View>
          ) : (
            <Picker
              enabled={!reporteGenerado}
              selectedValue={idCentro}
              onValueChange={(valor) => {
                if (valor === null) return;
                avisarCambioYResetear(() => setIdCentro(valor));
              }}
              style={styles.picker}
            >
              <Picker.Item label="Seleccione un servicio..." value={null} />
              {centros.map((centro) => (
                <Picker.Item
                  key={obtenerIdServicioAlimentario(centro)}
                  label={centro.nombreCentro}
                  value={obtenerIdServicioAlimentario(centro)}
                />
              ))}
            </Picker>
          )}
        </View>

        <Text style={styles.label}>Fecha</Text>
        <TouchableOpacity
          style={[styles.fechaSelector, reporteGenerado && styles.deshabilitado]}
          onPress={() => !reporteGenerado && setMostrarCalendario(true)}
          activeOpacity={0.8}
          disabled={reporteGenerado}
        >
          <Ionicons name="calendar-outline" size={20} color="#006080" />
          <Text style={styles.fechaTexto}>{formatearFechaVisual(fecha)}</Text>
        </TouchableOpacity>

        {mostrarCalendario && (
          <DateTimePicker
            value={fecha}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            maximumDate={new Date()}
            onChange={manejarCambioFecha}
          />
        )}
        {Platform.OS === 'ios' && mostrarCalendario && (
          <TouchableOpacity
            style={styles.confirmarFechaBtn}
            onPress={() => setMostrarCalendario(false)}
          >
            <Text style={styles.confirmarFechaTexto}>Confirmar fecha</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.label}>Turno</Text>
        <View style={styles.correlativoRow}>
          {CORRELATIVOS.map((item) => {
            const seleccionado = correlativo === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.correlativoBtn,
                  seleccionado && styles.correlativoBtnActivo,
                  reporteGenerado && styles.deshabilitado,
                ]}
                onPress={() => {
                  if (reporteGenerado) return;
                  avisarCambioYResetear(() => setCorrelativo(item.value));
                }}
                activeOpacity={0.8}
                disabled={reporteGenerado}
              >
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={seleccionado ? '#FFFFFF' : '#006080'}
                />
                <Text style={[
                  styles.correlativoTexto,
                  seleccionado && styles.correlativoTextoActivo,
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Botón Generar (solo visible si NO está generado) */}
        {!reporteGenerado && (
          <TouchableOpacity
            style={[styles.actionButton, styles.generarButton]}
            onPress={manejarGenerar}
            disabled={generando || cargandoCentros}
            activeOpacity={0.85}
          >
            {generando ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Ionicons name="document-text-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.actionButtonText}>GENERAR</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Botón Nuevo reporte + Descargar debajo, ambos visibles solo si YA está generado */}
        {reporteGenerado && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.nuevoReporteButton]}
              onPress={manejarNuevoReporte}
              activeOpacity={0.85}
            >
              <Ionicons name="refresh-outline" size={20} color="#006080" style={{ marginRight: 8 }} />
              <Text style={styles.nuevoReporteButtonText}>NUEVO REPORTE</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.downloadButtonContent]}
              onPress={manejarDescargar}
              disabled={guardando}
              activeOpacity={0.85}
            >
              {guardando ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Ionicons name="download-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.downloadButtonText}>DESCARGAR</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}

      </View>

      {/* Footer: solo el nav inferior fijo, ya no compite con los botones de acción */}
        <BottomNavCocina rutaActual={RUTA_ACTUAL} insetsBottom={insets.bottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },

  titleBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 22, color: '#006080', fontWeight: '900' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 4, fontWeight: '500' },

  content: { flex: 1, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },

  bannerGenerado: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4',
    borderRadius: 12, padding: 12, marginTop: 16, gap: 8,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  bannerGeneradoTexto: { flex: 1, fontSize: 12, color: '#166534', fontWeight: '600' },

  label: { fontSize: 13, fontWeight: 'bold', color: '#006080', marginBottom: 6, marginTop: 16 },
  fechaSelector: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 14, height: 50,
  },
  fechaTexto: { marginLeft: 10, fontSize: 15, color: '#1E293B', fontWeight: '600' },
  confirmarFechaBtn: { alignSelf: 'flex-end', marginTop: 6, paddingVertical: 6, paddingHorizontal: 12 },
  confirmarFechaTexto: { color: '#006080', fontWeight: 'bold' },
  pickerWrapper: {
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1,
    borderColor: '#E2E8F0', overflow: 'hidden',
  },
  picker: { height: 50, color: '#1E293B' },
  pickerLoading: { height: 50, justifyContent: 'center', alignItems: 'center' },
  errorTexto: { color: '#DC2626', fontSize: 12, fontWeight: '600', paddingHorizontal: 10 },

  deshabilitado: { opacity: 0.5 },

  correlativoRow: { flexDirection: 'row', gap: 12 },
  correlativoBtn: {
    flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', height: 50, gap: 8,
  },
  correlativoBtnActivo: { backgroundColor: '#006080', borderColor: '#006080' },
  correlativoTexto: { fontSize: 14, fontWeight: 'bold', color: '#006080' },
  correlativoTextoActivo: { color: '#FFFFFF' },

  actionButton: {
    height: 52, borderRadius: 26, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', marginTop: 14,
  },
  generarButton: { backgroundColor: '#16A34A', marginTop: 24 },
  nuevoReporteButton: {
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#006080', marginTop: 24,
  },
  nuevoReporteButtonText: { color: '#006080', fontWeight: 'bold', fontSize: 14 },
  actionButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },

  // Antes vivía en el footer; ahora es el mismo botón pero dentro del content,
  // debajo de "NUEVO REPORTE".
  downloadButtonContent: { backgroundColor: '#006080' },
  downloadButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },

  footerBar: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#E2E8F0',
  },
});