package com.example.cunamas.feature.cocina.domain.repository

interface CocinaReporteRepository {
    suspend fun getReportePdf(idCentroAlimentario: Int, fecha: String, correlativo: Int): Result<ByteArray>
}
