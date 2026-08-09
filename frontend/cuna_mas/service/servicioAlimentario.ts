import { api } from './api';

// Estructura que espera tu backend para registrar un Servicio Alimentario
export interface ServicioAlimentarioRequest {
  idDireccion: number;
  nombreCentro: string;
  nombreComite: string;
}

export const CentroAlimentarioService = {
  /**
   * Obtiene la lista de centros alimentarios paginados (ej. de 10 en 10),
   * con filtro opcional por distrito.
   * 
   * Endpoint generado:
   * GET /servicios-alimentarios?page=0&size=10&distrito=SANTIAGO DE SURCO
   */
  getCentrosPorDistrito: async (page: number = 0, size: number = 10, distrito?: string) => {
    try {
      const params: Record<string, string | number> = { page, size };

      if (distrito && distrito.trim().length > 0) {
        params.distrito = distrito.trim();
      }

      const response = await api.get('/servicios-alimentarios', { params });

      // Extrae la lista desde el PageImpl de Spring Boot ('content')
      const content = response.data.content || response.data || [];
      const esUltimaPagina = content.length < size;
      const totalRegistros = response.data.totalElements ?? content.length;

      return {
        centros: content,
        isLast: esUltimaPagina,
        totalRegistros
      };
    } catch (error) {
      console.error("Error consultando el API de servicios alimentarios por distrito:", error);
      throw error;
    }
  },

  /**
   * Obtiene TODOS los centros alimentarios (o filtrados por distrito) 
   * enviando 'size: 100' para traerlos de un solo golpe sin paginar en la UI.
   * 
   * Endpoint generado:
   * GET /servicios-alimentarios?page=0&size=100
   */
  getCentrosTodos: async (distrito?: string) => {
    try {
      const params: Record<string, string | number> = { page: 0, size: 100 };

      if (distrito && distrito.trim().length > 0) {
        params.distrito = distrito.trim();
      }

      const response = await api.get('/servicios-alimentarios', { params });

      // Retorna el arreglo extraído directamente del objeto 'content'
      return response.data.content || response.data || [];
    } catch (error) {
      console.error("Error consultando todos los centros alimentarios:", error);
      throw error;
    }
  },

  /**
   * Registra un nuevo centro/servicio alimentario en el backend.
   * Endpoint: POST /servicios-alimentarios
   */
  registrar: async (datos: ServicioAlimentarioRequest) => {
    try {
      const response = await api.post('/servicios-alimentarios', datos);
      return response.data;
    } catch (error) {
      console.error("Error al registrar el servicio alimentario:", error);
      throw error;
    }
  }
};