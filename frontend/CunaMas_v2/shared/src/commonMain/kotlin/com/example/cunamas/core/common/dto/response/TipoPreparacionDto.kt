package com.example.cunamas.core.common.dto.response

import kotlinx.serialization.Serializable

@Serializable
data class TipoPreparacionDto(
    val idTipoPreparacion: Int,
    val nombrePreparacion: String,
    val porcionComestible: Int
)