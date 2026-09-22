package com.example.cunamas.feature.gestion.data.dto.response

import kotlinx.serialization.Serializable

@Serializable
data class CrearCentroAlimentarioResponseDto(
    val mensaje: String,
    val idCentroAlimentario: Int
)