package com.example.cunamas.core.auth.data

import com.example.cunamas.core.auth.data.dto.AuthResponseDto
import com.example.cunamas.core.auth.data.dto.CuentaDto
import com.example.cunamas.core.auth.data.dto.LoginRequestDto
import com.example.cunamas.core.auth.data.dto.PersonaDto
import com.example.cunamas.core.auth.data.dto.RefreshRequestDto
import com.example.cunamas.core.auth.data.dto.RegisterRequestDto
import com.example.cunamas.core.auth.data.remote.AuthApi
import com.example.cunamas.core.auth.domain.AuthRepository
import com.example.cunamas.core.auth.domain.Role
import com.example.cunamas.core.auth.domain.User
import com.example.cunamas.core.session.SessionManager
import com.example.cunamas.core.util.DeviceInfoProvider

class AuthRepositoryImpl(
    private val api: AuthApi,
    private val tokenStorage: TokenStorage,
    private val sessionManager: SessionManager
) : AuthRepository {

    override suspend fun login(numeroDocumento: String, password: String): Result<User> {
        return try {
            val request = LoginRequestDto(
                numeroDocumento = numeroDocumento,
                password = password,
                dispositivo = DeviceInfoProvider.getDeviceInfo() // 👈 Obtiene directamente el DispositivoDto
            )
            val response = api.login(request)
            tokenStorage.saveSession(response)

            val user = mapearUser(response)
            sessionManager.setUser(user)
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun logout() {
        tokenStorage.clearSession()
        sessionManager.clearUser()
    }

    override suspend fun getCurrentUser(): User? {
        return sessionManager.currentUser.value
    }

    override suspend fun restoreSession(): Result<User> {
        return try {
            val refreshToken = tokenStorage.getRefreshToken()
                ?: return Result.failure(Exception("No hay sesión guardada"))

            val response = api.refresh(RefreshRequestDto(refreshToken))
            tokenStorage.saveSession(response)

            val user = mapearUser(response)
            sessionManager.setUser(user)
            Result.success(user)
        } catch (e: Exception) {
            tokenStorage.clearSession()
            Result.failure(e)
        }
    }

    override suspend fun register(
        idDocumento: Int,
        numeroDocumento: String,
        nombres: String,
        apPaterno: String,
        apMaterno: String,
        idGenero: Int,
        correoElectronico: String,
        password: String
    ): Result<String> {
        return try {
            val request = RegisterRequestDto(
                persona = PersonaDto(
                    idDocumento,
                    numeroDocumento,
                    nombres,
                    apPaterno,
                    apMaterno,
                    idGenero
                ),
                cuenta = CuentaDto(correoElectronico, password)
            )
            val response = api.register(request)
            Result.success(response.mensaje)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    private fun mapearUser(response: AuthResponseDto): User {
        return User(
            idPersona = response.idPersona,
            nombre = response.nombre,
            distrito = response.distrito,
            tieneDireccion = response.tieneDireccion,
            roles = response.roles.map { Role.fromBackend(it) },
            token = response.token // 👈 ¡Agrega esta línea!
        )
    }
}