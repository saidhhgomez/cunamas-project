package com.example.cunamas.feature.cocina.presentation.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cunamas.core.auth.domain.AuthRepository
import com.example.cunamas.core.session.SessionManager
import kotlinx.coroutines.launch

class SociaCocinaHomeViewModel(
    val sessionManager: SessionManager,
    private val authRepository: AuthRepository
) : ViewModel() {

    fun cerrarSesion() {
        viewModelScope.launch {
            authRepository.logout()
        }
    }
}