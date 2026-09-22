package com.example.cunamas.feature.cocina.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class ResumenIA(
    val alimentos: List<AlimentoIA> = emptyList()
)

@Serializable
data class AlimentoIA(
    val nombre: String,
    val categoriaEtaria: CategoriaEtariaIA,
    val presentacion: PresentacionIA
)

@Serializable
data class CategoriaEtariaIA(
    val ninos6a9Meses: Int,
    val ninos10a12Meses: Int,
    val ninos13a23Meses: Int,
    val ninos24a36Meses: Int,
    val actoresComunales: Int
)

@Serializable
data class PresentacionIA(
    val bolsas1kg: Int,
    val bolsas500g: Int,
    val bolsas250g: Int
)
