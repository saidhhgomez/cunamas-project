package com.example.cunamas.feature.madre.di

import com.example.cunamas.feature.madre.data.MadreRepositoryImpl
import com.example.cunamas.feature.madre.domain.repository.MadreRepository
import com.example.cunamas.feature.madre.domain.usecase.GetCentrosAtencionUseCase
import com.example.cunamas.feature.madre.domain.usecase.GuardarDireccionUseCase
import com.example.cunamas.feature.madre.domain.usecase.RegistrarAsistenciaMadreUseCase
import com.example.cunamas.feature.madre.presentation.asistencia.MadreAsistenciaViewModel
import com.example.cunamas.feature.madre.presentation.home.MadreHomeViewModel
import com.example.cunamas.feature.madre.presentation.modulo.MadreModulosViewModel
import org.koin.core.module.dsl.viewModel
import org.koin.dsl.module

val madreModule = module {
    // Repository
    single<MadreRepository> { MadreRepositoryImpl(get()) }

    // UseCases
    factory { GuardarDireccionUseCase(get()) }
    factory { GetCentrosAtencionUseCase(get()) }
    factory { RegistrarAsistenciaMadreUseCase(get()) }

    // ViewModels
    viewModel {
        MadreHomeViewModel(
            sessionManager = get(),
            buscarDistritos = get(),
            guardarDireccion = get(),
            getCentrosAtencion = get()
        )
    }

    viewModel { (idLocal: Int) ->
        MadreModulosViewModel(
            getModulos = get(),
            sessionManager = get(),
            idLocal = idLocal
        )
    }

    viewModel { (idModulo: Int) ->
        MadreAsistenciaViewModel(
            idModulo = idModulo,
            registrarAsistenciaUseCase = get(),
            sessionManager = get()
        )
    }
}
