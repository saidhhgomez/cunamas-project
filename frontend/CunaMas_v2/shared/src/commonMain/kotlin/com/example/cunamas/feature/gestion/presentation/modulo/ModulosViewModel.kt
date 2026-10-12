package com.example.cunamas.feature.gestion.presentation.modulo

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cunamas.core.common.Modulo
import com.example.cunamas.core.session.SessionManager
import com.example.cunamas.feature.gestion.usecase.modulo.GetModulosUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ModulosViewModel(
    private val getModulos: GetModulosUseCase,
    val sessionManager: SessionManager,
    private val idLocal: Int // 👈 Recibido directamente como parámetro en KMP
) : ViewModel() {

    private val _items = MutableStateFlow<List<Modulo>>(emptyList())
    val items: StateFlow<List<Modulo>> = _items

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
                val pagina = getModulos(idLocal, page, 20)
                esUltimaPagina = pagina.esUltimaPagina
                _items.value = _items.value + pagina.items
                page++
            } catch (e: Exception) {
                // TODO: manejar error
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun recargar() {
        page = 0
        esUltimaPagina = false
        _items.value = emptyList()
        cargarMas()
    }
}