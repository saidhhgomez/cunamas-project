package com.example.cunamas.feature.gestion.domain.repository
import com.example.cunamas.core.common.PaginaModulos
import com.example.cunamas.feature.gestion.data.dto.response.CrearModuloResponseDto

interface ModulosRepository {
    suspend fun getModulos(idLocal: Int, page: Int, size: Int): PaginaModulos
    suspend fun crearModulo(idLocal: Int, nombreModulo: String): CrearModuloResponseDto
}