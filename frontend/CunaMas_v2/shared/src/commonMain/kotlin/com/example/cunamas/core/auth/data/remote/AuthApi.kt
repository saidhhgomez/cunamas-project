package com.example.cunamas.core.auth.data.remote

import com.example.cunamas.core.auth.data.dto.AuthResponseDto
import com.example.cunamas.core.auth.data.dto.LoginRequestDto
import com.example.cunamas.core.auth.data.dto.RefreshRequestDto
import com.example.cunamas.core.auth.data.dto.RegisterRequestDto
import com.example.cunamas.core.auth.data.dto.RegisterResponseDto
import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.post
import io.ktor.client.request.setBody

class AuthApi(private val client: HttpClient) {

    suspend fun login(request: LoginRequestDto): AuthResponseDto {
        return client.post("auth/login") {
            setBody(request)
        }.body()
    }

    suspend fun refresh(request: RefreshRequestDto): AuthResponseDto {
        return client.post("auth/refresh") {
            setBody(request)
        }.body()
    }

    suspend fun register(request: RegisterRequestDto): RegisterResponseDto {
        return client.post("auth/register") {
            setBody(request)
        }.body()
    }
}