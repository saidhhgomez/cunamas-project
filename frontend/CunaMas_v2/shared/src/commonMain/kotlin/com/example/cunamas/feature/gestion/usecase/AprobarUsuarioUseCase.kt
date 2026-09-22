package com.example.cunamas.feature.gestion.usecase

import com.example.cunamas.feature.gestion.domain.repository.GestionRepository


class AprobarUsuarioUseCase(

    private val repository: GestionRepository

) {

    suspend operator fun invoke(idPersona: Int, rolesIds: List<Int>): Result<String> {

        return repository.aprobarUsuario(idPersona, rolesIds)

    }

}

