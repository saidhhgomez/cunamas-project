package com.example.cunamas.feature.madre.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class CentroAtencion(
    val idLocal: Int,
    val localNombre: String,
    val direccion: String,
    val servicioAlimentario: String
)
