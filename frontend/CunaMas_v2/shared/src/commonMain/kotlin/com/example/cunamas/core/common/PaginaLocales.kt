package com.example.cunamas.core.common

import kotlinx.serialization.Serializable

data class PaginaLocales(
    val items: List<Local>,
    val currentPage: Int,
    val totalElements: Int,
    val totalPages: Int
) {
    val esUltimaPagina: Boolean get() = currentPage + 1 >= totalPages
}