import { api } from './api'; // Tu cliente Axios configurado

// 1. Interfaces basadas exactamente en tus respuestas de Postman
export interface DistritoResponse {
  idDistrito: number;
  distrito: string;
  provincia: string;
  departamento: string;
  ubigeo: number;
}

export interface DireccionRequest {
  idDistrito: number;
  nombreDireccion: string;
}

// Interfaz para la respuesta de creación de dirección (POST)
export interface DireccionCreadaResponse {
  idGenerado: number;
  mensaje: string;
}

export const DistritoService = {
  /**
   * Busca distritos filtrados por un texto (ej: "santiago de sur")
   * @param query Texto de búsqueda enviado por el usuario
   */
  buscarDistritos: async (query: string): Promise<DistritoResponse[]> => {
    try {
      const response = await api.get<DistritoResponse[]>('/distritos', {
        params: {
          search: query,
        },
      });
      return response.data;
    } catch (error) {
      // Logueamos y retornamos un array vacío para evitar bloquear la pantalla al escribir.
      console.error('Error al buscar distritos:', error);
      return []; 
    }
  },

  /**
   * Registra una nueva dirección física y retorna el idGenerado
   * Endpoint de Postman: POST /api/direcciones
   */
  registrarDireccion: async (datos: DireccionRequest): Promise<DireccionCreadaResponse> => {
    try {
      const response = await api.post<DireccionCreadaResponse>('/direcciones', datos);
      return response.data;
    } catch (error) {
      console.error("Error al registrar la dirección:", error);
      throw error;
    }
  },

  /**
   * Actualizar dirección del perfil (PUT al endpoint correcto)
   * @param data Datos con el idDistrito y nombreDireccion
   */
  actualizarDireccionPerfil: async (data: DireccionRequest): Promise<{mensaje: string, idDireccion: number}> => {
    try {
      // Usamos PUT como se ve en tu imagen de Postman
      const response = await api.put('/perfil/direccion', data);
      return response.data;
    } catch (error) {
      console.error("Error al actualizar dirección en perfil:", error);
      throw error;
    }
  }
};