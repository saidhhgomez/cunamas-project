// 1. Importa la instancia configurada desde tu archivo api.ts 
// (Ajusta la ruta relativa ../../ según corresponda en tu proyecto)
import {api} from './api'; 

export const CalculadoraService = {
  getListaCategorias: async () => {
    try {
      // 2. Al usar 'api.get', automáticamente hereda la URL base y el Bearer Token
      const response = await api.get('/calculadora/categorias');
      return response.data; 
    } catch (error) {
      console.error("Error al obtener categorías de alimentos:", error);
      throw error;
    }
  },


  getPreparacionesPorCategoria: async (idCategoria: string | string[]) => {
    try {
      // Enlaza el ID al final de la ruta dinámica `/calculadora/preparaciones/{id}`
      const response = await api.get(`/calculadora/preparaciones/${idCategoria}`);
      return response.data;
    } catch (error) {
      console.error("Error en servicio preparaciones:", error);
      throw error;
    }
  },




getResumenServicio: async (id: number, fecha: string, correlativo: number): Promise<any> => {

  try {
    const response = await api.get(`/calculadora/resumen-servicio/${id}`, { 
      params: { 
        fecha, 
        correlativo, 
      } 
    });
    return response.data;
  } catch (error) {
    console.error(`Error al obtener resumen:`, error);
    throw error;
  }
},
// calculadoraService.ts
calcularDosificacionInsumos: async (datos: any, idPreparacion: string) => {
  const response = await api.post(
    `/calculadora/calcular`, 
    datos, 
    { params: { idPreparacion } }
  );
  return response.data;
}

};