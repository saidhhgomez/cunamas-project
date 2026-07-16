import { api } from './api';

export interface CategoriaAsistenciaPayload {
  idCategoriaGrupo: number;
  cantidad: number;
}

export interface RegistrarAsistenciaPayload {
  idModulo: number;
  idUsuarioCreacion: number; 
  registroCorrelativo: number;
  categorias: CategoriaAsistenciaPayload[];
}

export const AsistenciaService = {
  /**
   * 1. REGISTRAR ASISTENCIA (El que ya tenías listo)
   * Guarda los datos mediante una petición POST
   */
  registrarAsistenciaCiai: async (payload: RegistrarAsistenciaPayload) => {
    try {
      const response = await api.post('/asistencia-ciai', payload);
      return response.data;
    } catch (error: any) {
      console.error('Error en registrarAsistenciaCiai:', error?.response?.data || error.message);
    }
  },

  /**
   * 2. OBTENER POR MODULO Y FECHA
   * Trae el JSON completo con 'registroManana' y 'registroTarde' agrupados
   * URL: /asistencia-ciai?idModulo=1&fecha=2026-07-11
   */
  obtenerAsistenciaPorModuloYFecha: async (idModulo: number, fechaYmd: string) => {
    try {
      const response = await api.get('/asistencia-ciai', {
        params: {
          idModulo: idModulo,
          fecha: fechaYmd
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error en obtenerAsistenciaPorModuloYFecha:', error?.response?.data || error.message);
    }
  },

  /**
   * 3. OBTENER POR MODULO, FECHA Y CORRELATIVO
   * Filtra directamente desde el Backend una jornada específica
   * URL: /asistencia-ciai?idModulo=6&fecha=2026-07-12&correlativo=1
   */
  obtenerAsistenciaConCorrelativo: async (idModulo: number, fechaYmd: string, correlativo: number) => {
    try {
      const response = await api.get('/asistencia-ciai', {
        params: {
          idModulo: idModulo,
          fecha: fechaYmd,
          correlativo: correlativo
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error en obtenerAsistenciaConCorrelativo:', error?.response?.data || error.message);
    }
  }
};