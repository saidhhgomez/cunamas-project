package com.example.cunamas.feature.gestion.data.repositoryImpl

import com.example.cunamas.core.common.TipoPreparacion
import com.example.cunamas.feature.gestion.data.remote.PreparacionApi
import com.example.cunamas.feature.gestion.domain.repository.PreparacionRepository

class PreparacionRepositoryImpl(
    private val apiService: PreparacionApi // 👈 Recibe el servicio Ktor sin @Inject
) : PreparacionRepository {

    override suspend fun getPreparaciones(idCategoriaAlimento: Int): List<TipoPreparacion> {
        return apiService.getPreparaciones(idCategoriaAlimento).map {
            TipoPreparacion(
                id = it.idTipoPreparacion,
                nombre = it.nombrePreparacion,
                porcionComestible = it.porcionComestible
            )
        }
    }
}