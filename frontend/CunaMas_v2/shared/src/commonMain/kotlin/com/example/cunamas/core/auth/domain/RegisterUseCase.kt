package com.example.cunamas.core.auth.domain

class RegisterUseCase(
    private val repository: AuthRepository
) {
    suspend operator fun invoke(
        idDocumento: Int,
        numeroDocumento: String,
        nombres: String,
        apPaterno: String,
        apMaterno: String,
        idGenero: Int,
        correoElectronico: String,
        password: String
    ): Result<String> {
        return repository.register(
            idDocumento, numeroDocumento, nombres, apPaterno, apMaterno,
            idGenero, correoElectronico, password
        )
    }
}