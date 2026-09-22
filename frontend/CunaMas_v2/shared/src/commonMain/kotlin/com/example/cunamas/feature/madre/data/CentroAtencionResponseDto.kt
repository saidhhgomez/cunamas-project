package com.example.cunamas.feature.madre.data

import com.example.cunamas.feature.madre.domain.model.CentroAtencion
import kotlinx.serialization.Serializable

@Serializable
data class CentroAtencionResponseDto(
    val content: List<CentroAtencion>,
    val currentPage: Int,
    val totalElements: Int,
    val totalPages: Int
)
