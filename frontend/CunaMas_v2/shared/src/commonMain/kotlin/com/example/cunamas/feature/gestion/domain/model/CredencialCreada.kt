package com.example.cunamas.feature.gestion.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class CredencialCreada(
    val mensaje: String,
    val idPersona: Int,
    val passwordTemporal: String
)