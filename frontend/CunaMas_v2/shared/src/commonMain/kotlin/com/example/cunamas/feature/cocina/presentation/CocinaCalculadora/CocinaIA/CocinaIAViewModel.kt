package com.example.cunamas.feature.cocina.presentation.CocinaCalculadora.CocinaIA

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cunamas.core.session.SessionManager
import com.example.cunamas.feature.cocina.domain.model.RespuestaIA
import com.example.cunamas.feature.cocina.domain.model.ResumenIA
import com.example.cunamas.feature.cocina.domain.usecase.AnalizarAlimentosIAUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json

class CocinaIAViewModel(
    private val analizarAlimentosIA: AnalizarAlimentosIAUseCase,
    val sessionManager: SessionManager,
    private val jsonResumen: String
) : ViewModel() {

    private val _respuesta = MutableStateFlow<RespuestaIA?>(null)
    val respuesta: StateFlow<RespuestaIA?> = _respuesta

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error

    init {
        ejecutarAnalisis()
    }

    fun ejecutarAnalisis() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            try {
                val resumen = Json.decodeFromString<ResumenIA>(jsonResumen)
                val result = analizarAlimentosIA(resumen)
                result.fold(
                    onSuccess = { _respuesta.value = it },
                    onFailure = { _error.value = it.message ?: "Error al conectar con la IA" }
                )
            } catch (e: Exception) {
                _error.value = "Error al procesar los datos: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }
}
