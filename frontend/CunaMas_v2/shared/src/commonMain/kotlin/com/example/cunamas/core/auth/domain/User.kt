package com.example.cunamas.core.auth.domain


data class User(
    val idPersona: Int,
    val nombre: String,
    val distrito: String?,
    val tieneDireccion: Boolean,
    val roles: List<Role>,
    val token: String // 👈 Agrégalo aquí
) {
    val rolPrincipal: Role
        get() = if (roles.isNotEmpty()) roles[0] else Role.DESCONOCIDO

    fun tieneRol(role: Role): Boolean = roles.contains(role)
}