package com.example.cunamas

import android.app.Application
import com.example.cunamas.core.auth.di.authModule
import com.example.cunamas.core.network.di.di.networkModule
import com.example.cunamas.core.session.di.sessionModule
import com.example.cunamas.feature.cocina.di.cocinaModule
import com.example.cunamas.feature.gestion.di.gestionModule
import com.example.cunamas.feature.madre.di.madreModule
import org.koin.android.ext.koin.androidContext
import org.koin.android.ext.koin.androidLogger
import org.koin.core.context.startKoin
import org.koin.core.logger.Level

class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidLogger(Level.ERROR) // <-- Añade esto para depurar fallos de Koin
            androidContext(this@MainApplication)
            modules(
                networkModule,
                authModule,
                sessionModule,
                gestionModule,
                cocinaModule,
                madreModule
            )
        }
    }
}
