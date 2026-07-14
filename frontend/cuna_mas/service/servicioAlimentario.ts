import { api } from './api'; // Asegúrate de apuntar a tu archivo de configuración de Axios

// Estructura que espera tu backend para el POST de S.A.
export interface ServicioAlimentarioRequest {
  idDireccion: number;
  nombreCentro: string;
  nombreComite: string;
}

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
  },

  /**
   * Registra un nuevo servicio alimentario asociado a un idDireccion
   * Endpoint de Postman: POST /api/servicios-alimentarios
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