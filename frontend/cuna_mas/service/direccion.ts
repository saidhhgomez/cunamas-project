// services/distritoService.ts
import {api} from './api'; // Tu cliente Axios configurado

// 1. Definimos la interfaz basándonos exactamente en la respuesta de tu Postman
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

export const DistritoService = {
  /**
   * Busca distritos filtrados por un texto (ej: "santiago de sur")
   * @param query Texto de búsqueda enviado por el usuario
   */
  buscarDistritos: async (query: string): Promise<DistritoResponse[]> => {
    try {
      // Pasamos el parámetro mediante el objeto 'params' de Axios para manejar correctamente espacios y caracteres especiales
      const response = await api.get<DistritoResponse[]>('/distritos', {
        params: {
          search: query,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al buscar distritos:', error);
      throw error;
    }
  },

  guardarDireccion: async (data: DireccionRequest): Promise<any> => {
    try {
      // Reemplaza 'api' por tu instancia de axios o usa fetch directo
      const response = await api.post('/direcciones', data);
      return response.data;
    } catch (error) {
      console.error("Error al guardar la dirección:", error);
      throw error; // Lanzamos el error para manejarlo en el componente
    }
  }
};