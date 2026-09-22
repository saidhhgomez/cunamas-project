package com.example.cunamas.core.common

import kotlinx.serialization.Serializable

data class Local(
    val id: Int,
    val nombre: String,
    val direccion: String,
    val servicioAlimentario: String
)