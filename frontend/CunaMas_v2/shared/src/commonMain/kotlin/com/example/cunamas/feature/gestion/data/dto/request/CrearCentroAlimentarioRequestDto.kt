package com.example.cunamas.feature.gestion.data.dto.request

import kotlinx.serialization.Serializable

@Serializable
data class CrearCentroAlimentarioRequestDto(
    val idDireccion: Int,
    val nombreCentro: String,
    val nombreComite: String
)