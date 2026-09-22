package com.example.cunamas.feature.gestion.usecase.calculadora.calculadoraDosificadora

import com.example.cunamas.feature.gestion.domain.model.ResultadoCalculo
import com.example.cunamas.feature.gestion.domain.repository.CalculadoraRepository

class CalcularUseCase(
    private val repository: CalculadoraRepository
) {
    suspend operator fun invoke(idPreparacion: Int, categorias: List<Pair<Int, Int>>): ResultadoCalculo =
        repository.calcular(idPreparacion, categorias)
}