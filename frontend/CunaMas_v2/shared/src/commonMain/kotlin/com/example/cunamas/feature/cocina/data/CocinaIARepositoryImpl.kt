package com.example.cunamas.feature.cocina.data

import com.example.cunamas.feature.cocina.domain.model.RespuestaIA
import com.example.cunamas.feature.cocina.domain.model.ResumenIA
import com.example.cunamas.feature.cocina.domain.repository.CocinaIARepository
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.post
import io.ktor.client.request.setBody

class CocinaIARepositoryImpl(
    private val client: HttpClient
) : CocinaIARepository {
    override suspend fun analizarAlimentos(resumen: ResumenIA): Result<RespuestaIA> {
        return try {
            val response = client.post("ia/analizar-alimentos") {
                setBody(resumen)
            }.body<RespuestaIA>()
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
