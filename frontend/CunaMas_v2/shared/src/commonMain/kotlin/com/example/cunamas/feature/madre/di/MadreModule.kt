package com.example.cunamas.feature.madre.di

import com.example.cunamas.feature.madre.data.MadreRepositoryImpl
import com.example.cunamas.feature.madre.domain.repository.MadreRepository
import com.example.cunamas.feature.madre.domain.usecase.GuardarDireccionUseCase
import com.example.cunamas.feature.madre.presentation.home.MadreHomeViewModel
import org.koin.core.module.dsl.viewModel
import org.koin.dsl.module

val madreModule = module {
    // Repository
    single<MadreRepository> { MadreRepositoryImpl(get()) }

    // UseCases
    factory { GuardarDireccionUseCase(get()) }

    // ViewModels
    viewModel {
        MadreHomeViewModel(
            sessionManager = get(),
            buscarDistritos = get(),
            guardarDireccion = get()
        )
    }
}
