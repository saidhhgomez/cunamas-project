import { api } from './api';

// 1. Interfaces para la creación de locales basadas en tus capturas de Postman

export interface LocalBasicoRequest {
  idDireccion: number;
  idCentroAlimentario: number;
  localNombre: string;
}

export interface LocalCompletoRequest {
  idDireccion: number;
  idCentroAlimentario: number;
  localNombre: string;
  modulos: string[]; // Array de strings (ej: ["Modulo H", "Modulo I", "Modulo J"])
}

export interface LocalResponse {
  idGenerado?: number;
  mensaje?: string;
  [key: string]: any; // Permite manejar campos adicionales retornados por tu backend Spring Boot
}

export const LocalService = {

  // ==========================================
  // MÉTODOS DE LECTURA (GET)
  // ==========================================

  /**
   * Obtiene la lista de locales filtrados por distrito de golpe (sin paginar)
   */
  getLocalesPorCentro: async (distrito: string) => {
    try {
      const response = await api.get('/centros-atencion-infantil', {
        params: { distrito }
      });
      return response.data.content || [];
    } catch (error) {
      console.error("Error al obtener locales por centro:", error);
    }
  },

  /**
   * Obtiene locales paginados para Scroll Infinito
   */
  getLocalesPorCentroPaginado: async (idCentroAlimentario: number, page = 0, size = 10) => {
    try {
      const response = await api.get('/centros-atencion-infantil', {
        params: { 
          idCentroAlimentario, 
          page, 
          size 
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error al obtener locales paginados:", error);
    }
  },

  // ==========================================
  // MÉTODOS DE CREACIÓN (POST)
  // ==========================================

  /**
   * Registra un local básico
   * Endpoint de Postman: POST /api/centros-atencion-infantil
   */
  registrarLocalBasico: async (datos: LocalBasicoRequest): Promise<LocalResponse> => {
    try {
      const response = await api.post<LocalResponse>('/centros-atencion-infantil', datos);
      return response.data;
    } catch (error) {
      console.error("Error al registrar local básico:", error);
    }
  },

  /**
   * Registra un local completo incluyendo su lista de módulos
   * Endpoint de Postman: POST /api/centros-atencion-infantil/completo
   */
  registrarLocalCompleto: async (datos: LocalCompletoRequest): Promise<LocalResponse> => {
    try {
      const response = await api.post<LocalResponse>('/centros-atencion-infantil/completo', datos);
      return response.data;
    } catch (error) {
      console.error("Error al registrar local completo:", error);
    }
  }

};