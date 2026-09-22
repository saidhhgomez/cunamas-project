package com.example.cunamas.feature.cocina.data

import kotlinx.serialization.Serializable

@Serializable
data class ResumenServicioResponseDto(
    val idServicioAlimentario: Int,
    val locales: List<LocalDto>,
    val servicioAlimentario: String,
    val totales: List<TotalCategoriaDto>? = null
)

@Serializable
data class LocalDto(
    val idLocal: Int,
    val modulos: List<ModuloDto>,
    val nombreLocal: String
)

@Serializable
data class ModuloDto(
    val asistencia: List<AsistenciaModuloDto>,
    val idModulo: Int,
    val nombreModulo: String
)

@Serializable
data class AsistenciaModuloDto(
    val idCategoriaGrupo: Int,
    val categoria: String,
    val cantidad: Int
)

@Serializable
data class TotalCategoriaDto(
    val idCategoriaGrupo: Int,
    val categoria: String,
    val cantidad: Int
)