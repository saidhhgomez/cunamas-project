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
   * 1. REGISTRAR ASISTENCIA
   * Guarda los datos mediante una petición POST
   */
  registrarAsistenciaCiai: async (payload: RegistrarAsistenciaPayload) => {
    try {
      const response = await api.post('/asistencia-ciai', payload);
      return response.data;
    } catch (error: any) {
      
      // Lanzar explícitamente el error para que la pantalla entre a su bloque catch()
      throw error; 
    }
  },

  /**
   * 2. OBTENER POR MODULO Y FECHA
   * Trae el JSON completo con 'registroManana' y 'registroTarde' agrupados
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
      throw error; // Re-lanzamos para manejo en UI
    }
  },

  /**
   * 3. OBTENER POR MODULO, FECHA Y CORRELATIVO
   * Filtra directamente desde el Backend una jornada específica
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
      throw error; // Re-lanzamos para manejo en UI
    }
  }
};