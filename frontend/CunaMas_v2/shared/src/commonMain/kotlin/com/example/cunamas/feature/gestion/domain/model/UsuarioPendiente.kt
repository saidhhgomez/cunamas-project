package com.example.cunamas.feature.gestion.domain.model

data class UsuarioPendiente(
    val idPersona: Int,
    val numeroDocumento: String,
    val nombresCompletos: String,
    val correoElectronico: String,
    val fechaRegistro: String,
    val estadoCuenta: Boolean
)