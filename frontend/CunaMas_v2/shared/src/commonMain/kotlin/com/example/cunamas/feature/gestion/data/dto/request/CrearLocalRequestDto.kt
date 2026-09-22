package com.example.cunamas.feature.gestion.data.dto.request

import kotlinx.serialization.Serializable

@Serializable
data class CrearLocalRequestDto(
    val idDireccion: Int,
    val idCentroAlimentario: Int,
    val localNombre: String
)