package com.example.cunamas.feature.cocina.domain.repository

import com.example.cunamas.feature.cocina.domain.model.RespuestaIA
import com.example.cunamas.feature.cocina.domain.model.ResumenIA

interface CocinaIARepository {
    suspend fun analizarAlimentos(resumen: ResumenIA): Result<RespuestaIA>
}
