package com.example.cunamas.core.auth.data.dto

import kotlinx.serialization.Serializable

@Serializable
data class DispositivoDto(
    val nombreDispositivo: String,
    val uuidDispositivo: String
)