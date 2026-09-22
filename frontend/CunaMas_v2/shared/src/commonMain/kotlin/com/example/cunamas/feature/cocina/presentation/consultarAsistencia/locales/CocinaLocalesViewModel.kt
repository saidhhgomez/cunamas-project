package com.example.cunamas.feature.cocina.presentation.consultarAsistencia.locales

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cunamas.core.common.Local
import com.example.cunamas.core.session.SessionManager
import com.example.cunamas.feature.gestion.usecase.locales.GetLocalesUseCase // Puedes usar el mismo caso de uso si es compartido o uno propio de cocina
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class CocinaLocalesViewModel(
    private val getLocales: GetLocalesUseCase,
    val sessionManager: SessionManager,
    private val idCentroAlimentario: Int // 👈 Recibido por parámetro para Koin
) : ViewModel() {

    private val _items = MutableStateFlow<List<Local>>(emptyList())
    val items: StateFlow<List<Local>> = _items

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    private var page = 0
    private var esUltimaPagina = false

    init {
        cargarMas()
    }

    fun cargarMas() {
        if (_isLoading.value || esUltimaPagina) return
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val pagina = getLocales(idCentroAlimentario, page, 20)
                esUltimaPagina = pagina.esUltimaPagina
                _items.value = _items.value + pagina.items
                page++
            } catch (e: Exception) {
                // TODO: manejar error de red o backend
            } finally {
                _isLoading.value = false
            }
        }
    }
}