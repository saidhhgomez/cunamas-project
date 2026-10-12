package com.example.cunamas.feature.gestion.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class Distrito(
    val id: Int,
    val distrito: String,
    val provincia: String,
    val departamento: String
)