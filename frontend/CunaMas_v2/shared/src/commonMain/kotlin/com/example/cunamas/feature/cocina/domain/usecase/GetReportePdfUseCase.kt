package com.example.cunamas.feature.cocina.domain.usecase

import com.example.cunamas.feature.cocina.domain.repository.CocinaReporteRepository

class GetReportePdfUseCase(
    private val repository: CocinaReporteRepository
) {
    suspend operator fun invoke(idCentroAlimentario: Int, fecha: String, correlativo: Int): Result<ByteArray> {
        return repository.getReportePdf(idCentroAlimentario, fecha, correlativo)
    }
}
