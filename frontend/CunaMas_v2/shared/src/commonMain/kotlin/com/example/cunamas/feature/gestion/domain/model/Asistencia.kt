package com.example.cunamas.feature.gestion.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class Asistencia(
    val fecha: String,
    val idModulo: Int,
    val registroManana: List<RegistroCategoria>,
    val registroTarde: List<RegistroCategoria>
)

@Serializable
data class RegistroCategoria(
    val id: Int,
    val categoria: String,
    val cantidad: Int
)
