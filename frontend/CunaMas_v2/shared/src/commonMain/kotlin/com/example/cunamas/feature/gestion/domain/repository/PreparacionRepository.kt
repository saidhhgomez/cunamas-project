package com.example.cunamas.feature.gestion.domain.repository

import com.example.cunamas.core.common.TipoPreparacion

interface PreparacionRepository {
    suspend fun getPreparaciones(idCategoriaAlimento: Int): List<TipoPreparacion>
}