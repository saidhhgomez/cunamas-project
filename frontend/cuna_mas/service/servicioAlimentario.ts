import { api } from './api'; // Asegúrate de apuntar a tu archivo de configuración de Axios

export const CentroAlimentarioService = {
  /**
   * Obtiene la lista de centros alimentarios paginados
   * Endpoint de Postman: /api/servicios-alimentarios?page=0&size=10
   */
  getCentrosPorDistrito: async (page: number, size: number = 5) => {
    try {
      const response = await api.get('/servicios-alimentarios', {
        params: { page, size }
      });

      // Mapeamos los datos de acuerdo con tu JSON de Spring Boot
      const content = response.data.content || [];
      
      // Si Spring Boot no devuelve totalPages de forma directa en el objeto, 
      // asumimos que terminó si el contenido devuelto es menor al tamaño de la página (size)
      const esUltimaPagina = content.length < size;

      return {
        centros: content,
        isLast: esUltimaPagina
      };
    } catch (error) {
      console.error("Error consultando el API de servicios alimentarios:", error);
      throw error;
    } 
  },

  getCentrosTodos: async () => {
      try {
        // Un GET limpio, sin el objeto 'params'
        const response = await api.get('/servicios-alimentarios');

        // Si el endpoint sin paginar te devuelve el array directo, usas: response.data
        // Si te sigue devolviendo el objeto con 'content', dejamos el fallback listo:
        return response.data.content || response.data || [];
      } catch (error) {
        console.error("Error consultando todos los centros (sin paginación):", error);
        throw error;
      }
    }
  };