package com.example.cunamas.feature.gestion.usecase.calculadora.calculadoraDosificadora

import com.example.cunamas.feature.gestion.domain.model.RangoPreparacion
import com.example.cunamas.feature.gestion.domain.repository.CalculadoraRepository


class GetRangosUseCase(
    private val repository: CalculadoraRepository
) {
    suspend operator fun invoke(idPreparacion: Int): List<RangoPreparacion> =
        repository.getRangos(idPreparacion)
}