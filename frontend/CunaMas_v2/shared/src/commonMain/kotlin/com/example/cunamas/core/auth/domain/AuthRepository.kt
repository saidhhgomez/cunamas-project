package com.example.cunamas.core.auth.domain


    interface AuthRepository {
        suspend fun login(numeroDocumento: String, password: String): Result<User>
        suspend fun logout()
        suspend fun getCurrentUser(): User?
        suspend fun restoreSession(): Result<User>
        suspend fun register(
            idDocumento: Int,
            numeroDocumento: String,
            nombres: String,
            apPaterno: String,
            apMaterno: String,
            idGenero: Int,
            correoElectronico: String,
            password: String
        ): Result<String>
    }