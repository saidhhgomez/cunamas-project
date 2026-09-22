package com.example.cunamas.core.common.dto.response

import kotlinx.serialization.Serializable

@Serializable
data class DistritoDto(
    val idDistrito: Int,
    val distrito: String,
    val provincia: String,
    val departamento: String,
    val ubigeo: Int
)