package com.example.cunamas.core.common

import kotlinx.serialization.Serializable

@Serializable
data class PaginaModulos(
    val items: List<Modulo>,
    val currentPage: Int,
    val totalElements: Int,
    val totalPages: Int
) {
    val esUltimaPagina: Boolean get() = currentPage + 1 >= totalPages
}