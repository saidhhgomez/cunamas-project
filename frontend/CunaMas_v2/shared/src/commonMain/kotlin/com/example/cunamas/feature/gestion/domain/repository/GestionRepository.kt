package com.example.cunamas.feature.gestion.domain.repository

import com.example.cunamas.feature.gestion.domain.model.CredencialCreada
import com.example.cunamas.feature.gestion.domain.model.DetalleUsuario
import com.example.cunamas.feature.gestion.domain.model.UsuarioPendiente

interface GestionRepository {
    suspend fun getUsuariosPendientes(): Result<List<UsuarioPendiente>>
    suspend fun getUsuarioDetalle(id: Int): Result<DetalleUsuario>
    suspend fun aprobarUsuario(idPersona: Int, rolesIds: List<Int>): Result<String>


    // 🆕 nuevo
    suspend fun crearUsuario(
        idDocumento: Int,
        numeroDocumento: String,
        nombres: String,
        apPaterno: String,
        apMaterno: String,
        idGenero: Int,
        correoElectronico: String,
        rolesIds: List<Int>
    ): Result<CredencialCreada>   // 👈 cambia de String a CredencialCreada
}