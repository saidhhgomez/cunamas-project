package com.example.cunamas.feature.gestion.domain.repository

import com.example.cunamas.core.common.PaginaLocales
import com.example.cunamas.feature.gestion.data.dto.response.CrearLocalResponseDto

interface LocalesRepository {
    suspend fun getLocales(idCentroAlimentario: Int, page: Int, size: Int): PaginaLocales

    suspend fun crearLocal(
        idDireccion: Int,
        idCentroAlimentario: Int,
        localNombre: String
    ): CrearLocalResponseDto
}