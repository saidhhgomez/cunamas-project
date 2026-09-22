package com.example.cunamas.feature.gestion.data.remote

import com.example.cunamas.feature.gestion.data.dto.response.AsistenciaResponseDto
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.parameter

class AsistenciaApi(private val client: HttpClient) {

    suspend fun getAsistencia(
        idModulo: Int,
        fecha: String,
        correlativo: Int? = null
    ): AsistenciaResponseDto {
        return client.get("asistencia-ciai") {
            parameter("idModulo", idModulo)
            parameter("fecha", fecha)
            if (correlativo != null) {
                parameter("correlativo", correlativo)
            }
        }.body()
    }
}