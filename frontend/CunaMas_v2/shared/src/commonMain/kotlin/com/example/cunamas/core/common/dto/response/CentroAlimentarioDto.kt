package com.example.cunamas.core.common.dto.response

import kotlinx.serialization.Serializable


@Serializable
data class CentroAlimentarioDto(
    val idCentroAlimentario: Int,
    val nombreCentro: String,
    val nombreComite: String,
    val direccion: String
)