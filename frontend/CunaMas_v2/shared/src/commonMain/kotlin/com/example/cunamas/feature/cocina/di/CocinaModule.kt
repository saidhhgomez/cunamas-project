package com.example.cunamas.feature.cocina.di

import com.example.cunamas.feature.cocina.data.CocinaAsistenciaRepositoryImpl
import com.example.cunamas.feature.cocina.data.CocinaIARepositoryImpl
import com.example.cunamas.feature.cocina.data.CocinaReporteRepositoryImpl
import com.example.cunamas.feature.cocina.domain.repository.CocinaAsistenciaRepository
import com.example.cunamas.feature.cocina.domain.repository.CocinaIARepository
import com.example.cunamas.feature.cocina.domain.repository.CocinaReporteRepository
import com.example.cunamas.feature.cocina.domain.usecase.AnalizarAlimentosIAUseCase
import com.example.cunamas.feature.cocina.domain.usecase.GetReportePdfUseCase
import com.example.cunamas.feature.cocina.domain.usecase.GetResumenCocinaAsistenciaUseCase
import com.example.cunamas.feature.cocina.presentation.CocinaCalculadora.CocinaCalculadoraCategoriasViewModel
import com.example.cunamas.feature.cocina.presentation.CocinaCalculadora.CocinaCalculadoraPreparacionesViewModel
import com.example.cunamas.feature.cocina.presentation.CocinaCalculadora.CocinaCalculadoraViewModel
import com.example.cunamas.feature.cocina.presentation.CocinaCalculadora.CocinaIA.CocinaIAViewModel
import com.example.cunamas.feature.cocina.presentation.ResumenAsistencia.ResumenAsistenciaViewModel
import com.example.cunamas.feature.cocina.presentation.consultarAsistencia.centroAlimentario.CocinaCentroAlimentarioViewModel
import com.example.cunamas.feature.cocina.presentation.consultarAsistencia.historialAsistencia.CocinaAsistenciaViewModel
import com.example.cunamas.feature.cocina.presentation.consultarAsistencia.locales.CocinaLocalesViewModel
import com.example.cunamas.feature.cocina.presentation.consultarAsistencia.modulo.CocinaModulosViewModel
import com.example.cunamas.feature.cocina.presentation.home.SociaCocinaHomeViewModel
import com.example.cunamas.feature.cocina.presentation.reporte.CocinaReporteViewModel
import org.koin.core.module.dsl.viewModel
import org.koin.dsl.module

val cocinaModule = module {
    // Repositories
    single<CocinaAsistenciaRepository> { CocinaAsistenciaRepositoryImpl(get()) }
    single<CocinaIARepository> { CocinaIARepositoryImpl(get()) }
    single<CocinaReporteRepository> { CocinaReporteRepositoryImpl(get()) }

    // Use Cases
    factory { GetResumenCocinaAsistenciaUseCase(get()) }
    factory { AnalizarAlimentosIAUseCase(get()) }
    factory { GetReportePdfUseCase(get()) }

    // ViewModels
    viewModel {
        SociaCocinaHomeViewModel(
            sessionManager = get(),
            authRepository = get()
        )
    }

    viewModel {
        CocinaCentroAlimentarioViewModel(
            getCentros = get(),
            sessionManager = get()
        )
    }

    viewModel { (idCentroAlimentario: Int) ->
        CocinaLocalesViewModel(
            getLocales = get(),
            sessionManager = get(),
            idCentroAlimentario = idCentroAlimentario
        )
    }

    viewModel { (idLocal: Int) ->
        CocinaModulosViewModel(
            getModulos = get(),
            sessionManager = get(),
            idLocal = idLocal
        )
    }

    viewModel { parameters ->
        CocinaAsistenciaViewModel(
            getAsistencia = get(),
            sessionManager = get(),
            idModulo = parameters.get()
        )
    }

    viewModel {
        ResumenAsistenciaViewModel(
            getResumenCocinaAsistencia = get(),
            getCentros = get(),
            sessionManager = get()
        )
    }

    viewModel { CocinaCalculadoraCategoriasViewModel(get(), get()) }

    viewModel { (idCategoria: Int) ->
        CocinaCalculadoraPreparacionesViewModel(
            idCategoria = idCategoria,
            getPreparacionesPorCategoria = get(),
            sessionManager = get()
        )
    }

    viewModel {
        CocinaCalculadoraViewModel(
            getRangos = get(),
            getCentros = get(),
            getResumenServicio = get(),
            calcularUseCase = get(),
            sessionManager = get(),
            savedStateHandle = get()
        )
    }

    viewModel { (jsonResumen: String) ->
        CocinaIAViewModel(
            analizarAlimentosIA = get(),
            sessionManager = get(),
            jsonResumen = jsonResumen
        )
    }

    viewModel {
        CocinaReporteViewModel(
            getReportePdf = get(),
            getCentros = get(),
            sessionManager = get()
        )
    }
}
