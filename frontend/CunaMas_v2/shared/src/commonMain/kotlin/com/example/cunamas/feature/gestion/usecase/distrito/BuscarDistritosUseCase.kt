package com.example.cunamas.feature.gestion.usecase.distrito

import com.example.cunamas.feature.gestion.domain.model.Distrito
import com.example.cunamas.feature.gestion.domain.repository.CentrosAlimentariosRepository

class BuscarDistritosUseCase(
    private val repository: CentrosAlimentariosRepository
) {
    suspend operator fun invoke(query: String): List<Distrito> = repository.buscarDistritos(query)
}