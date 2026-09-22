package com.example.cunamas.core.auth.data

import kotlinx.serialization.Serializable

@Serializable
data class AuthResponseDto(
    val token: String,
    val refreshToken: String,
    val tipo: String,
    val expiraEn: Int,
    val idPersona: Int,
    val nombre: String,
    val roles: List<String>,
    val distrito: String?,
    val tieneDireccion: Boolean
)