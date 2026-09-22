package com.example.cunamas

import android.app.Application
import org.koin.android.ext.koin.androidContext
import org.koin.core.context.startKoin

class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        startKoin {
            androidContext(this@MainApplication)
            // Si tienes módulos compartidos de Koin, agrégalos aquí, por ejemplo:
            // modules(appModule)
        }
    }
}
