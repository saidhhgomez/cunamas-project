package com.example.cunamas.core.common.dto.response

import kotlinx.serialization.Serializable

@Serializable
data class ModuloDto(
    val idModulo: Int,
    val nombreModulo: String
)