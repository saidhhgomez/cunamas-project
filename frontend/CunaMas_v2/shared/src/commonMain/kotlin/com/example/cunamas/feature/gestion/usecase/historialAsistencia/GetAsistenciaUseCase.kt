package com.example.cunamas.feature.gestion.usecase.historialAsistencia

import com.example.cunamas.feature.gestion.domain.model.Asistencia
import com.example.cunamas.feature.gestion.domain.repository.AsistenciaRepository

class GetAsistenciaUseCase(
    private val repository: AsistenciaRepository
) {
    suspend operator fun invoke(idModulo: Int, fecha: String, correlativo: Int?): Asistencia {
        return repository.getAsistencia(idModulo, fecha, correlativo)
    }
}