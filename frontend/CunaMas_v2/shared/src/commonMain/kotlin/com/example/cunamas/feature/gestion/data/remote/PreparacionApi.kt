package com.example.cunamas.feature.gestion.data.remote

import com.example.cunamas.core.common.dto.response.TipoPreparacionDto
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get

class PreparacionApi(
    private val client: HttpClient
) {
    suspend fun getPreparaciones(idCategoriaAlimento: Int): List<TipoPreparacionDto> {
        return client.get("calculadora/preparaciones/$idCategoriaAlimento").body()
    }
}