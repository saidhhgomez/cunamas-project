import { api } from './api';

export const LocalService = {

  getLocalesPorCentro: async (distrito: string) => {
    try {
      // ✅ Sin paginación: Mandamos solo el distrito como parámetro
      const response = await api.get('/centros-atencion-infantil', {
        params: { distrito }
      });
      
      // Retornamos el contenido directamente
      return response.data.content || [];
      console.log("Locales obtenidos:", response.data.content);
    } catch (error) {
      throw error;
    }
  }
};