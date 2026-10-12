package com.example.cunamas.feature.gestion.usecase

import com.example.cunamas.feature.gestion.domain.model.DetalleUsuario
import com.example.cunamas.feature.gestion.domain.repository.GestionRepository

class GetUsuarioDetalleUseCase(
    private val repository: GestionRepository
) {
    suspend operator fun invoke(id: Int): Result<DetalleUsuario> {
        return repository.getUsuarioDetalle(id)
    }
}