package com.example.cunamas.feature.gestion.presentation.modulo.crearModulo

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cunamas.feature.gestion.usecase.modulo.CrearModuloUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class CrearModuloViewModel(
    private val crearModuloUseCase: CrearModuloUseCase
) : ViewModel() {

    private val _nombreModulo = MutableStateFlow("")
    val nombreModulo: StateFlow<String> = _nombreModulo.asStateFlow()

    private val _isGuardando = MutableStateFlow(false)
    val isGuardando: StateFlow<Boolean> = _isGuardando.asStateFlow()

    private val _errorGuardado = MutableStateFlow<String?>(null)
    val errorGuardado: StateFlow<String?> = _errorGuardado.asStateFlow()

    fun onNombreModuloChange(nuevo: String) {
        _nombreModulo.value = nuevo
    }

    fun formularioValido(): Boolean {
        return _nombreModulo.value.isNotBlank()
    }

    fun guardar(idLocal: Int, onExito: (String) -> Unit) {
        if (!formularioValido()) return

        viewModelScope.launch {
            _isGuardando.value = true
            _errorGuardado.value = null
            try {
                val resultado = crearModuloUseCase(
                    idLocal = idLocal,
                    nombreModulo = _nombreModulo.value.trim()
                )
                onExito(resultado.mensaje)
            } catch (e: Exception) {
                _errorGuardado.value = "No se pudo crear el módulo. Intenta de nuevo."
            } finally {
                _isGuardando.value = false
            }
        }
    }
}