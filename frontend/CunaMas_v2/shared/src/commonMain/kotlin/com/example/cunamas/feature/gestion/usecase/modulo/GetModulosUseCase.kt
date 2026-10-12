package com.example.cunamas.feature.gestion.usecase.modulo

import com.example.cunamas.core.common.PaginaModulos
import com.example.cunamas.feature.gestion.domain.repository.ModulosRepository


class GetModulosUseCase(
    private val repository: ModulosRepository
) {
    suspend operator fun invoke(idLocal: Int, page: Int, size: Int): PaginaModulos {
        return repository.getModulos(idLocal, page, size)
    }
}