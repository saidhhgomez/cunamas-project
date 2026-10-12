package com.example.cunamas.feature.cocina.presentation.CocinaCalculadora

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cunamas.core.common.CentroAlimentario
import com.example.cunamas.core.session.SessionManager
import com.example.cunamas.feature.cocina.domain.model.AlimentoIA
import com.example.cunamas.feature.cocina.domain.model.CategoriaEtariaIA
import com.example.cunamas.feature.cocina.domain.model.PresentacionIA
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

class CocinaCalculadoraViewModel(
    private val getRangos: GetRangosUseCase,
    private val getCentros: GetCentrosAlimentariosUseCase,
    private val getResumenServicio: GetResumenServicioUseCase,
    private val calcularUseCase: CalcularUseCase,
    val sessionManager: SessionManager,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val _nombreServicio = MutableStateFlow("")
    val nombreServicio: StateFlow<String> = _nombreServicio

    val idCategoria: Int = savedStateHandle.get<Int>("idCategoria") ?: 0
    val idPreparacion: Int = savedStateHandle.get<Int>("idPreparacion") ?: 0

    private val _rangos = MutableStateFlow<List<RangoPreparacion>>(emptyList())
    val rangos: StateFlow<List<RangoPreparacion>> = _rangos

    private val _fecha = MutableStateFlow("") 
    val fecha: StateFlow<String> = _fecha

    private val _calculoVigente = MutableStateFlow(false)
    val calculoVigente: StateFlow<Boolean> = _calculoVigente

    private val _serviciosDisponibles = MutableStateFlow<List<CentroAlimentario>>(emptyList())
    val serviciosDisponibles: StateFlow<List<CentroAlimentario>> = _serviciosDisponibles

    private val _servicioSeleccionado = MutableStateFlow<CentroAlimentario?>(null)
    val servicioSeleccionado: StateFlow<CentroAlimentario?> = _servicioSeleccionado

    private val _correlativo = MutableStateFlow<Int?>(null)
    val correlativo: StateFlow<Int?> = _correlativo

    private val _totales = MutableStateFlow<List<TotalCategoria>>(emptyList())
    val totales: StateFlow<List<TotalCategoria>> = _totales

    private val _isLoadingResumen = MutableStateFlow(false)
    val isLoadingResumen: StateFlow<Boolean> = _isLoadingResumen

    private val _resultado = MutableStateFlow<ResultadoCalculo?>(null)
    val resultado: StateFlow<ResultadoCalculo?> = _resultado

    private val _isCalculando = MutableStateFlow(false)
    val isCalculando: StateFlow<Boolean> = _isCalculando

    // 🧠 Historial para IA (Se borra al salir de la pantalla por el lifecycle del ViewModel)
    private val _historialIA = MutableStateFlow<List<AlimentoIA>>(emptyList())
    val historialIA: StateFlow<List<AlimentoIA>> = _historialIA

    init {
        cargarRangos()
        cargarServiciosDisponibles()
    }

    private fun cargarRangos() {
        viewModelScope.launch {
            try {
                _rangos.value = getRangos(idPreparacion)
            } catch (e: Exception) { }
        }
    }

    private fun cargarServiciosDisponibles() {
        viewModelScope.launch {
            try {
                val pagina = getCentros("", 0, 50)
                _serviciosDisponibles.value = pagina.items
            } catch (e: Exception) { }
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
                val res = calcularUseCase(idPreparacion, categorias)
                _resultado.value = res
                _calculoVigente.value = true

                // 💾 Guardamos en el historial para la futura petición IA
                val nuevoAlimento = AlimentoIA(
                    nombre = res.alimento,
                    categoriaEtaria = mapToCategoriaEtaria(_totales.value),
                    presentacion = mapToPresentacionIA(res.empaquesSugeridos)
                )
                _historialIA.value = _historialIA.value + nuevoAlimento

            } catch (e: Exception) {
            } finally {
                _isCalculando.value = false
            }
        }
    }

    private fun mapToCategoriaEtaria(totales: List<TotalCategoria>): CategoriaEtariaIA {
        return CategoriaEtariaIA(
            ninos6a9Meses = totales.find { it.categoria.contains("6-8") || it.categoria.contains("6 a 9") }?.cantidad ?: 0,
            ninos10a12Meses = totales.find { it.categoria.contains("9-11") || it.categoria.contains("10 a 12") }?.cantidad ?: 0,
            ninos13a23Meses = totales.find { it.categoria.contains("12-23") || it.categoria.contains("12 - 23") }?.cantidad ?: 0,
            ninos24a36Meses = totales.find { it.categoria.contains("24-36") || it.categoria.contains("24 - 36") }?.cantidad ?: 0,
            actoresComunales = totales.find { it.categoria.contains("Actor Comunal", ignoreCase = true) }?.cantidad ?: 0
        )
    }

    private fun mapToPresentacionIA(empaques: Map<String, Int>): PresentacionIA {
        return PresentacionIA(
            bolsas1kg = empaques.entries.find { it.key.contains("1 kg") }?.value ?: 0,
            bolsas500g = empaques.entries.find { it.key.contains("500 g") }?.value ?: 0,
            bolsas250g = empaques.entries.find { it.key.contains("250 g") }?.value ?: 0
        )
    }
}
