package com.example.cunamas.core.auth.domain

class LoginUseCase(
    private val repository: AuthRepository
) {
    suspend operator fun invoke(numeroDocumento: String, password: String): Result<User> {
        return repository.login(numeroDocumento, password)
    }
}