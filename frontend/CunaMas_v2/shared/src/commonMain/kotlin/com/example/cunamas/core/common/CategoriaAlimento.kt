package com.example.cunamas.core.common

import kotlinx.serialization.Serializable

@Serializable
data class CategoriaAlimento(
    val id: Int,
    val nombre: String
)