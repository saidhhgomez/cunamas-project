package com.example.cunamas.feature.madre.domain.usecase

import com.example.cunamas.feature.madre.domain.model.DireccionRequest
import com.example.cunamas.feature.madre.domain.model.DireccionResponse
import com.example.cunamas.feature.madre.domain.repository.MadreRepository

class GuardarDireccionUseCase(
    private val repository: MadreRepository
) {
    suspend operator fun invoke(idDistrito: Int, nombreDireccion: String): Result<DireccionResponse> {
        return repository.guardarDireccion(DireccionRequest(idDistrito, nombreDireccion))
    }
}
