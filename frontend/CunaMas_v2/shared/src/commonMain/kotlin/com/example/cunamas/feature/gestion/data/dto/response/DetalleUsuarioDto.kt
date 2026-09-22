package com.example.cunamas.feature.gestion.data.dto.response

import kotlinx.serialization.Serializable

@Serializable
data class DetalleUsuarioDto(
    val idPersona: Int,
    val nombres: String,
    val apPaterno: String,
    val apMaterno: String,
    val numeroDocumento: String,
    val tipoDocumento: String,
    val correoElectronico: String,
    val telefono: String?,
    val genero: String,
    val direccion: String?,
    val distrito: String?,
    val fechaNacimiento: String?,
    val fechaRegistro: String
)