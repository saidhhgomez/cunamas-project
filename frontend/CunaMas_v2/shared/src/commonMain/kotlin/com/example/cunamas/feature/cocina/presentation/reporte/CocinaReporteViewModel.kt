package com.example.cunamas.feature.cocina.presentation.reporte

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cunamas.core.common.CentroAlimentario
import com.example.cunamas.core.session.SessionManager
import com.example.cunamas.core.util.PlatformFileHandler
import com.example.cunamas.core.util.obtenerFechaActualPlataforma
import com.example.cunamas.feature.cocina.domain.usecase.GetReportePdfUseCase
import com.example.cunamas.feature.gestion.usecase.centroAlimentario.GetCentrosAlimentariosUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.drop
import kotlinx.coroutines.launch

class CocinaReporteViewModel(
    private val getReportePdf: GetReportePdfUseCase,
    private val getCentros: GetCentrosAlimentariosUseCase,
    val sessionManager: SessionManager
) : ViewModel() {

    private val _fecha = MutableStateFlow(obtenerFechaActualPlataforma())
    val fecha: StateFlow<String> = _fecha.asStateFlow()

    private val _correlativo = MutableStateFlow(1)
    val correlativo: StateFlow<Int> = _correlativo.asStateFlow()

    private val _centroAlimentarioSeleccionado = MutableStateFlow<CentroAlimentario?>(null)
    val centroAlimentarioSeleccionado: StateFlow<CentroAlimentario?> = _centroAlimentarioSeleccionado.asStateFlow()

    private val _queryCentro = MutableStateFlow("")
    val queryCentro: StateFlow<String> = _queryCentro.asStateFlow()

    private val _listaCentros = MutableStateFlow<List<CentroAlimentario>>(emptyList())
    val listaCentros: StateFlow<List<CentroAlimentario>> = _listaCentros.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _isDownloading = MutableStateFlow(false)
    val isDownloading: StateFlow<Boolean> = _isDownloading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    private var page = 0
    private var esUltimaPagina = false

    init {
        cargarMasCentros("")

        viewModelScope.launch {
            _queryCentro
                .drop(1)
                .debounce(400)
                .distinctUntilChanged()
                .collectLatest { texto -> resetYBuscarCentros(texto) }
        }
    }

    fun onFechaChange(nuevaFecha: String) {
        _fecha.value = nuevaFecha
    }

    fun onCorrelativoChange(nuevo: Int) {
        _correlativo.value = nuevo
    }

    fun onCentroAlimentarioChange(centro: CentroAlimentario?) {
        _centroAlimentarioSeleccionado.value = centro
    }

    fun onQueryCentroChange(nuevo: String) {
        _queryCentro.value = nuevo
    }

    private fun resetYBuscarCentros(filtro: String) {
        page = 0
        esUltimaPagina = false
        _listaCentros.value = emptyList()
        cargarMasCentros(filtro)
    }

    fun cargarMasCentros(filtro: String = _queryCentro.value) {
        if (_isLoading.value || esUltimaPagina) return
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val pagina = getCentros(filtro, page, 50)
                esUltimaPagina = pagina.esUltimaPagina
                _listaCentros.value = _listaCentros.value + pagina.items
                page++
            } catch (e: Exception) {
                _error.value = "Error al cargar centros alimentarios"
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun generarReporte() {
        val centro = _centroAlimentarioSeleccionado.value
        if (centro == null) {
            _error.value = "Debe seleccionar un centro alimentario"
            return
        }

        viewModelScope.launch {
            _isDownloading.value = true
            _error.value = null
            try {
                val result = getReportePdf(centro.id, _fecha.value, _correlativo.value)
                result.fold(
                    onSuccess = { bytes ->
                        PlatformFileHandler.openPdf(bytes, "Reporte_${centro.nombreCentro}_${_fecha.value}.pdf")
                    },
                    onFailure = {
                        _error.value = "Error al descargar el PDF: ${it.message}"
                    }
                )
            } catch (e: Exception) {
                _error.value = "Ocurrió un error inesperado"
            } finally {
                _isDownloading.value = false
            }
        }
    }

    fun limpiarError() {
        _error.value = null
    }
}
