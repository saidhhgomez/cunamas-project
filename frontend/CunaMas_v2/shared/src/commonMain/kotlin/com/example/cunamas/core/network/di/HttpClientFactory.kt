package com.example.cunamas.core.network.di

import io.ktor.client.HttpClient
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.plugins.defaultRequest
import io.ktor.client.plugins.logging.LogLevel
import io.ktor.client.plugins.logging.Logger
import io.ktor.client.plugins.logging.Logging
import io.ktor.client.request.HttpRequestPipeline
import io.ktor.client.request.header
import io.ktor.http.ContentType
import io.ktor.http.HttpHeaders
import io.ktor.serialization.kotlinx.json.json
import kotlinx.serialization.json.Json
import com.example.cunamas.core.session.SessionManager // 👈 Importa tu SessionManager

object HttpClientFactory {
    // Recibimos el sessionManager aquí
    fun create(sessionManager: SessionManager): HttpClient {
        return HttpClient {
            install(ContentNegotiation) {
                json(Json {
                    ignoreUnknownKeys = true
                    prettyPrint = true
                    isLenient = true
                })
            }
            install(HttpTimeout) {
                requestTimeoutMillis = ApiConfig.TIMEOUT_MILLIS
                connectTimeoutMillis = ApiConfig.TIMEOUT_MILLIS
                socketTimeoutMillis = ApiConfig.TIMEOUT_MILLIS
            }
            install(Logging) {
                logger = object : Logger {
                    override fun log(message: String) {
                        // Imprime con un tag directo que coincida con tu búsqueda
                        println("KETOR_LOG: $message")
                    }
                }
                level = LogLevel.BODY
            }
            defaultRequest {
                url(ApiConfig.BASE_URL)
                header(HttpHeaders.ContentType, ContentType.Application.Json)
            }
        }.apply {
            // 🔑 INTERCEPTOR DINÁMICO: Inyecta el token en CADA petición antes de salir
            requestPipeline.intercept(HttpRequestPipeline.State) {
                val token = sessionManager.getToken()
                if (!token.isNullOrBlank()) {
                    context.header(HttpHeaders.Authorization, "Bearer $token")
                }
            }
        }
    }
}