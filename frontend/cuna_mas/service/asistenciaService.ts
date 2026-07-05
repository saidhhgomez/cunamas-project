import { api } from './api';

// Definimos la interfaz exacta basada en tu captura de Postman para tipar el objeto
export interface AsistenciaPayload {
  idModulo: number;
  idUsuarioCreacion: number;
  registroCorrelativo: number;
  categorias: Array<{
    idCategoriaGrupo: number;
    cantidad: number;
  }>;
}

export const AsistenciaService = {
  /**
   * Registra la asistencia consolidada por módulos y categorías
   * Endpoint: POST http://localhost:8080/api/asistencia-ciai
   */
  registrarAsistenciaCiai: async (payload: AsistenciaPayload) => {
    try {
      const response = await api.post('/asistencia-ciai', payload);
      return response.data;
    } catch (error) {
      console.error("Error en AsistenciaService.registrarAsistenciaCiai:", error);
      throw error;
    }
  }
};