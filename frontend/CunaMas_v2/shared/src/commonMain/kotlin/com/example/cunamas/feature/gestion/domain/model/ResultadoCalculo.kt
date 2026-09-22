package com.example.cunamas.feature.gestion.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class ResultadoCalculo(
    val alimento: String,
    val empaquesSugeridos: Map<String, Int>,
    val totalGramosOMl: Double,
    val unidad: String
)