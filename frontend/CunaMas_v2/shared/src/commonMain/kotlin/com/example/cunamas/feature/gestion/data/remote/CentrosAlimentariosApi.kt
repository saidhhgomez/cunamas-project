package com.example.cunamas.feature.gestion.data.remote

import com.example.cunamas.core.common.dto.request.DireccionRequestDto
import com.example.cunamas.core.common.dto.response.CentroAlimentarioDto
import com.example.cunamas.core.common.dto.response.CentrosAlimentariosResponseDto
import com.example.cunamas.core.common.dto.response.DireccionResponseDto
import com.example.cunamas.core.common.dto.response.DistritoDto
import com.example.cunamas.feature.gestion.data.dto.request.CrearCentroAlimentarioRequestDto
import com.example.cunamas.feature.gestion.data.dto.response.CrearCentroAlimentarioResponseDto
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.parameter
import io.ktor.client.request.post
import io.ktor.client.request.setBody

class CentrosAlimentariosApi(
    private val client: HttpClient
) {
    suspend fun getCentros(distrito: String, page: Int, size: Int): CentrosAlimentariosResponseDto {
        return client.get("servicios-alimentarios") {
            parameter("distrito", distrito)
            parameter("page", page)
            parameter("size", size)
        }.body()
    }

    suspend fun getCentroById(id: Int): CentroAlimentarioDto {
        return client.get("servicios-alimentarios/$id").body()
    }

    suspend fun buscarDistritos(search: String): List<DistritoDto> {
        return client.get("distritos") {
            parameter("search", search)
        }.body()
    }

    suspend fun crearDireccion(body: DireccionRequestDto): DireccionResponseDto {
        return client.post("direcciones") {
            setBody(body)
        }.body()
    }

    suspend fun crearCentroAlimentario(body: CrearCentroAlimentarioRequestDto): CrearCentroAlimentarioResponseDto {
        return client.post("servicios-alimentarios") {
            setBody(body)
        }.body()
    }
}