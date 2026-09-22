package com.example.cunamas.feature.madre.domain.repository

import com.example.cunamas.feature.madre.domain.model.AsistenciaMadreRequest
import com.example.cunamas.feature.madre.domain.model.AsistenciaMadreResponse
import com.example.cunamas.feature.madre.domain.model.CentroAtencion
import com.example.cunamas.feature.madre.domain.model.DireccionRequest
import com.example.cunamas.feature.madre.domain.model.DireccionResponse

interface MadreRepository {
    suspend fun guardarDireccion(request: DireccionRequest): Result<DireccionResponse>
    suspend fun getCentrosAtencion(distrito: String): List<CentroAtencion>
    suspend fun registrarAsistencia(request: AsistenciaMadreRequest): Result<AsistenciaMadreResponse>
}
