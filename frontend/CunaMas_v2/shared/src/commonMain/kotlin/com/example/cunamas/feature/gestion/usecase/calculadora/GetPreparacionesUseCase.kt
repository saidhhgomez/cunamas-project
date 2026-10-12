package com.example.cunamas.feature.gestion.usecase.calculadora

import com.example.cunamas.core.common.TipoPreparacion
import com.example.cunamas.feature.gestion.domain.repository.PreparacionRepository


class GetPreparacionesUseCase(
    private val repository: PreparacionRepository
) {
    suspend operator fun invoke(idCategoriaAlimento: Int): List<TipoPreparacion> {
        return repository.getPreparaciones(idCategoriaAlimento)
    }
}