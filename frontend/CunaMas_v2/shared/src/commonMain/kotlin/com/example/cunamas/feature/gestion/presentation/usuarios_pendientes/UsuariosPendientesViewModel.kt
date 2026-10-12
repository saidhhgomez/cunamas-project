package com.example.cunamas.feature.gestion.presentation.usuarios_pendientes

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cunamas.core.session.SessionManager
import com.example.cunamas.feature.gestion.domain.model.UsuarioPendiente
import com.example.cunamas.feature.gestion.usecase.GetUsuariosPendientesUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class UsuariosPendientesState {
    object Loading : UsuariosPendientesState()
    data class Listo(val usuarios: List<UsuarioPendiente>) : UsuariosPendientesState()
    data class Error(val mensaje: String) : UsuariosPendientesState()
}

class UsuariosPendientesViewModel(
    private val getUsuariosPendientesUseCase: GetUsuariosPendientesUseCase,
    val sessionManager: SessionManager
) : ViewModel() {

    private val _state = MutableStateFlow<UsuariosPendientesState>(UsuariosPendientesState.Loading)
    val state: StateFlow<UsuariosPendientesState> = _state

    init { cargar() }

    fun cargar() {
        viewModelScope.launch {
            _state.value = UsuariosPendientesState.Loading
            val result = getUsuariosPendientesUseCase()
            _state.value = result.fold(
                onSuccess = { UsuariosPendientesState.Listo(it) },
                onFailure = { UsuariosPendientesState.Error(it.message ?: "Error al cargar usuarios") }
            )
        }
    }
}