package com.example.cunamas.feature.gestion.data.dto.response

import kotlinx.serialization.Serializable

@Serializable
data class UsuarioPendienteDto(
    val idPersona: Int,
    val numeroDocumento: String,
    val nombresCompletos: String,
    val correoElectronico: String,
    val fechaRegistro: String,
    val estadoCuenta: Boolean
)