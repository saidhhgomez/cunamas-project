package com.example.cunamas.core.auth.data

import kotlinx.serialization.Serializable

@Serializable
data class RegisterRequestDto(
    val persona: PersonaDto,
    val cuenta: CuentaDto
)
@Serializable
data class PersonaDto(
    val idDocumento: Int,
    val numeroDocumento: String,
    val nombres: String,
    val apPaterno: String,
    val apMaterno: String,
    val idGenero: Int
)

@Serializable
data class CuentaDto(
    val correoElectronico: String,
    val password: String
)