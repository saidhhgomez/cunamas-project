package com.example.cunamas.core.common.dto.response

import kotlinx.serialization.Serializable

@Serializable
data class CalcularResponseDto(
    val alimento: String,
    val empaquesSugeridos: Map<String, Int>,
    val totalGramosO_Ml: Double,
    val unidad: String
)