package com.example.cunamas.core.session.di

import com.example.cunamas.core.auth.data.TokenStorage
import com.example.cunamas.core.session.SessionManager
import com.example.cunamas.core.session.SessionManagerImpl
import org.koin.dsl.module
val sessionModule = module {
    single { TokenStorage() } // <-- Añade esta línea
    single<SessionManager> { SessionManagerImpl() }
}