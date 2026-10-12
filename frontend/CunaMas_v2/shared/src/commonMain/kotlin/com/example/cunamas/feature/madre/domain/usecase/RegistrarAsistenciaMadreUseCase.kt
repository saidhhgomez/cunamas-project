package com.example.cunamas.feature.madre.domain.usecase

import com.example.cunamas.feature.madre.domain.model.AsistenciaMadreRequest
import com.example.cunamas.feature.madre.domain.model.AsistenciaMadreResponse
import com.example.cunamas.feature.madre.domain.repository.MadreRepository

class RegistrarAsistenciaMadreUseCase(
    private val repository: MadreRepository
) {
    suspend operator fun invoke(request: AsistenciaMadreRequest): Result<AsistenciaMadreResponse> {
        return repository.registrarAsistencia(request)
    }
}
