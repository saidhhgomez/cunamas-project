package com.example.cunamas.core.auth.di

import com.example.cunamas.core.network.di.di.networkModule
import com.example.cunamas.core.session.di.sessionModule
import com.example.cunamas.feature.cocina.di.cocinaModule
import com.example.cunamas.feature.gestion.di.gestionModule
import com.example.cunamas.feature.madre.di.madreModule
import org.koin.core.context.startKoin

fun initKoin() {
    startKoin {
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