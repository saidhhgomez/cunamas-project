package com.example.cunamas.feature.gestion.data.dto.response

import kotlinx.serialization.Serializable

@Serializable
data class AsistenciaResponseDto(
    val fecha: String,
    val idModulo: Int,
    val registroManana: List<RegistroCategoriaDto>,
    val registroTarde: List<RegistroCategoriaDto>
)
@Serializable
data class RegistroCategoriaDto(
    val cantidad: Int,
    val categoria: String,
    val idCategoriaGrupo: Int
)