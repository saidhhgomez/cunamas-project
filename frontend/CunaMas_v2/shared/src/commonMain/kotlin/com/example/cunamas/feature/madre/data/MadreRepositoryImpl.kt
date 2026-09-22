package com.example.cunamas.feature.madre.data

import com.example.cunamas.feature.madre.domain.model.DireccionRequest
import com.example.cunamas.feature.madre.domain.model.DireccionResponse
import com.example.cunamas.feature.madre.domain.repository.MadreRepository
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.post
import io.ktor.client.request.setBody

class MadreRepositoryImpl(
    private val client: HttpClient
) : MadreRepository {

    override suspend fun guardarDireccion(request: DireccionRequest): Result<DireccionResponse> {
        return try {
            val response = client.post("perfil/direccion") {
                setBody(request)
            }.body<DireccionResponse>()
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
