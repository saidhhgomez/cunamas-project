package com.example.cunamas.feature.cocina.presentation.consultarAsistencia.historialAsistencia
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cunamas.core.session.SessionManager
import com.example.cunamas.core.util.obtenerFechaActualPlataforma
import com.example.cunamas.feature.gestion.domain.model.Asistencia
import com.example.cunamas.feature.gestion.usecase.historialAsistencia.GetAsistenciaUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class CocinaAsistenciaViewModel(
    private val getAsistencia: GetAsistenciaUseCase,
    val sessionManager: SessionManager,
    private val idModulo: Int
) : ViewModel() {

    private fun obtenerFechaActual(): String {
        return obtenerFechaActualPlataforma()
    }

    private val _fecha = MutableStateFlow(obtenerFechaActual())
    val fecha: StateFlow<String> = _fecha

    private val _correlativo = MutableStateFlow<Int?>(null)
    val correlativo: StateFlow<Int?> = _correlativo

    private val _asistencia = MutableStateFlow<Asistencia?>(null)
    val asistencia: StateFlow<Asistencia?> = _asistencia

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    init {
        cargar()
    }

    fun onFechaChange(nuevaFecha: String) {
        _fecha.value = nuevaFecha
        cargar()
    }

    fun onCorrelativoChange(nuevo: Int?) {
        _correlativo.value = if (_correlativo.value == nuevo) null else nuevo
        cargar()
    }

    private fun cargar() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                _asistencia.value = getAsistencia(idModulo, _fecha.value, _correlativo.value)
            } catch (e: Exception) {
                // TODO: manejar error
            } finally {
                _isLoading.value = false
            }
        }
    }
}