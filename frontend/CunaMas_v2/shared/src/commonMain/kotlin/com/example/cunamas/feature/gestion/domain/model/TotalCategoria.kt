package com.example.cunamas.feature.gestion.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class TotalCategoria(
    // Tus propiedades aquí (por ejemplo, id, nombre, cantidad, etc.)
    val id: Int,
    val categoria: String,
    val cantidad: Int
)