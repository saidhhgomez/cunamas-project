package com.example.cunamas.feature.cocina.presentation.CocinaCalculadora

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cunamas.core.common.TipoPreparacion
import com.example.cunamas.core.session.SessionManager
import com.example.cunamas.feature.gestion.usecase.calculadora.GetPreparacionesUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class CocinaCalculadoraPreparacionesViewModel(
    private val idCategoria: Int,
    private val getPreparacionesPorCategoria: GetPreparacionesUseCase,
    val sessionManager: SessionManager
) : ViewModel() {

    private val _preparaciones = MutableStateFlow<List<TipoPreparacion>>(emptyList())
    val preparaciones: StateFlow<List<TipoPreparacion>> = _preparaciones.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    init {
        cargarPreparaciones()
    }

    fun cargarPreparaciones() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                _preparaciones.value = getPreparacionesPorCategoria(idCategoria)
            } catch (e: Exception) {
                _preparaciones.value = emptyList()
            } finally {
                _isLoading.value = false
            }
        }
    }
}
