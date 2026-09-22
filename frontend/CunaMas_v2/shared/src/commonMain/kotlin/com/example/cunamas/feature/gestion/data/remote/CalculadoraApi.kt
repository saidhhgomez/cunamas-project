package com.example.cunamas.feature.gestion.data.remote

import com.example.cunamas.core.common.dto.request.CalcularRequestDto
import com.example.cunamas.core.common.dto.response.CalcularResponseDto
import com.example.cunamas.core.common.dto.response.RangoPreparacionDto
import com.example.cunamas.feature.gestion.data.dto.response.ResumenServicioResponseDto
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.parameter
import io.ktor.client.request.post
import io.ktor.client.request.setBody

class CalculadoraApi(
    private val client: HttpClient
) {

    // Equivalente a @GET de Retrofit
    suspend fun getRangos(idPreparacion: Int): List<RangoPreparacionDto> {
        return client.get("calculadora/dosificaciones/$idPreparacion").body()
    }

    // Equivalente a @GET con @Path y @Query de Retrofit
    suspend fun getResumenServicio(
        idServicioAlimentario: Int,
        fecha: String,
        correlativo: Int
    ): ResumenServicioResponseDto {
        return client.get("calculadora/resumen-servicio/$idServicioAlimentario") {
            parameter("fecha", fecha)
            parameter("correlativo", correlativo)
        }.body()
    }

    // Equivalente a @POST con @Query y @Body de Retrofit
    suspend fun calcular(
        idPreparacion: Int,
        body: CalcularRequestDto
    ): CalcularResponseDto {
        return client.post("calculadora/calcular") {
            parameter("idPreparacion", idPreparacion)
            setBody(body)
        }.body()
    }
}