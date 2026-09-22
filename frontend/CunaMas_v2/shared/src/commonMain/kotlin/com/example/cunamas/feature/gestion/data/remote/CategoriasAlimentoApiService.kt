package com.example.cunamas.feature.gestion.data.remote

import com.example.cunamas.core.common.dto.response.CategoriaAlimentoDto
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get

class CategoriasAlimentoApi(
    private val client: HttpClient
) {
    suspend fun getCategorias(): List<CategoriaAlimentoDto> {
        return client.get("calculadora/categorias").body()
    }
}