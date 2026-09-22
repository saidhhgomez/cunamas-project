package com.example.cunamas.feature.gestion.data.repositoryImpl


import com.example.cunamas.core.common.CentroAlimentario
import com.example.cunamas.core.common.PaginaCentros
import com.example.cunamas.core.common.dto.request.DireccionRequestDto
import com.example.cunamas.feature.gestion.data.dto.request.CrearCentroAlimentarioRequestDto
import com.example.cunamas.feature.gestion.data.dto.response.CrearCentroAlimentarioResponseDto
import com.example.cunamas.feature.gestion.data.remote.CentrosAlimentariosApi
import com.example.cunamas.feature.gestion.domain.model.Distrito
import com.example.cunamas.feature.gestion.domain.repository.CentrosAlimentariosRepository

class CentrosAlimentariosRepositoryImpl(
    private val apiService: CentrosAlimentariosApi // 👈 Recibe el servicio Ktor sin @Inject
) : CentrosAlimentariosRepository {

    override suspend fun getCentros(distrito: String, page: Int, size: Int): PaginaCentros {
        val dto = apiService.getCentros(distrito, page, size)
        return PaginaCentros(
            items = dto.content.map {
                CentroAlimentario(
                    id = it.idCentroAlimentario,
                    nombreCentro = it.nombreCentro,
                    nombreComite = it.nombreComite,
                    direccion = it.direccion
                )
            },
            currentPage = dto.currentPage,
            totalElements = dto.totalElements,
            totalPages = dto.totalPages
        )
    }

    override suspend fun getCentroById(id: Int): CentroAlimentario {
        val dto = apiService.getCentroById(id)
        return CentroAlimentario(
            id = dto.idCentroAlimentario,
            nombreCentro = dto.nombreCentro,
            nombreComite = dto.nombreComite,
            direccion = dto.direccion
        )
    }

    override suspend fun buscarDistritos(query: String): List<Distrito> {
        return apiService.buscarDistritos(query).map {
            Distrito(
                id = it.idDistrito,
                distrito = it.distrito,
                provincia = it.provincia,
                departamento = it.departamento
            )
        }
    }

    override suspend fun crearDireccion(idDistrito: Int, nombreDireccion: String): Int {
        val response = apiService.crearDireccion(DireccionRequestDto(idDistrito, nombreDireccion))
        return response.idGenerado
    }

    override suspend fun crearCentroAlimentario(
        idDireccion: Int,
        nombreCentro: String,
        nombreComite: String
    ): CrearCentroAlimentarioResponseDto {
        val response = apiService.crearCentroAlimentario(
            CrearCentroAlimentarioRequestDto(idDireccion, nombreCentro, nombreComite)
        )
        return CrearCentroAlimentarioResponseDto(
            idCentroAlimentario = response.idCentroAlimentario,
            mensaje = response.mensaje
        )
    }
}