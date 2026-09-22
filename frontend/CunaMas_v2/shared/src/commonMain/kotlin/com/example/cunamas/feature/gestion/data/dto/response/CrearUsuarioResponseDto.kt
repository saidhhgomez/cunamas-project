package com.example.cunamas.feature.gestion.data.dto.response

import kotlinx.serialization.Serializable

@Serializable
data class CrearUsuarioResponseDto(
    val mensaje: String,

    val idPersona: Int,

    val passwordTemporal: String
)