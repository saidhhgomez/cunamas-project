package com.example.cunamas.feature.gestion.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class DetalleUsuario(
    val idPersona: Int,
    val nombreCompleto: String,
    val numeroDocumento: String,
    val tipoDocumento: String,
    val correoElectronico: String,
    val telefono: String?,
    val genero: String,
    val direccion: String?,
    val distrito: String?,
    val fechaRegistro: String
)