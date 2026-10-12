package com.example.cunamas.feature.gestion.usecase.centroAlimentario

import com.example.cunamas.core.common.CentroAlimentario
import com.example.cunamas.feature.gestion.domain.repository.CentrosAlimentariosRepository


class GetCentroAlimentarioByIdUseCase(
    private val repository: CentrosAlimentariosRepository
) {
    suspend operator fun invoke(id: Int): CentroAlimentario {
        return repository.getCentroById(id)
    }
}