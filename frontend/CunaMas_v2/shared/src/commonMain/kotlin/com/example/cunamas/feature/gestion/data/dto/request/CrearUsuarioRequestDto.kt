package com.example.cunamas.feature.gestion.data.dto.request

data class CrearUsuarioRequestDto(
    val persona: PersonaCrearDto,
    val cuenta: CuentaCrearDto,
    val roles: List<Int>
)

data class PersonaCrearDto(
    val idDocumento: Int,
    val numeroDocumento: String,
    val nombres: String,
    val apPaterno: String,
    val apMaterno: String,
    val idGenero: Int
)

data class CuentaCrearDto(
    val correoElectronico: String
)