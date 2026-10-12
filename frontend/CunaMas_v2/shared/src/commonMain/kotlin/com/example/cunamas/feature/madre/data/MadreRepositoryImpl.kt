package com.example.cunamas.feature.madre.data

import com.example.cunamas.feature.madre.domain.model.AsistenciaMadreRequest
import com.example.cunamas.feature.madre.domain.model.AsistenciaMadreResponse
import com.example.cunamas.feature.madre.domain.model.CentroAtencion
import com.example.cunamas.feature.madre.domain.model.DireccionRequest
import com.example.cunamas.feature.madre.domain.model.DireccionResponse
import com.example.cunamas.feature.madre.domain.repository.MadreRepository
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.parameter
import io.ktor.client.request.post
import io.ktor.client.request.put
import io.ktor.client.request.setBody

class MadreRepositoryImpl(
    private val client: HttpClient
) : MadreRepository {

    override suspend fun guardarDireccion(request: DireccionRequest): Result<DireccionResponse> {
        return try {
            val response = client.put("perfil/direccion") {
                setBody(request)
            }.body<DireccionResponse>()
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun getCentrosAtencion(distrito: String): List<CentroAtencion> {
        val response = client.get("centros-atencion-infantil") {
            parameter("distrito", distrito)
        }.body<CentroAtencionResponseDto>()
        return response.content
    }

    override suspend fun registrarAsistencia(request: AsistenciaMadreRequest): Result<AsistenciaMadreResponse> {
        return try {
            val response = client.post("asistencia-ciai") {
                setBody(request)
            }.body<AsistenciaMadreResponse>()
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
