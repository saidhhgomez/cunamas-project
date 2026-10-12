package com.example.cunamas.feature.gestion.presentation.centroAlimentario.crearCentroAlimentario

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cunamas.feature.gestion.domain.model.Distrito
import com.example.cunamas.feature.gestion.usecase.centroAlimentario.CrearCentroAlimentarioUseCase
import com.example.cunamas.feature.gestion.usecase.distrito.BuscarDistritosUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.drop
import kotlinx.coroutines.launch

class CrearCentroAlimentarioViewModel(
    private val buscarDistritos: BuscarDistritosUseCase,
    private val crearCentroAlimentario: CrearCentroAlimentarioUseCase
) : ViewModel() {

    // 🔍 Búsqueda de distrito
    private val _queryDistrito = MutableStateFlow("")
    val queryDistrito: StateFlow<String> = _queryDistrito

    private val _resultadosDistrito = MutableStateFlow<List<Distrito>>(emptyList())
    val resultadosDistrito: StateFlow<List<Distrito>> = _resultadosDistrito

    private val _isBuscandoDistrito = MutableStateFlow(false)
    val isBuscandoDistrito: StateFlow<Boolean> = _isBuscandoDistrito

    private val _distritoSeleccionado = MutableStateFlow<Distrito?>(null)
    val distritoSeleccionado: StateFlow<Distrito?> = _distritoSeleccionado

    // 📝 Campos del formulario
    private val _nombreDireccion = MutableStateFlow("")
    val nombreDireccion: StateFlow<String> = _nombreDireccion

    private val _nombreCentro = MutableStateFlow("")
    val nombreCentro: StateFlow<String> = _nombreCentro

    private val _nombreComite = MutableStateFlow("")
    val nombreComite: StateFlow<String> = _nombreComite

    // 💾 Estado de guardado
    private val _isGuardando = MutableStateFlow(false)
    val isGuardando: StateFlow<Boolean> = _isGuardando

    private val _errorGuardado = MutableStateFlow<String?>(null)
    val errorGuardado: StateFlow<String?> = _errorGuardado

    init {
        viewModelScope.launch {
            _queryDistrito
                .debounce(400)
                .distinctUntilChanged()
                .drop(1)
                .collectLatest { texto ->
                    // 👇 Si el texto coincide con el distrito ya seleccionado, no busques de nuevo
                    if (_distritoSeleccionado.value?.distrito == texto) {
                        return@collectLatest
                    }

                    if (texto.length < 3) {
                        _resultadosDistrito.value = emptyList()
                        return@collectLatest
                    }
                    _isBuscandoDistrito.value = true
                    try {
                        _resultadosDistrito.value = buscarDistritos(texto)
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
        _distritoSeleccionado.value = null // si edita el texto, invalida la selección previa
    }

    fun onDistritoSeleccionado(distrito: Distrito) {
        _distritoSeleccionado.value = distrito
        _queryDistrito.value = distrito.distrito
        _resultadosDistrito.value = emptyList() // cierra la lista de sugerencias
    }

    fun onNombreDireccionChange(nuevo: String) { _nombreDireccion.value = nuevo }
    fun onNombreCentroChange(nuevo: String) { _nombreCentro.value = nuevo }
    fun onNombreComiteChange(nuevo: String) { _nombreComite.value = nuevo }

    fun formularioValido(): Boolean {
        return _distritoSeleccionado.value != null &&
                _nombreDireccion.value.isNotBlank() &&
                _nombreCentro.value.isNotBlank() &&
                _nombreComite.value.isNotBlank()
    }

    fun guardar(onExito: (String) -> Unit) {
        val distrito = _distritoSeleccionado.value ?: return
        if (!formularioValido()) return

        viewModelScope.launch {
            _isGuardando.value = true
            _errorGuardado.value = null
            try {
                val resultado = crearCentroAlimentario(
                    idDistrito = distrito.id,
                    nombreDireccion = _nombreDireccion.value,
                    nombreCentro = _nombreCentro.value,
                    nombreComite = _nombreComite.value
                )
                onExito(resultado.mensaje)
            } catch (e: Exception) {
                _errorGuardado.value = "No se pudo guardar. Intenta de nuevo."
            } finally {
                _isGuardando.value = false
            }
        }
    }
}