package com.example.cunamas.core.common.dto.response

import kotlinx.serialization.Serializable

@Serializable
data class DireccionResponseDto(
    val idGenerado: Int,
    val mensaje: String
)