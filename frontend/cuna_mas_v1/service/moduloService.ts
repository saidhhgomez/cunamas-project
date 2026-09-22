import { api } from './api';

export interface RegistrarModuloDTO {
  nombreModulo: string;
  idLocal: number;
}

export const ModuloService = {
  /**
   * Obtiene los módulos filtrados por idLocal con paginación
   * @param idLocal ID del local seleccionado (ej. 5)
   * @param page Número de página (0, 1, 2...)
   * @param size Cantidad de elementos por página (por defecto 10)
   */
  getModulosPorLocal: async (idLocal: number, page: number, size: number = 10) => {
    try {
      const response = await api.get('/modulos', {
        params: {
          idLocal,
          page,
          size
        }
      });
      
      return {
        modulos: response.data.contenido || [],
        paginaActual: response.data.paginaActual ?? page,
        totalPaginas: response.data.totalPaginas ?? 1,
        // Determinamos si es la última página comparando la actual con el total
        isLast: (response.data.paginaActual + 1) >= response.data.totalPaginas
      };
    } catch (error) {
      console.error("Error en getModulosPorLocal:", error);
      throw error;
    }
  },

  /**
   * Registra un nuevo módulo en el servidor
   * POST http://localhost:8080/api/modulos
   * @param data Objeto con nombreModulo e idLocal
   */
  registrarModulo: async (data: RegistrarModuloDTO) => {
    try {
      const response = await api.post('/modulos', data);
      return response.data;
    } catch (error) {
      console.error("Error en registrarModulo:", error);
    }
  }
};