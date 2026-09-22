package com.example.cunamas.core.common.dto.request

import kotlinx.serialization.Serializable

@Serializable
data class DireccionRequestDto(
    val idDistrito: Int,
    val nombreDireccion: String
)