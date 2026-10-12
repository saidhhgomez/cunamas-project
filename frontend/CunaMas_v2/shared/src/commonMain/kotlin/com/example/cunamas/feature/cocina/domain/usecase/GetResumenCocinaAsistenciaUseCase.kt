package com.example.cunamas.feature.cocina.domain.usecase

import com.example.cunamas.feature.cocina.domain.model.ResumenCocinaAsistencia
import com.example.cunamas.feature.cocina.domain.repository.CocinaAsistenciaRepository

class GetResumenCocinaAsistenciaUseCase(
    private val repository: CocinaAsistenciaRepository
) {
    suspend operator fun invoke(
        idServicioAlimentario: Int,
        fecha: String,
        correlativo: Int
    ): ResumenCocinaAsistencia {
        return repository.getResumenAsistencia(idServicioAlimentario, fecha, correlativo)
    }
}
