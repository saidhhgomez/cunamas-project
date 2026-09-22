package com.example.cunamas.feature.gestion.domain.repository
import com.example.cunamas.feature.gestion.domain.model.Asistencia

interface AsistenciaRepository {
    suspend fun getAsistencia(idModulo: Int, fecha: String, correlativo: Int?): Asistencia
}