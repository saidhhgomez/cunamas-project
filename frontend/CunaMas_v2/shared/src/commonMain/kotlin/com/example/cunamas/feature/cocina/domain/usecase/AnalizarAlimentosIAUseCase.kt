package com.example.cunamas.feature.cocina.domain.usecase

import com.example.cunamas.feature.cocina.domain.model.RespuestaIA
import com.example.cunamas.feature.cocina.domain.model.ResumenIA
import com.example.cunamas.feature.cocina.domain.repository.CocinaIARepository

class AnalizarAlimentosIAUseCase(
    private val repository: CocinaIARepository
) {
    suspend operator fun invoke(resumen: ResumenIA): Result<RespuestaIA> {
        return repository.analizarAlimentos(resumen)
    }
}
