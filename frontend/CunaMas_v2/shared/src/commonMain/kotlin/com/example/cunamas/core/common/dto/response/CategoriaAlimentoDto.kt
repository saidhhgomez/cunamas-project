package com.example.cunamas.core.common.dto.response

import kotlinx.serialization.Serializable

@Serializable
data class CategoriaAlimentoDto(
    val idCategoriaAlimento: Int,
    val nombreCategoriaAlimento: String
)