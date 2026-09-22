package com.example.cunamas.feature.gestion.data.dto.request

import kotlinx.serialization.Serializable

@Serializable
data class AprobarUsuarioRequestDto(
    val idPersona: Int,
    val roles: List<Int>
)