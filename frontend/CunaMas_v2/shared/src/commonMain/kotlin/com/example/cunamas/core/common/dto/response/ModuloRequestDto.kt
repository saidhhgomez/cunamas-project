package com.example.cunamas.core.common.dto.response

import kotlinx.serialization.Serializable

@Serializable

data class ModulosResponseDto(
    val contenido: List<ModuloDto>,      // 👈 ojo, no "content"
    val totalElementos: Int,             // 👈 no "totalElements"
    val totalPaginas: Int,               // 👈 no "totalPages"
    val paginaActual: Int                // 👈 no "currentPage"
)