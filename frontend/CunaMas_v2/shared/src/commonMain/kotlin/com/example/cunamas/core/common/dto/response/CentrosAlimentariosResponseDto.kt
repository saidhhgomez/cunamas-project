package com.example.cunamas.core.common.dto.response

import kotlinx.serialization.Serializable

@Serializable
data class CentrosAlimentariosResponseDto(
    val content: List<CentroAlimentarioDto>,   // 👈 debe existir este campo
    val currentPage: Int,
    val totalElements: Int,
    val totalPages: Int
)