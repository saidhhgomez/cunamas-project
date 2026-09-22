package com.example.cunamas.feature.cocina.domain.model

data class ResumenCocinaAsistencia(
    val idServicioAlimentario: Int,
    val servicioAlimentario: String,
    val locales: List<CocinaLocal>,
    val totales: List<CocinaTotal>
)

data class CocinaLocal(
    val idLocal: Int,
    val nombreLocal: String,
    val modulos: List<CocinaModulo>
)

data class CocinaModulo(
    val idModulo: Int,
    val nombreModulo: String,
    val asistencia: List<CocinaItemAsistencia>
)

data class CocinaItemAsistencia(
    val idCategoriaGrupo: Int,
    val categoria: String,
    val cantidad: Int
)

data class CocinaTotal(
    val idCategoriaGrupo: Int,
    val categoria: String,
    val cantidad: Int
)
