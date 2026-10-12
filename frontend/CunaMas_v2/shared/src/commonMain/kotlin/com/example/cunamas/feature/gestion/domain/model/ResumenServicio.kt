package com.example.cunamas.feature.gestion.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class ResumenServicio(
    val servicioAlimentario: String,
    val totales: List<TotalCategoria> = emptyList()
)