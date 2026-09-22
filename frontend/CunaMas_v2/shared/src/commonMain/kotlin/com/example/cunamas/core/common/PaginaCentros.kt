package com.example.cunamas.core.common

import kotlinx.serialization.Serializable

@Serializable
data class PaginaCentros(
    val items: List<CentroAlimentario>,
    val currentPage: Int,
    val totalElements: Int,
    val totalPages: Int
) {
    val esUltimaPagina: Boolean get() = currentPage + 1 >= totalPages
}