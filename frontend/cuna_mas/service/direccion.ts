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
    const response = await api.get<DistritoResponse[]>('/distritos', {
      params: {
        search: query,
      },
    });
    return response.data;
  } catch (error) {
    // En lugar de lanzar el error, lo logueamos y retornamos un array vacío.
    // Esto evita que tu componente se bloquee al fallar la búsqueda.
    console.error('Error al buscar distritos:', error);
    return []; 
  }
},


  // SERVICIO 3: Actualizar dirección del perfil (PUT al endpoint correcto)
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