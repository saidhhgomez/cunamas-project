package com.example.cunamas.feature.cocina.data

import com.example.cunamas.feature.cocina.domain.repository.CocinaReporteRepository
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.parameter

class CocinaReporteRepositoryImpl(
    private val client: HttpClient
) : CocinaReporteRepository {
    override suspend fun getReportePdf(
        idCentroAlimentario: Int,
        fecha: String,
        correlativo: Int
    ): Result<ByteArray> {
        return try {
            val response = client.get("calculadora/reporte-pdf/$idCentroAlimentario") {
                parameter("fecha", fecha)
                parameter("correlativo", correlativo)
            }.body<ByteArray>()
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
