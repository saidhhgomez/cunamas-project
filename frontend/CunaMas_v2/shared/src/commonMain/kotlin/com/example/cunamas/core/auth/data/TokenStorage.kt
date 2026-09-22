package com.example.cunamas.core.auth.data
import com.example.cunamas.core.auth.data.dto.AuthResponseDto
import com.russhwolf.settings.Settings

class TokenStorage(private val settings: Settings = Settings()) {

    companion object {
        private const val KEY_TOKEN = "token"
        private const val KEY_REFRESH_TOKEN = "refresh_token"
        private const val KEY_ID_PERSONA = "id_persona"
        private const val KEY_NOMBRE = "nombre"
        private const val KEY_ROLES = "roles"
        private const val KEY_DISTRITO = "distrito"
        private const val KEY_TIENE_DIRECCION = "tiene_direccion"
    }

    fun saveSession(response: AuthResponseDto) {
        settings.putString(KEY_TOKEN, response.token)
        settings.putString(KEY_REFRESH_TOKEN, response.refreshToken)
        settings.putInt(KEY_ID_PERSONA, response.idPersona)
        settings.putString(KEY_NOMBRE, response.nombre)
        settings.putString(KEY_ROLES, response.roles.joinToString("|"))
        settings.putString(KEY_DISTRITO, response.distrito ?: "")
        settings.putBoolean(KEY_TIENE_DIRECCION, response.tieneDireccion)
    }

    fun updateAccessToken(newToken: String) {
        settings.putString(KEY_TOKEN, newToken)
    }

    fun getAccessToken(): String? = settings.getStringOrNull(KEY_TOKEN)

    fun getRefreshToken(): String? = settings.getStringOrNull(KEY_REFRESH_TOKEN)

    fun getIdPersona(): Int = settings.getInt(KEY_ID_PERSONA, -1)

    fun getNombre(): String? = settings.getStringOrNull(KEY_NOMBRE)

    fun getRoles(): List<String> {
        val rolesStr = settings.getStringOrNull(KEY_ROLES) ?: ""
        return if (rolesStr.isNotBlank()) rolesStr.split("|") else emptyList()
    }

    fun getDistrito(): String? {
        val distrito = settings.getStringOrNull(KEY_DISTRITO)
        return if (distrito.isNullOrBlank()) null else distrito
    }

    fun getTieneDireccion(): Boolean = settings.getBoolean(KEY_TIENE_DIRECCION, false)

    fun clearSession() {
        settings.clear()
    }

    fun hasSession(): Boolean = getRefreshToken() != null
}