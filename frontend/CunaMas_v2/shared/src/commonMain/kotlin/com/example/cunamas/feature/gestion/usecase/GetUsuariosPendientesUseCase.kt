package com.example.cunamas.feature.gestion.usecase

import com.example.cunamas.feature.gestion.domain.model.UsuarioPendiente
import com.example.cunamas.feature.gestion.domain.repository.GestionRepository

class GetUsuariosPendientesUseCase(
    private val repository: GestionRepository
) {
    suspend operator fun invoke(): Result<List<UsuarioPendiente>> {
        return repository.getUsuariosPendientes()
    }
}