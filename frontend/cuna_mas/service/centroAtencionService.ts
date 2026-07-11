import { api } from './api';

export const LocalService = {
  /**
   * Obtiene todos los locales filtrados por distrito
   * @param distrito Nombre del distrito (ej. "CHACHAPOYAS")
   */
  getLocalesPorCentro: async (distrito: string) => {
    try {
      // ✅ Sin paginación: Mandamos solo el distrito como parámetro
      const response = await api.get('/centros-atencion-infantil', {
        params: { distrito }
      });
      
      // Retornamos el contenido directamente
      return response.data.content || [];
    } catch (error) {
      throw error;
    }
  }
};