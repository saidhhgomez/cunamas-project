package com.example.cunamas.feature.madre.presentation.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cunamas.core.session.SessionManager
import com.example.cunamas.feature.gestion.domain.model.Distrito
import com.example.cunamas.feature.gestion.usecase.distrito.BuscarDistritosUseCase
import com.example.cunamas.feature.madre.domain.usecase.GuardarDireccionUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filter
import kotlinx.coroutines.launch

class MadreHomeViewModel(
    val sessionManager: SessionManager,
    private val buscarDistritos: BuscarDistritosUseCase,
    private val guardarDireccion: GuardarDireccionUseCase
) : ViewModel() {

    private val _distritosSugeridos = MutableStateFlow<List<Distrito>>(emptyList())
    val distritosSugeridos: StateFlow<List<Distrito>> = _distritosSugeridos.asStateFlow()

    private val _queryDistrito = MutableStateFlow("")
    val queryDistrito: StateFlow<String> = _queryDistrito.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _exitoRegistro = MutableStateFlow(false)
    val exitoRegistro: StateFlow<Boolean> = _exitoRegistro.asStateFlow()

    init {
        viewModelScope.launch {
            _queryDistrito
                .filter { it.length >= 3 }
                .debounce(400)
                .distinctUntilChanged()
                .collectLatest { query ->
                    _distritosSugeridos.value = buscarDistritos(query)
                }
        }
    }

    fun onQueryDistritoChange(nuevo: String) {
        _queryDistrito.value = nuevo
        if (nuevo.isEmpty()) _distritosSugeridos.value = emptyList()
    }

    fun registrarDireccion(idDistrito: Int, nombreDireccion: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            val result = guardarDireccion(idDistrito, nombreDireccion)
            result.fold(
                onSuccess = {
                    // Actualizamos localmente el flag para que el Dialog desaparezca
                    val userActual = sessionManager.currentUser.value
                    if (userActual != null) {
                        sessionManager.setUser(userActual.copy(tieneDireccion = true))
                    }
                    _exitoRegistro.value = true
                },
                onFailure = {
                    _error.value = it.message ?: "Error al registrar la dirección"
                }
            )
            _isLoading.value = false
        }
    }
}
