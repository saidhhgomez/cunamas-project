package com.example.cunamas.feature.gestion.presentation.detalle_usuario

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cunamas.core.session.SessionManager
import com.example.cunamas.feature.gestion.domain.model.DetalleUsuario
import com.example.cunamas.feature.gestion.usecase.AprobarUsuarioUseCase
import com.example.cunamas.feature.gestion.usecase.GetUsuarioDetalleUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class DetalleUsuarioState {
    object Loading : DetalleUsuarioState()
    data class Listo(val usuario: DetalleUsuario) : DetalleUsuarioState()
    data class Error(val mensaje: String) : DetalleUsuarioState()
}

sealed class AprobacionState {
    object Idle : AprobacionState()
    object Enviando : AprobacionState()
    data class Exito(val mensaje: String) : AprobacionState()
    data class Error(val mensaje: String) : AprobacionState()
}

class DetalleUsuarioViewModel(
    private val getUsuarioDetalleUseCase: GetUsuarioDetalleUseCase,
    private val aprobarUsuarioUseCase: AprobarUsuarioUseCase,
    val sessionManager: SessionManager
) : ViewModel() {

    private val _state = MutableStateFlow<DetalleUsuarioState>(DetalleUsuarioState.Loading)
    val state: StateFlow<DetalleUsuarioState> = _state

    private val _aprobacionState = MutableStateFlow<AprobacionState>(AprobacionState.Idle)
    val aprobacionState: StateFlow<AprobacionState> = _aprobacionState

    fun cargarDetalle(id: Int) {
        viewModelScope.launch {
            _state.value = DetalleUsuarioState.Loading
            val result = getUsuarioDetalleUseCase(id)
            _state.value = result.fold(
                onSuccess = { DetalleUsuarioState.Listo(it) },
                onFailure = { DetalleUsuarioState.Error(it.message ?: "Error al cargar") }
            )
        }
    }

    fun aprobar(idPersona: Int, rolesIds: List<Int>) {
        viewModelScope.launch {
            _aprobacionState.value = AprobacionState.Enviando
            val result = aprobarUsuarioUseCase(idPersona, rolesIds)
            _aprobacionState.value = result.fold(
                onSuccess = { AprobacionState.Exito(it) },
                onFailure = { AprobacionState.Error(it.message ?: "Error al aprobar") }
            )
        }
    }

    fun limpiarError() {
        _aprobacionState.value = AprobacionState.Idle
    }
}