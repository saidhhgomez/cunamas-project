// 🌟 Importamos tu instancia configurada de Axios desde api.ts
import { api } from './api';

export const usuarioService = {
  /**
   * Obtiene la lista de usuarios con estado pendiente de aprobación
   * GET /api/admin/usuarios/pendientes
   */
  getUsuariosPendientes: async () => {
    try {
      // Usamos 'api' en lugar de 'axios' directamente para arrastrar tokens/headers configurados
      const response = await api.get('/admin/usuarios/pendientes');
      return response.data; // Retorna el array [idPersona, nombresCompletos, etc.]
    } catch (error) {
      console.error('Error en usuarioService.getUsuariosPendientes:', error);
      throw error;
    }
  },

  /**
   * Aprueba un usuario asignándole uno o varios roles
   * PUT /api/admin/usuarios/aprobar
   * @param idPersona ID del usuario a aprobar
   * @param roles Array de IDs de roles (ej: [5])
   */
  aprobarUsuario: async (idPersona: number, roles: number[]) => {
    try {
      const payload = { idPersona, roles }; // Estructura idéntica al body de tu Postman
      const response = await api.put('/admin/usuarios/aprobar', payload);
      return response.data;
    } catch (error) {
      console.error('Error en usuarioService.aprobarUsuario:', error);
      throw error;
    }
  }, // <-- ✅ Se agregó la coma que faltaba aquí

  /**
   * Obtiene el detalle de un único usuario pendiente mediante su ID
   * GET /api/admin/usuarios/pendientes/{idPersona}
   */
  obtenerPendientePorId: async (idPersona: number) => {
    try {
      // ✅ Se removió el '/api' del inicio para mantener consistencia con tu Axios BaseURL
      const response = await api.get(`/admin/usuarios/pendientes/${idPersona}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener detalle del usuario pendiente:", error);
      throw error;
    }
  },
};