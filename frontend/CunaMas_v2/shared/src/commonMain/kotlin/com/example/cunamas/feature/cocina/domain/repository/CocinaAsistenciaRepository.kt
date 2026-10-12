package com.example.cunamas.feature.cocina.domain.repository

import com.example.cunamas.feature.cocina.domain.model.ResumenCocinaAsistencia

interface CocinaAsistenciaRepository {
    suspend fun getResumenAsistencia(
        idServicioAlimentario: Int,
        fecha: String,
        correlativo: Int
    ): ResumenCocinaAsistencia
}
