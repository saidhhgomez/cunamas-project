package com.example.cunamas.feature.gestion.data.dto.response

import kotlinx.serialization.Serializable

@Serializable
data class ResumenServicioResponseDto(
    val servicioAlimentario: String,
    val totales: List<TotalCategoriaDto>? = null // Opcional: puedes dejarlo con un valor por defecto
)

@Serializable
data class TotalCategoriaDto(
    val idCategoriaGrupo: Int,
    val categoria: String,
    val cantidad: Int
)