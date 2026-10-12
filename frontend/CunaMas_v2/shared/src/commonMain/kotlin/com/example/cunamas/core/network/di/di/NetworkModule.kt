package com.example.cunamas.core.network.di.di

import com.example.cunamas.core.network.di.HttpClientFactory
import com.example.cunamas.core.session.SessionManager
import com.example.cunamas.core.session.SessionManagerImpl
import io.ktor.client.HttpClient
import org.koin.dsl.module

val networkModule = module {
    // Registra la implementación de SessionManager en lugar de la interfaz
    single<SessionManager> { SessionManagerImpl() }

    // Especifica el tipo explícito <HttpClient> para solucionar el error de inferencia
    single<HttpClient> { HttpClientFactory.create(get()) }
}