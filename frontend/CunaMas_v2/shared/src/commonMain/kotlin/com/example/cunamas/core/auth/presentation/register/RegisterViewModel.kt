package com.example.cunamas.core.auth.presentation.register

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.cunamas.core.auth.domain.RegisterUseCase
import com.example.cunamas.core.auth.domain.TipoDocumento
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class RegisterState {
    object Idle : RegisterState()
    object Loading : RegisterState()
    data class Success(val mensaje: String) : RegisterState()
    data class Error(val mensaje: String) : RegisterState()
}

data class RequisitoPassword(val descripcion: String, val cumplido: Boolean)

@HiltViewModel
class RegisterViewModel @Inject constructor(
    private val registerUseCase: RegisterUseCase
) : ViewModel() {

    private val _state = MutableStateFlow<RegisterState>(RegisterState.Idle)
    val state: StateFlow<RegisterState> = _state

    fun registrar(
        idDocumento: Int,
        numeroDocumento: String,
        nombres: String,
        apPaterno: String,
        apMaterno: String,
        idGenero: Int,
        correoElectronico: String,
        password: String,
        confirmPassword: String
    ) {
        if (password != confirmPassword) {
            _state.value = RegisterState.Error("Las contraseñas no coinciden")
            return
        }

        viewModelScope.launch {
            _state.value = RegisterState.Loading

            val docLimpio = numeroDocumento.trim()
            val nombresLimpios = nombres.trim().replace("\\s+".toRegex(), " ")
            val apPaternoLimpio = apPaterno.trim().replace("\\s+".toRegex(), " ")
            val apMaternoLimpio = apMaterno.trim().replace("\\s+".toRegex(), " ")
            val correoLimpio = correoElectronico.trim()

            val result = registerUseCase(
                idDocumento, docLimpio, nombresLimpios, apPaternoLimpio, apMaternoLimpio,
                idGenero, correoLimpio, password
            )
            _state.value = result.fold(
                onSuccess = { RegisterState.Success(it) },
                onFailure = { RegisterState.Error(it.message ?: "No se pudo completar el registro. Intenta nuevamente.") }
            )
        }
    }

    fun limpiarEstado() {
        _state.value = RegisterState.Idle
    }

    // 👇 Filtros en tiempo real

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

    fun filtrarPassword(texto: String): String {
        return texto.filter { !it.isWhitespace() }   // contraseñas nunca deben llevar espacios
    }

    fun mensajeErrorNumeroDocumento(tipo: TipoDocumento?): String {
        return when (tipo) {
            TipoDocumento.DNI -> "El DNI debe tener 8 dígitos numéricos"
            TipoDocumento.CARNET_EXTRANJERIA -> "El CE debe ser alfanumérico (máx. 12 caracteres)"
            TipoDocumento.PASAPORTE -> "El pasaporte debe ser alfanumérico (máx. 12 caracteres)"
            null -> "El número de documento es obligatorio"
        }
    }

    // 👇 Validación de contraseña segura

    fun requisitosPassword(password: String): List<RequisitoPassword> {
        return listOf(
            RequisitoPassword("Al menos 8 caracteres", password.length >= 8),
            RequisitoPassword("Al menos una mayúscula", password.any { it.isUpperCase() }),
            RequisitoPassword("Al menos una minúscula", password.any { it.isLowerCase() }),
            RequisitoPassword("Al menos un número", password.any { it.isDigit() }),
            RequisitoPassword("Al menos un carácter especial (!@#$%...)", password.any { !it.isLetterOrDigit() })
        )
    }

    fun passwordEsSegura(password: String): Boolean {
        return requisitosPassword(password).all { it.cumplido }
    }
}