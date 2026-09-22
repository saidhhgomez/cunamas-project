package com.example.cunamas.feature.gestion.data.dto.response

import kotlinx.serialization.Serializable

@Serializable
data class CrearModuloResponseDto(
    val mensaje: String,
    val idModulo: Int
)