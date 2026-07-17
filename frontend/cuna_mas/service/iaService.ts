import { api } from '../service/api'; 

export interface CategoriaEtaria {
  ninos6a9Meses: number;
  ninos10a12Meses: number;
  ninos13a23Meses: number;
  ninos24a36Meses: number;
  actoresComunales: number;
}

export interface Presentacion {
  bolsas1kg: number;
  bolsas500g: number;
  bolsas250g: number;
}

export interface Alimento {
  nombre: string;
  categoriaEtaria: CategoriaEtaria;
  presentacion: Presentacion;
}

export interface AnalisisAlimentosPayload {
  alimentos: Alimento[];
}

export interface AnalisisAlimentosRespuesta {
  titulo: string;
  contenido: string;
}

/**
 * Envía la estructura completa { alimentos: [...] } tal como está guardada.
 */
// En iaService.ts
export const analizarAlimentosService = async (payload: AnalisisAlimentosPayload) => {
  // Imprime el cliente Axios para ver si tiene el token configurado
  console.log("Token actual en Axios:", api.defaults.headers.common['Authorization']);
  
  const { data } = await api.post<AnalisisAlimentosRespuesta>(
    '/ia/analizar-alimentos', 
    payload
  );
  return data;
};