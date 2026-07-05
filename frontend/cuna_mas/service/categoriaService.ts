import { api } from './api';

export const CategoriaService = {
  /**
   * Obtiene las categorías de dosificación para los rangos de edad
   * Endpoint: GET http://localhost:8080/api/categorias-dosificacion
   */
  getListaCategorias: async () => {
    try {
      const response = await api.get('/categorias-dosificacion');
      return response.data; // Retorna el array [ {idCategoriaGrupo, nombreCategoria}, ... ]
    } catch (error) {
      console.error("Error en CategoriaService.getListaCategorias:", error);
      throw error;
    }
  }
};