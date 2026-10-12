package com.example.cunamas.feature.gestion.usecase.centroAlimentario

import com.example.cunamas.core.common.PaginaCentros
import com.example.cunamas.feature.gestion.domain.repository.CentrosAlimentariosRepository


class GetCentrosAlimentariosUseCase(
    private val repository: CentrosAlimentariosRepository
) {
    suspend operator fun invoke(distrito: String, page: Int, size: Int): PaginaCentros {
        return repository.getCentros(distrito, page, size)
    }
}