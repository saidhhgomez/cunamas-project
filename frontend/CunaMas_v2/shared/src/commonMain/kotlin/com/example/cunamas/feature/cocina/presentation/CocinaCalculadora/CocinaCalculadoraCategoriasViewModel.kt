package com.example.cunamas.feature.cocina.presentation.CocinaCalculadora

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cunamas.core.common.CategoriaAlimento
import com.example.cunamas.core.session.SessionManager
import com.example.cunamas.feature.gestion.usecase.calculadora.GetCategoriasAlimentoUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class CocinaCalculadoraCategoriasViewModel(
    private val getCategoriasAlimento: GetCategoriasAlimentoUseCase,
    val sessionManager: SessionManager
) : ViewModel() {

    private val _categorias = MutableStateFlow<List<CategoriaAlimento>>(emptyList())
    val categorias: StateFlow<List<CategoriaAlimento>> = _categorias.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    init {
        cargarCategorias()
    }

    fun cargarCategorias() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                _categorias.value = getCategoriasAlimento()
            } catch (e: Exception) {
                _categorias.value = emptyList()
            } finally {
                _isLoading.value = false
            }
        }
    }
}
