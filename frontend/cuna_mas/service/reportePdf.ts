import { api } from "./api";

export const ReportePDF = {
  /**
   * Obtiene el reporte PDF en base64 desde el backend.
   * IMPORTANTE: se pide como arraybuffer porque el backend devuelve
   * el PDF binario crudo, no un string base64. Lo convertimos acá.
   */
  async obtenerReportePdfBase64(
    idCentro: number,
    fecha: string,
    correlativo: number
  ): Promise<string> {
    const response = await api.get(`/calculadora/reporte-pdf/${idCentro}`, {
      params: { fecha, correlativo },
      responseType: 'arraybuffer', // 👈 clave: pedimos binario, no texto
    });

    // Convertimos el ArrayBuffer a base64 manualmente
    const bytes = new Uint8Array(response.data);
    let binario = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binario += String.fromCharCode(bytes[i]);
    }

    // btoa está disponible en el runtime de RN/Hermes moderno
    return btoa(binario);
  },
};