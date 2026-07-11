// 1. Importamos la instancia personalizada que ya creaste en tu api.ts
// (Ajusta la ruta de importación '../api' según dónde esté guardado tu archivo api.ts)
import { api } from './api';

export interface CategoriaAsistenciaPayload {
  idCategoriaGrupo: number;
  cantidad: number;
}

export interface RegistrarAsistenciaPayload {
  idModulo: number;
  idUsuarioCreacion: number; // Mapeado tal cual como se vio en tu Postman
  registroCorrelativo: number;
  categorias: CategoriaAsistenciaPayload[];
}

export const AsistenciaService = {
  /**
   * Registra la asistencia en el CIAI utilizando la instancia centralizada de la app
   */
  registrarAsistenciaCiai: async (payload: RegistrarAsistenciaPayload) => {
    try {
      // Como tu api.ts ya debe tener configurado el baseURL (ej: http://localhost:8080/api),
      // aquí solo necesitas concatenar el endpoint específico.
      const response = await api.post('/asistencia-ciai', payload);
      return response.data;
    } catch (error: any) {
      console.error('Error detallado en registrarAsistenciaCiai:', error?.response?.data || error.message);
      throw error;
    }
  },
};