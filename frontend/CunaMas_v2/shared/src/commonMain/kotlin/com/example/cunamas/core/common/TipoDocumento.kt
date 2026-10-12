package com.example.cunamas.core.common


enum class TipoDocumento(
    val id: Int,
    val label: String,
    val soloNumerico: Boolean,
    val longitudMaxima: Int
) {
    DNI(1, "DNI", soloNumerico = true, longitudMaxima = 8),
    CARNET_EXTRANJERIA(2, "Carnet de Extranjería (CE)", soloNumerico = false, longitudMaxima = 12),
    PASAPORTE(3, "Pasaporte", soloNumerico = false, longitudMaxima = 12)
}