package com.example.cunamas.core.auth.data.dto

import kotlinx.serialization.Serializable

@Serializable
data class LoginRequestDto(
    val numeroDocumento: String,
    val password: String,
    val dispositivo: DispositivoDto
)