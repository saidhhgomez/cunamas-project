package com.example.cunamas.feature.madre.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class DireccionRequest(
    val idDistrito: Int,
    val nombreDireccion: String
)

@Serializable
data class DireccionResponse(
    val mensaje: String
)

@Serializable
data class AsistenciaMadreRequest(
    val idModulo: Int,
    val idUsuarioCreacion: Int,
    val registroCorrelativo: Int,
    val categorias: List<CategoriaAsistenciaMadre>
)

@Serializable
data class CategoriaAsistenciaMadre(
    val idCategoriaGrupo: Int,
    val cantidad: Int
)

@Serializable
data class AsistenciaMadreResponse(
    val mensaje: String,
    val totalRegistros: Int? = null
)
