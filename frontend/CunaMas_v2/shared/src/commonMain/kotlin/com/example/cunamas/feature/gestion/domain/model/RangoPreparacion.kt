package com.example.cunamas.feature.gestion.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class RangoPreparacion(
    val idCatNino: Int,
    val rangoEdad: String,
    val gramosOMl: Int
)