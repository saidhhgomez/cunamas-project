// services/usuarioService.ts
// 🌟 Importamos tu instancia configurada de Axios desde api.ts
import { api } from './api';

// --- Interfaces para el nuevo endpoint del Admin ---
export interface RegisterAdminPayload {
  persona: {
    idDocumento: number;     
    numeroDocumento: string; 
    nombres: string;
    apPaterno: string;      
    apMaterno: string;
    idGenero: number;        
  };
  cuenta: {
    correoElectronico: string;
  };
  roles: number[]; // Array de IDs de roles asignados directamente (ej. [5])
}

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
  },

  /**
   * Obtiene el detalle de un único usuario pendiente mediante su ID
   * GET /api/admin/usuarios/pendientes/{idPersona}
   */
  obtenerPendientePorId: async (idPersona: number) => {
    try {
      const response = await api.get(`/admin/usuarios/pendientes/${idPersona}`);
      return response.data;
    } catch (error) {
      console.error("Error al obtener detalle del usuario pendiente:", error);
      throw error;
    }
  },

  /**
   * 🌟 NUEVO: Registra un usuario directamente desde el panel de Administrador asignando roles
   * POST /api/admin/usuarios
   * @param datosRegistro Payload con datos de persona, cuenta y roles directos
   */
  registrarUsuarioAdmin: async (datosRegistro: RegisterAdminPayload) => {
    if (datosRegistro.persona?.numeroDocumento) {
      datosRegistro.persona.numeroDocumento = datosRegistro.persona.numeroDocumento.trim();
    }

    console.log('====== 🚀 ENVIANDO REGISTRO ADMIN ======');
    try {
      // Concuerda con tu endpoint de Postman: http://localhost:8080/api/admin/usuarios
      const response = await api.post('/admin/usuarios', datosRegistro);
      return response.data;
    } catch (error) {
      console.error('Error en usuarioService.registrarUsuarioAdmin:', error);
      throw error;
    }
  }
};