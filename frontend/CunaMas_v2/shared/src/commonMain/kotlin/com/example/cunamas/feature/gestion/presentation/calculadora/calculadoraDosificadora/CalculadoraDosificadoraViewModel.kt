package com.example.cunamas.feature.gestion.presentation.calculadora.calculadoraDosificadora

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cunamas.core.common.CentroAlimentario
import com.example.cunamas.feature.gestion.domain.model.RangoPreparacion
import com.example.cunamas.feature.gestion.domain.model.ResultadoCalculo
import com.example.cunamas.feature.gestion.domain.model.TotalCategoria
import com.example.cunamas.feature.gestion.usecase.calculadora.calculadoraDosificadora.CalcularUseCase
import com.example.cunamas.feature.gestion.usecase.calculadora.calculadoraDosificadora.GetRangosUseCase
import com.example.cunamas.feature.gestion.usecase.calculadora.calculadoraDosificadora.GetResumenServicioUseCase
import com.example.cunamas.feature.gestion.usecase.centroAlimentario.GetCentrosAlimentariosUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class CalculadoraDosificadoraViewModel(
    private val getRangos: GetRangosUseCase,
    private val getCentros: GetCentrosAlimentariosUseCase,
    private val getResumenServicio: GetResumenServicioUseCase,
    private val calcularUseCase: CalcularUseCase,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val _nombreServicio = MutableStateFlow("")
    val nombreServicio: StateFlow<String> = _nombreServicio

    val idCategoria: Int = savedStateHandle.get<Int>("idCategoria") ?: 0
    val idPreparacion: Int = savedStateHandle.get<Int>("idPreparacion") ?: 0

    // 📌 Rangos fijos
    private val _rangos = MutableStateFlow<List<RangoPreparacion>>(emptyList())
    val rangos: StateFlow<List<RangoPreparacion>> = _rangos

    // 🔍 Filtros (Usamos una cadena simple para evitar java.time en KMP)
    private val _fecha = MutableStateFlow("") // Puedes inicializarla con tu formato deseado
    val fecha: StateFlow<String> = _fecha

    private val _calculoVigente = MutableStateFlow(false)
    val calculoVigente: StateFlow<Boolean> = _calculoVigente

    private val _serviciosDisponibles = MutableStateFlow<List<CentroAlimentario>>(emptyList())
    val serviciosDisponibles: StateFlow<List<CentroAlimentario>> = _serviciosDisponibles

    private val _servicioSeleccionado = MutableStateFlow<CentroAlimentario?>(null)
    val servicioSeleccionado: StateFlow<CentroAlimentario?> = _servicioSeleccionado

    private val _correlativo = MutableStateFlow<Int?>(null)
    val correlativo: StateFlow<Int?> = _correlativo

    // 📊 Totales
    private val _totales = MutableStateFlow<List<TotalCategoria>>(emptyList())
    val totales: StateFlow<List<TotalCategoria>> = _totales

    private val _isLoadingResumen = MutableStateFlow(false)
    val isLoadingResumen: StateFlow<Boolean> = _isLoadingResumen

    // ✅ Resultado
    private val _resultado = MutableStateFlow<ResultadoCalculo?>(null)
    val resultado: StateFlow<ResultadoCalculo?> = _resultado

    private val _isCalculando = MutableStateFlow(false)
    val isCalculando: StateFlow<Boolean> = _isCalculando

    init {
        cargarRangos()
        cargarServiciosDisponibles()
    }

    private fun cargarRangos() {
        viewModelScope.launch {
            try {
                // ✔️ Correcto: se llama al Caso de Uso pasando la variable directamente
                _rangos.value = getRangos(idPreparacion)
            } catch (e: Exception) {
                // ...
            }
        }
    }

    private fun cargarServiciosDisponibles() {
        viewModelScope.launch {
            try {
                val pagina = getCentros("", 0, 50)
                _serviciosDisponibles.value = pagina.items
            } catch (e: Exception) {
                // TODO: manejar error
            }
        }
    }

    fun onFechaChange(nuevaFecha: String) {
        _fecha.value = nuevaFecha
        _calculoVigente.value = false
        intentarCargarResumen()
    }

    fun onServicioSeleccionado(servicio: CentroAlimentario) {
        _servicioSeleccionado.value = servicio
        _calculoVigente.value = false
        intentarCargarResumen()
    }

    fun onCorrelativoChange(nuevo: Int) {
        _correlativo.value = if (_correlativo.value == nuevo) null else nuevo
        _calculoVigente.value = false
        intentarCargarResumen()
    }

    fun onCantidadEditada(idCategoriaGrupo: Int, nuevaCantidad: Int) {
        _totales.value = _totales.value.map {
            if (it.id == idCategoriaGrupo) it.copy(cantidad = nuevaCantidad) else it
        }
        _calculoVigente.value = false
    }

    private fun intentarCargarResumen() {
        val servicio = _servicioSeleccionado.value
        val corr = _correlativo.value
        if (servicio == null || corr == null) return

        viewModelScope.launch {
            _isLoadingResumen.value = true
            _resultado.value = null
            try {
                val resumen = getResumenServicio(servicio.id, _fecha.value, corr)
                _nombreServicio.value = resumen.servicioAlimentario

                _totales.value = if (resumen.totales.isEmpty()) {
                    _rangos.value.map { rango ->
                        TotalCategoria(id = rango.idCatNino, categoria = rango.rangoEdad, cantidad = 0)
                    }
                } else {
                    resumen.totales
                }
            } catch (e: Exception) {
                // TODO: manejar error
            } finally {
                _isLoadingResumen.value = false
            }
        }
    }

    fun calcular() {
        if (_calculoVigente.value) return

        viewModelScope.launch {
            _isCalculando.value = true
            try {
                val categorias = _totales.value.map { it.id to it.cantidad }
                _resultado.value = calcularUseCase(idPreparacion, categorias)
                _calculoVigente.value = true
            } catch (e: Exception) {
                // TODO: manejar error
            } finally {
                _isCalculando.value = false
            }
        }
    }
}