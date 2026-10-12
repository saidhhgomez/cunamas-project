package com.example.cunamas.feature.gestion.usecase.credenciales


import com.example.cunamas.feature.gestion.domain.model.CredencialCreada
import com.example.cunamas.feature.gestion.domain.repository.GestionRepository

class CrearUsuarioUseCase(
    private val repository: GestionRepository
) {
    suspend operator fun invoke(
        idDocumento: Int,
        numeroDocumento: String,
        nombres: String,
        apPaterno: String,
        apMaterno: String,
        idGenero: Int,
        correoElectronico: String,
        rolesIds: List<Int>
    ): Result<CredencialCreada> {
        return repository.crearUsuario(
            idDocumento, numeroDocumento, nombres, apPaterno, apMaterno,
            idGenero, correoElectronico, rolesIds
        )
    }
}