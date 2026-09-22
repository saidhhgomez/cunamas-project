package com.example.cunamas.feature.gestion.presentation.usuarios.crearLocales

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cunamas.core.common.TipoDocumento
import com.example.cunamas.feature.gestion.domain.model.CredencialCreada
import com.example.cunamas.feature.gestion.usecase.credenciales.CrearUsuarioUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class CrearUsuarioState {
    object Idle : CrearUsuarioState()
    object Enviando : CrearUsuarioState()
    data class Exito(val credencial: CredencialCreada) : CrearUsuarioState()
    data class Error(val mensaje: String) : CrearUsuarioState()
}

class AgregarCredencialesViewModel(
    private val crearUsuarioUseCase: CrearUsuarioUseCase
) : ViewModel() {

    private val _state = MutableStateFlow<CrearUsuarioState>(CrearUsuarioState.Idle)
    val state: StateFlow<CrearUsuarioState> = _state

    fun crear(
        idDocumento: Int,
        numeroDocumento: String,
        nombres: String,
        apPaterno: String,
        apMaterno: String,
        idGenero: Int,
        correoElectronico: String,
        rolesIds: List<Int>
    ) {
        viewModelScope.launch {
            _state.value = CrearUsuarioState.Enviando

            // Sanitización final de respaldo, antes de enviar al backend
            val docLimpio = numeroDocumento.trim()
            val nombresLimpios = nombres.trim().replace("\\s+".toRegex(), " ")
            val apPaternoLimpio = apPaterno.trim().replace("\\s+".toRegex(), " ")
            val apMaternoLimpio = apMaterno.trim().replace("\\s+".toRegex(), " ")
            val correoLimpio = correoElectronico.trim()

            val result = crearUsuarioUseCase(
                idDocumento,
                docLimpio,
                nombresLimpios,
                apPaternoLimpio,
                apMaternoLimpio,
                idGenero,
                correoLimpio,
                rolesIds
            )

            _state.value = result.fold(
                onSuccess = { CrearUsuarioState.Exito(it) },
                onFailure = { CrearUsuarioState.Error(it.message ?: "Error al crear usuario") }
            )
        }
    }

    fun limpiarError() {
        _state.value = CrearUsuarioState.Idle
    }

    // 👇 filtros EN TIEMPO REAL, mientras el usuario escribe

    fun filtrarNumeroDocumento(texto: String, tipo: TipoDocumento?): String {
        var limpio = texto.filter { !it.isWhitespace() }

        limpio = if (tipo?.soloNumerico == true) {
            limpio.filter { it.isDigit() }
        } else {
            limpio.filter { it.isLetterOrDigit() }
        }

        val maxLength = tipo?.longitudMaxima ?: 12
        return limpio.take(maxLength)
    }

    fun filtrarTextoSinEspaciosDobles(texto: String): String {
        return texto
            .filter { it.isLetter() || it == ' ' }
            .replace(Regex(" +"), " ")
            .trimStart()
    }

    fun filtrarCorreo(texto: String): String {
        return texto.filter { !it.isWhitespace() }
    }

    fun mensajeErrorNumeroDocumento(tipo: TipoDocumento?): String {
        return when (tipo) {
            TipoDocumento.DNI -> "El DNI debe tener 8 dígitos numéricos"
            TipoDocumento.CARNET_EXTRANJERIA -> "El CE debe ser alfanumérico (máx. 12 caracteres)"
            TipoDocumento.PASAPORTE -> "El pasaporte debe ser alfanumérico (máx. 12 caracteres)"
            null -> "El número de documento es obligatorio"
        }
    }
}