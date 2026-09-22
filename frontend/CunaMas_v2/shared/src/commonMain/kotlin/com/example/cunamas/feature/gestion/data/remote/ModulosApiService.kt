package com.example.cunamas.feature.gestion.data.remote
import com.example.cunamas.core.common.dto.request.ModuloRequestDto
import com.example.cunamas.core.common.dto.response.ModulosResponseDto
import com.example.cunamas.feature.gestion.data.dto.response.CrearModuloResponseDto
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.parameter
import io.ktor.client.request.post
import io.ktor.client.request.setBody

class ModulosApi(
    private val client: HttpClient
) {
    suspend fun getModulos(idLocal: Int, page: Int, size: Int): ModulosResponseDto {
        return client.get("modulos") {
            parameter("idLocal", idLocal)
            parameter("page", page)
            parameter("size", size)
        }.body()
    }

    suspend fun crearModulo(request: ModuloRequestDto): CrearModuloResponseDto {
        return client.post("modulos") {
            setBody(request)
        }.body()
    }
}