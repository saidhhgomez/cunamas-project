import {api} from '../service/api'; // <--- Ajusta la ruta a tu archivo api.ts base

// 1. Interfaces para el payload que se envía (coincide con tu JSON acumulado)
export interface CategoriaEtaria {
  ninos6a9Meses: number;
  ninos10a12Meses: number;
  ninos13a23Meses: number;
  ninos24a36Meses: number;
  actoresComunales: number;
}

export interface Presentacion {
  bolsas1kg: number;
  bolsas500g: number;
  bolsas250g: number;
}

export interface Alimento {
  nombre: string;
  categoriaEtaria: CategoriaEtaria;
  presentacion: Presentacion;
}

export interface AnalisisAlimentosPayload {
  alimentos: Alimento[];
}

// 2. Interface para la respuesta que devuelve tu backend/IA
export interface AnalisisAlimentosRespuesta {
  titulo: string;
  contenido: string;
}

/**
 * Envía el listado de alimentos acumulados al backend usando la API base.
 * @param datosAlimentos Objeto con la lista de alimentos a analizar.
 * @returns { titulo, contenido } generado por la IA.
 */
export const analizarAlimentosService = async (
  datosAlimentos: AnalisisAlimentosPayload
): Promise<AnalisisAlimentosRespuesta> => {
  // Usamos el endpoint relativo ya que tu api.ts base maneja la URL del servidor
  const { data } = await api.post<AnalisisAlimentosRespuesta>('/ia/analizar-alimentos', datosAlimentos);
  return data;
};