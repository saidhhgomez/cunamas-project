package com.example.cunamas.core.common.dto.response
import kotlinx.serialization.Serializable

@Serializable
data class RangoPreparacionDto(
    val idCatNino: Int,
    val rangoEdad: String,
    val gramosOMl: Int
)