package com.example.cunamas.feature.gestion.usecase.calculadora

import com.example.cunamas.core.common.CategoriaAlimento
import com.example.cunamas.feature.gestion.domain.repository.CategoriasAlimentoRepository


class GetCategoriasAlimentoUseCase(
    private val repository: CategoriasAlimentoRepository
) {
    suspend operator fun invoke(): List<CategoriaAlimento> {
        return repository.getCategorias()
    }
}