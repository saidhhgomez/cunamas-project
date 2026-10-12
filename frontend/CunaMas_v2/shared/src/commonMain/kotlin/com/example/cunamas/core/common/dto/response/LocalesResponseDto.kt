package com.example.cunamas.core.common.dto.response

import kotlinx.serialization.Serializable

@Serializable
data class LocalesResponseDto(
    val content: List<LocalDto>,
    val currentPage: Int,
    val totalElements: Int,
    val totalPages: Int
)