package com.example.cunamas.feature.madre.presentation.asistencia

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cunamas.core.session.SessionManager
import com.example.cunamas.feature.madre.domain.model.AsistenciaMadreRequest
import com.example.cunamas.feature.madre.domain.model.CategoriaAsistenciaMadre
import com.example.cunamas.feature.madre.domain.usecase.RegistrarAsistenciaMadreUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class CategoriaUI(
    val id: Int,
    val nombre: String,
    val cantidad: String = ""
)

class MadreAsistenciaViewModel(
    private val idModulo: Int,
    private val registrarAsistenciaUseCase: RegistrarAsistenciaMadreUseCase,
    val sessionManager: SessionManager
) : ViewModel() {

    private val _correlativo = MutableStateFlow<Int?>(null)
    val correlativo: StateFlow<Int?> = _correlativo.asStateFlow()

    private val _categorias = MutableStateFlow(
        listOf(
            CategoriaUI(1, "6-8 m"),
            CategoriaUI(2, "9-11 m"),
            CategoriaUI(3, "12 - 23 m"),
            CategoriaUI(4, "24 - 36 m"),
            CategoriaUI(5, "Actor Comunal")
        )
    )
    val categorias: StateFlow<List<CategoriaUI>> = _categorias.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private val _exito = MutableStateFlow<String?>(null)
    val exito: StateFlow<String?> = _exito.asStateFlow()

    fun onCorrelativoChange(nuevo: Int) {
        _correlativo.value = nuevo
    }

    fun onCantidadChange(id: Int, nuevaCantidad: String) {
        _categorias.value = _categorias.value.map {
            if (it.id == id) {
                val filtrado = nuevaCantidad.filter { char -> char.isDigit() }.take(3)
                it.copy(cantidad = filtrado)
            } else it
        }
    }

    fun registrar() {
        val corr = _correlativo.value ?: return
        val idUsuario = sessionManager.currentUser.value?.idPersona ?: 0
        
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            
            val request = AsistenciaMadreRequest(
                idModulo = idModulo,
                idUsuarioCreacion = idUsuario,
                registroCorrelativo = corr,
                categorias = _categorias.value.map { 
                    CategoriaAsistenciaMadre(it.id, it.cantidad.toIntOrNull() ?: 0)
                }
            )
            
            val result = registrarAsistenciaUseCase(request)
            result.fold(
                onSuccess = { 
                    _exito.value = it.mensaje 
                },
                onFailure = { 
                    _error.value = "No se pudo registrar la asistencia. Intente nuevamente."
                }
            )
            _isLoading.value = false
        }
    }
}
