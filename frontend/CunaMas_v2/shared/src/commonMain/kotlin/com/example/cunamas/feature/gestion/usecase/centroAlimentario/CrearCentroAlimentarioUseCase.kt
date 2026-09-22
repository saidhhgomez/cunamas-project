package com.example.cunamas.feature.gestion.usecase.centroAlimentario

import com.example.cunamas.feature.gestion.data.dto.response.CrearCentroAlimentarioResponseDto
import com.example.cunamas.feature.gestion.domain.repository.CentrosAlimentariosRepository


class CrearCentroAlimentarioUseCase(
    private val repository: CentrosAlimentariosRepository
) {
    suspend operator fun invoke(
        idDistrito: Int,
        nombreDireccion: String,
        nombreCentro: String,
        nombreComite: String
    ): CrearCentroAlimentarioResponseDto {
        val idDireccion = repository.crearDireccion(idDistrito, nombreDireccion)
        return repository.crearCentroAlimentario(idDireccion, nombreCentro, nombreComite)
    }
}