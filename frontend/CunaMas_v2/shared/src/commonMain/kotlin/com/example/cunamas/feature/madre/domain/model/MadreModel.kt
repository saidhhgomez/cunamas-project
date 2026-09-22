package com.example.cunamas.feature.madre.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class DireccionRequest(
    val idDistrito: Int,
    val nombreDireccion: String
)

@Serializable
data class DireccionResponse(
    val mensaje: String
)
