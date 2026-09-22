package com.example.cunamas.feature.gestion.usecase.locales

import com.example.cunamas.core.common.PaginaLocales
import com.example.cunamas.feature.gestion.domain.repository.LocalesRepository


class GetLocalesUseCase(
    private val repository: LocalesRepository
) {
    suspend operator fun invoke(idCentroAlimentario: Int, page: Int, size: Int): PaginaLocales {
        return repository.getLocales(idCentroAlimentario, page, size)
    }
}