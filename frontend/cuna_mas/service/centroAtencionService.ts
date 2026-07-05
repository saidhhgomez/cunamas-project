import { api } from './api';

export const LocalService = {
  /**
   * Obtiene los locales filtrados por idCentroAlimentario con paginación
   * @param idCentroAlimentario ID del centro alimentario (ej. 1)
   * @param page Número de página (0, 1, 2...)
   * @param size Cantidad de elementos por página (por defecto 5, según tu Postman)
   */
  getLocalesPorCentro: async (idCentroAlimentario: number, page: number, size: number = 5) => {
    try {
      const response = await api.get('/centros-atencion-infantil', {
        params: { idCentroAlimentario, page, size }
      });
      
      const content = response.data.content || [];
      
      return {
        locales: content,
        // Al usar 'content', calculamos si es la última página si vinieron menos elementos del tamaño solicitado
        isLast: response.data.last ?? (content.length < size)
      };
    } catch (error) {
      console.error("Error en getLocalesPorCentro:", error);
      throw error;
    }
  }
};