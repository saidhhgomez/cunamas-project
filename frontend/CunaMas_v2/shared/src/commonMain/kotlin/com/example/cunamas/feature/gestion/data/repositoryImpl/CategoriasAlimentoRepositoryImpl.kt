package com.example.cunamas.feature.gestion.data.repositoryImpl

import com.example.cunamas.core.common.CategoriaAlimento
import com.example.cunamas.feature.gestion.data.remote.CategoriasAlimentoApi
import com.example.cunamas.feature.gestion.domain.repository.CategoriasAlimentoRepository

class CategoriasAlimentoRepositoryImpl(
    private val apiService: CategoriasAlimentoApi // 👈 Recibe el cliente Ktor sin @Inject
) : CategoriasAlimentoRepository {

    override suspend fun getCategorias(): List<CategoriaAlimento> {
        return apiService.getCategorias().map {
            CategoriaAlimento(
                id = it.idCategoriaAlimento,
                nombre = it.nombreCategoriaAlimento
            )
        }
    }
}