package com.example.cunamas.feature.madre.domain.repository

import com.example.cunamas.feature.madre.domain.model.DireccionRequest
import com.example.cunamas.feature.madre.domain.model.DireccionResponse

interface MadreRepository {
    suspend fun guardarDireccion(request: DireccionRequest): Result<DireccionResponse>
}
