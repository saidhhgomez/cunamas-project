import { api } from './api'; // Asegúrate de apuntar a tu archivo de configuración de Axios

// Estructura que espera tu backend para el POST de S.A.
export interface ServicioAlimentarioRequest {
  idDireccion: number;
  nombreCentro: string;
  nombreComite: string;
}

export const CentroAlimentarioService = {
  /**
   * Obtiene la lista de centros alimentarios paginados, con filtro
   * opcional por distrito.
   *
   * Cubre los 4 casos del endpoint:
   *  - GET /servicios-alimentarios
   *  - GET /servicios-alimentarios?page=0&size=10
   *  - GET /servicios-alimentarios?distrito=CHACHAPOYAS
   *  - GET /servicios-alimentarios?distrito=CHACHAPOYAS&page=0&size=5
   */
  getCentrosPorDistrito: async (page: number, size: number = 10, distrito?: string) => {
    try {
      // Arma los params dinámicamente: si no hay distrito, no se envía
      // esa clave (evita mandar distrito='' al backend).
      const params: Record<string, string | number> = { page, size };
      if (distrito && distrito.trim().length > 0) {
        params.distrito = distrito.trim();
      }

      const response = await api.get('/servicios-alimentarios', { params });

      // Mapeamos los datos de acuerdo con tu JSON de Spring Boot
      const content = response.data.content || [];

      // Si Spring Boot no devuelve totalPages de forma directa en el objeto, 
      // asumimos que terminó si el contenido devuelto es menor al tamaño de la página (size)
      const esUltimaPagina = content.length < size;

      // Si tu backend sí manda el total de elementos (típico en Page<T> de
      // Spring: totalElements), lo propagamos para poder mostrarlo en el
      // resumen / barra lateral sin tener que adivinarlo en el frontend.
      const totalRegistros = response.data.totalElements ?? content.length;

      return {
        centros: content,
        isLast: esUltimaPagina,
        totalRegistros
      };
    } catch (error) {
      console.error("Error consultando el API de servicios alimentarios:", error);
      // 🔧 Antes el error se quedaba solo logueado acá y la función devolvía
      // undefined, así que el try/catch de la pantalla nunca se enteraba y
      // el usuario nunca veía el mensaje de error. Relanzamos para que
      // Consulta.tsx (o quien llame) pueda mostrarlo.
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