package com.example.cunamas.feature.gestion.data.repositoryImpl

import com.example.cunamas.core.common.Modulo
import com.example.cunamas.core.common.PaginaModulos
import com.example.cunamas.core.common.dto.request.ModuloRequestDto
import com.example.cunamas.feature.gestion.data.dto.response.CrearModuloResponseDto
import com.example.cunamas.feature.gestion.data.remote.ModulosApi
import com.example.cunamas.feature.gestion.domain.repository.ModulosRepository

class ModulosRepositoryImpl(
    private val apiService: ModulosApi // 👈 Recibe el servicio Ktor sin @Inject
) : ModulosRepository {

    override suspend fun getModulos(idLocal: Int, page: Int, size: Int): PaginaModulos {
        val dto = apiService.getModulos(idLocal, page, size)
        return PaginaModulos(
            items = dto.contenido.map {
                Modulo(id = it.idModulo, nombre = it.nombreModulo)
            },
            currentPage = dto.paginaActual,
            totalElements = dto.totalElementos,
            totalPages = dto.totalPaginas
        )
    }

    override suspend fun crearModulo(idLocal: Int, nombreModulo: String): CrearModuloResponseDto {
        return apiService.crearModulo(
            ModuloRequestDto(
                nombreModulo = nombreModulo,
                idLocal = idLocal
            )
        )
    }
}