package com.example.cunamas.feature.cocina.presentation.consultarAsistencia.centroAlimentario

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cunamas.core.common.CentroAlimentario
import com.example.cunamas.core.session.SessionManager
import com.example.cunamas.feature.gestion.usecase.centroAlimentario.GetCentrosAlimentariosUseCase // Puedes usar el mismo caso de uso si es compartido o uno propio de cocina si lo requiere
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.drop
import kotlinx.coroutines.launch

class CocinaCentroAlimentarioViewModel(
    private val getCentros: GetCentrosAlimentariosUseCase,
    val sessionManager: SessionManager // 👈 Incluido para que la pantalla pueda obtener los datos de la sesión fácilmente
) : ViewModel() {

    private val _query = MutableStateFlow("")
    val query: StateFlow<String> = _query

    private val _items = MutableStateFlow<List<CentroAlimentario>>(emptyList())
    val items: StateFlow<List<CentroAlimentario>> = _items

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    private var page = 0
    private var esUltimaPagina = false
    private var primeraCarga = true

    init {
        cargarMas()

        viewModelScope.launch {
            _query
                .drop(1) // ignora la emisión inicial vacía
                .debounce { texto -> if (texto.isEmpty()) 0L else 400L } // sin delay si está vacío
                .distinctUntilChanged()
                .collectLatest { texto -> resetYBuscar(texto) }
        }
    }

    fun onQueryChange(nuevo: String) {
        _query.value = nuevo
    }

    fun resetYBuscar(distrito: String) {
        page = 0
        esUltimaPagina = false
        _items.value = emptyList()
        cargarMas(distrito)
    }

    fun cargarMas(distrito: String = _query.value) {
        if (_isLoading.value || esUltimaPagina) return
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val size = if (primeraCarga) 10 else 20
                primeraCarga = false

                val pagina = getCentros(distrito, page, size)
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