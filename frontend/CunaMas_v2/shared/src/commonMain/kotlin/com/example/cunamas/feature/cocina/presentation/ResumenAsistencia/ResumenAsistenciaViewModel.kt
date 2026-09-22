package com.example.cunamas.feature.cocina.presentation.ResumenAsistencia
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cunamas.core.common.CentroAlimentario
import com.example.cunamas.core.session.SessionManager
import com.example.cunamas.core.util.obtenerFechaActualPlataforma
import com.example.cunamas.feature.cocina.domain.model.ResumenCocinaAsistencia
import com.example.cunamas.feature.cocina.domain.usecase.GetResumenCocinaAsistenciaUseCase
import com.example.cunamas.feature.gestion.usecase.centroAlimentario.GetCentrosAlimentariosUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.drop
import kotlinx.coroutines.launch

class ResumenAsistenciaViewModel(
    private val getResumenCocinaAsistencia: GetResumenCocinaAsistenciaUseCase,
    private val getCentros: GetCentrosAlimentariosUseCase,
    val sessionManager: SessionManager
) : ViewModel() {

    private fun obtenerFechaActual(): String {
        return obtenerFechaActualPlataforma()
    }

    private val _fecha = MutableStateFlow(obtenerFechaActual())
    val fecha: StateFlow<String> = _fecha

    private val _correlativo = MutableStateFlow<Int>(1)
    val correlativo: StateFlow<Int> = _correlativo

    private val _centroAlimentarioSeleccionado = MutableStateFlow<CentroAlimentario?>(null)
    val centroAlimentarioSeleccionado: StateFlow<CentroAlimentario?> = _centroAlimentarioSeleccionado

    private val _queryCentro = MutableStateFlow("")
    val queryCentro: StateFlow<String> = _queryCentro

    private val _listaCentros = MutableStateFlow<List<CentroAlimentario>>(emptyList())
    val listaCentros: StateFlow<List<CentroAlimentario>> = _listaCentros

    private val _asistencia = MutableStateFlow<ResumenCocinaAsistencia?>(null)
    val asistencia: StateFlow<ResumenCocinaAsistencia?> = _asistencia

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading

    private var page = 0
    private var esUltimaPagina = false
    private var primeraCarga = true

    init {
        cargarMasCentros("")
        cargarAsistencia()

        viewModelScope.launch {
            _queryCentro
                .drop(1)
                .debounce { texto -> if (texto.isEmpty()) 0L else 400L }
                .distinctUntilChanged()
                .collectLatest { texto -> resetYBuscarCentros(texto) }
        }
    }

    fun onFechaChange(nuevaFecha: String) {
        _fecha.value = nuevaFecha
        cargarAsistencia()
    }

    fun onCorrelativoChange(nuevo: Int) {
        _correlativo.value = nuevo
        cargarAsistencia()
    }

    fun onCentroAlimentarioChange(centro: CentroAlimentario?) {
        _centroAlimentarioSeleccionado.value = if (_centroAlimentarioSeleccionado.value == centro) null else centro
        cargarAsistencia()
    }

    fun onQueryCentroChange(nuevo: String) {
        _queryCentro.value = nuevo
    }

    private fun resetYBuscarCentros(filtro: String) {
        page = 0
        esUltimaPagina = false
        _listaCentros.value = emptyList()
        primeraCarga = true
        cargarMasCentros(filtro)
    }

    fun cargarMasCentros(filtro: String = _queryCentro.value) {
        if (_isLoading.value || esUltimaPagina) return
        viewModelScope.launch {
            try {
                val size = 100
                primeraCarga = false

                val pagina = getCentros(filtro, page, size)
                esUltimaPagina = pagina.esUltimaPagina
                _listaCentros.value = _listaCentros.value + pagina.items
                page++
            } catch (e: Exception) {
                // TODO: manejar error
            }
        }
    }

    private fun cargarAsistencia() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val idServicioAlimentario = _centroAlimentarioSeleccionado.value?.id ?: 0
                _asistencia.value = getResumenCocinaAsistencia(
                    idServicioAlimentario = idServicioAlimentario,
                    fecha = _fecha.value,
                    correlativo = _correlativo.value
                )
            } catch (e: Exception) {
                _asistencia.value = null
            } finally {
                _isLoading.value = false
            }
        }
    }
}