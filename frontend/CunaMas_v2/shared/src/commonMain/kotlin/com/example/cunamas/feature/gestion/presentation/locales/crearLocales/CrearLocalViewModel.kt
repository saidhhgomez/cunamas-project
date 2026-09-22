package com.example.cunamas.feature.gestion.presentation.locales.crearLocales

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cunamas.feature.gestion.domain.model.Distrito
import com.example.cunamas.feature.gestion.usecase.distrito.BuscarDistritosUseCase
import com.example.cunamas.feature.gestion.usecase.locales.CrearLocalUseCase
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

@OptIn(FlowPreview::class)
class CrearLocalViewModel(
    private val buscarDistritosUseCase: BuscarDistritosUseCase,
    private val crearLocalUseCase: CrearLocalUseCase
) : ViewModel() {

    // 🔍 Búsqueda de distrito
    private val _queryDistrito = MutableStateFlow("")
    val queryDistrito: StateFlow<String> = _queryDistrito.asStateFlow()

    private val _resultadosDistrito = MutableStateFlow<List<Distrito>>(emptyList())
    val resultadosDistrito: StateFlow<List<Distrito>> = _resultadosDistrito.asStateFlow()

    private val _isBuscandoDistrito = MutableStateFlow(false)
    val isBuscandoDistrito: StateFlow<Boolean> = _isBuscandoDistrito.asStateFlow()

    private val _distritoSeleccionado = MutableStateFlow<Distrito?>(null)
    val distritoSeleccionado: StateFlow<Distrito?> = _distritoSeleccionado.asStateFlow()

    // 📝 Campos del formulario
    private val _nombreDireccion = MutableStateFlow("")
    val nombreDireccion: StateFlow<String> = _nombreDireccion.asStateFlow()

    private val _localNombre = MutableStateFlow("")
    val localNombre: StateFlow<String> = _localNombre.asStateFlow()

    // 💾 Estado de guardado
    private val _isGuardando = MutableStateFlow(false)
    val isGuardando: StateFlow<Boolean> = _isGuardando.asStateFlow()

    private val _errorGuardado = MutableStateFlow<String?>(null)
    val errorGuardado: StateFlow<String?> = _errorGuardado.asStateFlow()

    init {
        viewModelScope.launch {
            _queryDistrito
                .debounce(400)
                .distinctUntilChanged()
                .drop(1)
                .collectLatest { texto ->
                    if (_distritoSeleccionado.value?.distrito == texto) return@collectLatest
                    if (texto.length < 3) {
                        _resultadosDistrito.value = emptyList()
                        return@collectLatest
                    }
                    _isBuscandoDistrito.value = true
                    try {
                        _resultadosDistrito.value = buscarDistritosUseCase(texto)
                    } catch (e: Exception) {
                        _resultadosDistrito.value = emptyList()
                    } finally {
                        _isBuscandoDistrito.value = false
                    }
                }
        }
    }

    fun onQueryDistritoChange(nuevo: String) {
        _queryDistrito.value = nuevo
        _distritoSeleccionado.value = null
    }

    fun onDistritoSeleccionado(distrito: Distrito) {
        _distritoSeleccionado.value = distrito
        _queryDistrito.value = "${distrito.departamento} / ${distrito.provincia} / ${distrito.distrito}"
        _resultadosDistrito.value = emptyList()
    }

    fun onNombreDireccionChange(nuevo: String) { _nombreDireccion.value = nuevo }
    fun onLocalNombreChange(nuevo: String) { _localNombre.value = nuevo }

    fun formularioValido(): Boolean {
        return _distritoSeleccionado.value != null &&
                _nombreDireccion.value.isNotBlank() &&
                _localNombre.value.isNotBlank()
    }

    fun guardar(idCentroAlimentario: Int, onExito: (String) -> Unit) {
        val distrito = _distritoSeleccionado.value ?: return
        if (!formularioValido()) return

        viewModelScope.launch {
            _isGuardando.value = true
            _errorGuardado.value = null
            try {
                // Se invoca el UseCase pasándole todos los datos requeridos
                val resultado = crearLocalUseCase(
                    idDistrito = distrito.id,
                    nombreDireccion = _nombreDireccion.value.trim(),
                    idCentroAlimentario = idCentroAlimentario,
                    localNombre = _localNombre.value.trim()
                )
                onExito(resultado.mensaje)
            } catch (e: Exception) {
                _errorGuardado.value = "No se pudo guardar el local. Intenta de nuevo."
            } finally {
                _isGuardando.value = false
            }
        }
    }
}