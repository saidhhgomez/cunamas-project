package com.example.cunamas.feature.gestion.data.repositoryImpl

import com.example.cunamas.core.common.Local
import com.example.cunamas.core.common.PaginaLocales
import com.example.cunamas.feature.gestion.data.dto.request.CrearLocalRequestDto
import com.example.cunamas.feature.gestion.data.dto.response.CrearLocalResponseDto
import com.example.cunamas.feature.gestion.data.remote.LocalesApi
import com.example.cunamas.feature.gestion.domain.repository.LocalesRepository

class LocalesRepositoryImpl(
    private val apiService: LocalesApi // 👈 Recibe el servicio Ktor sin @Inject
) : LocalesRepository {

    override suspend fun getLocales(idCentroAlimentario: Int, page: Int, size: Int): PaginaLocales {
        val dto = apiService.getLocales(idCentroAlimentario, page, size)
        return PaginaLocales(
            items = dto.content.map {
                Local(
                    id = it.idLocal,
                    nombre = it.localNombre,
                    direccion = it.direccion,
                    servicioAlimentario = it.servicioAlimentario
                )
            },
            currentPage = dto.currentPage,
            totalElements = dto.totalElements,
            totalPages = dto.totalPages
        )
    }

    override suspend fun crearLocal(
        idDireccion: Int,
        idCentroAlimentario: Int,
        localNombre: String
    ): CrearLocalResponseDto {
        return apiService.crearLocal(
            CrearLocalRequestDto(
                idDireccion = idDireccion,
                idCentroAlimentario = idCentroAlimentario,
                localNombre = localNombre
            )
        )
    }
}