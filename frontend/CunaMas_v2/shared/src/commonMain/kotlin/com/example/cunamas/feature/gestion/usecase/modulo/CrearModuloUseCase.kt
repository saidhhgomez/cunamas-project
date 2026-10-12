package com.example.cunamas.feature.gestion.usecase.modulo

import com.example.cunamas.feature.gestion.data.dto.response.CrearModuloResponseDto
import com.example.cunamas.feature.gestion.domain.repository.ModulosRepository


class CrearModuloUseCase(
    private val repository: ModulosRepository
) {
    suspend operator fun invoke(idLocal: Int, nombreModulo: String): CrearModuloResponseDto {
        return repository.crearModulo(idLocal = idLocal, nombreModulo = nombreModulo)
    }
}