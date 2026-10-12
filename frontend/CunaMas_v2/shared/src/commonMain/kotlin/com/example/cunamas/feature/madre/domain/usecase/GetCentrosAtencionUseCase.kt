package com.example.cunamas.feature.madre.domain.usecase

import com.example.cunamas.feature.madre.domain.model.CentroAtencion
import com.example.cunamas.feature.madre.domain.repository.MadreRepository

class GetCentrosAtencionUseCase(
    private val repository: MadreRepository
) {
    suspend operator fun invoke(distrito: String): List<CentroAtencion> {
        return repository.getCentrosAtencion(distrito)
    }
}
