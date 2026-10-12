package com.example.cunamas.core.common

import kotlinx.serialization.Serializable

@Serializable
data class CentroAlimentario(
    val id: Int,
    val nombreCentro: String,
    val nombreComite: String,
    val direccion: String
)