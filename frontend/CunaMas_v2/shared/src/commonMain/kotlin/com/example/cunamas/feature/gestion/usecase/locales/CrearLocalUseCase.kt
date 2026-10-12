package com.example.cunamas.feature.gestion.usecase.locales

import com.example.cunamas.feature.gestion.data.dto.response.CrearLocalResponseDto
import com.example.cunamas.feature.gestion.domain.repository.CentrosAlimentariosRepository
import com.example.cunamas.feature.gestion.domain.repository.LocalesRepository


class CrearLocalUseCase(
    private val direccionesRepository: CentrosAlimentariosRepository,
    private val repository: LocalesRepository
) {
    suspend operator fun invoke(
        idDistrito: Int,
        nombreDireccion: String,
        idCentroAlimentario: Int,
        localNombre: String
    ): CrearLocalResponseDto {
        // 1️⃣ Primero crea la dirección y obtiene el idDireccion
        val idDireccion = direccionesRepository.crearDireccion(idDistrito, nombreDireccion)

        // 2️⃣ Luego crea el centro de atención infantil usando ese idDireccion
        return repository.crearLocal(idDireccion, idCentroAlimentario, localNombre)
    }
}