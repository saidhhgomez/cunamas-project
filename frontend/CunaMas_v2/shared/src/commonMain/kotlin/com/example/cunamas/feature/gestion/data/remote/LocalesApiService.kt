package com.example.cunamas.feature.gestion.data.remote

import com.example.cunamas.core.common.dto.response.LocalesResponseDto
import com.example.cunamas.feature.gestion.data.dto.request.CrearLocalRequestDto
import com.example.cunamas.feature.gestion.data.dto.response.CrearLocalResponseDto
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.parameter
import io.ktor.client.request.post
import io.ktor.client.request.setBody

class LocalesApi(
    private val client: HttpClient
) {
    // Equivalente a @GET con @Query para listar locales con paginación
    suspend fun getLocales(idCentroAlimentario: Int, page: Int, size: Int): LocalesResponseDto {
        return client.get("centros-atencion-infantil") {
            parameter("idCentroAlimentario", idCentroAlimentario)
            parameter("page", page)
            parameter("size", size)
        }.body()
    }

    // Equivalente a @POST para crear un nuevo local
    suspend fun crearLocal(request: CrearLocalRequestDto): CrearLocalResponseDto {
        return client.post("centros-atencion-infantil") {
            setBody(request)
        }.body()
    }
}