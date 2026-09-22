package com.example.cunamas.feature.gestion.usecase.calculadora.calculadoraDosificadora

import com.example.cunamas.feature.gestion.domain.model.ResumenServicio
import com.example.cunamas.feature.gestion.domain.repository.CalculadoraRepository

class GetResumenServicioUseCase(
    private val repository: CalculadoraRepository
) {
    suspend operator fun invoke(idServicioAlimentario: Int, fecha: String, correlativo: Int): ResumenServicio =
        repository.getResumenServicio(idServicioAlimentario, fecha, correlativo)
}