package com.example.cunamas.core.common.dto.response

import kotlinx.serialization.Serializable

@Serializable
data class LocalDto(
    val idLocal: Int,
    val localNombre: String,
    val direccion: String,
    val servicioAlimentario: String
)