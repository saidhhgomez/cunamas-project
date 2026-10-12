package com.example.cunamas.core.common.dto.request

import kotlinx.serialization.Serializable

@Serializable
data class CalcularRequestDto(
    val categorias: List<CategoriaCantidadDto>
)

@kotlinx.serialization.Serializable
data class CategoriaCantidadDto(
    val idCategoriaGrupo: Int,
    val cantidad: Int
)