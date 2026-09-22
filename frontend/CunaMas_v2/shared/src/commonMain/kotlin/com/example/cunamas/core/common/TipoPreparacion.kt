package com.example.cunamas.core.common

import kotlinx.serialization.Serializable

@Serializable
data class TipoPreparacion(
    val id: Int,
    val nombre: String,
    val porcionComestible: Int
)