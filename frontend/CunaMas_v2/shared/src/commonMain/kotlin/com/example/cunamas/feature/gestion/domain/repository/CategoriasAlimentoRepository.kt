package com.example.cunamas.feature.gestion.domain.repository

import com.example.cunamas.core.common.CategoriaAlimento


interface CategoriasAlimentoRepository {
    suspend fun getCategorias(): List<CategoriaAlimento>
}