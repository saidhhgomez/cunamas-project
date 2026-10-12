package com.example.cunamas.feature.gestion.di

import com.example.cunamas.feature.gestion.data.remote.AsistenciaApi
import com.example.cunamas.feature.gestion.data.remote.CalculadoraApi
import com.example.cunamas.feature.gestion.data.remote.CategoriasAlimentoApi
import com.example.cunamas.feature.gestion.data.remote.CentrosAlimentariosApi
import com.example.cunamas.feature.gestion.data.remote.GestionApi
import com.example.cunamas.feature.gestion.data.remote.LocalesApi
import com.example.cunamas.feature.gestion.data.remote.ModulosApi
import com.example.cunamas.feature.gestion.data.remote.PreparacionApi
import com.example.cunamas.feature.gestion.data.repositoryImpl.AsistenciaRepositoryImpl
import com.example.cunamas.feature.gestion.data.repositoryImpl.CalculadoraRepositoryImpl
import com.example.cunamas.feature.gestion.data.repositoryImpl.CategoriasAlimentoRepositoryImpl
import com.example.cunamas.feature.gestion.data.repositoryImpl.CentrosAlimentariosRepositoryImpl
import com.example.cunamas.feature.gestion.data.repositoryImpl.GestionRepositoryImpl
import com.example.cunamas.feature.gestion.data.repositoryImpl.LocalesRepositoryImpl
import com.example.cunamas.feature.gestion.data.repositoryImpl.ModulosRepositoryImpl
import com.example.cunamas.feature.gestion.data.repositoryImpl.PreparacionRepositoryImpl
import com.example.cunamas.feature.gestion.domain.repository.AsistenciaRepository
import com.example.cunamas.feature.gestion.domain.repository.CalculadoraRepository
import com.example.cunamas.feature.gestion.domain.repository.CategoriasAlimentoRepository
import com.example.cunamas.feature.gestion.domain.repository.CentrosAlimentariosRepository
import com.example.cunamas.feature.gestion.domain.repository.GestionRepository
import com.example.cunamas.feature.gestion.domain.repository.LocalesRepository
import com.example.cunamas.feature.gestion.domain.repository.ModulosRepository
import com.example.cunamas.feature.gestion.domain.repository.PreparacionRepository
import com.example.cunamas.feature.gestion.presentation.calculadora.CategoriasAlimentoViewModel
import com.example.cunamas.feature.gestion.presentation.calculadora.PreparacionViewModel
import com.example.cunamas.feature.gestion.presentation.calculadora.calculadoraDosificadora.CalculadoraDosificadoraViewModel
import com.example.cunamas.feature.gestion.presentation.centroAlimentario.CentrosAlimentariosViewModel
import com.example.cunamas.feature.gestion.presentation.centroAlimentario.crearCentroAlimentario.CrearCentroAlimentarioViewModel
import com.example.cunamas.feature.gestion.presentation.detalle_usuario.DetalleUsuarioViewModel
import com.example.cunamas.feature.gestion.presentation.historialAsistencia.AsistenciaViewModel
import com.example.cunamas.feature.gestion.presentation.home.GestionHomeViewModel
import com.example.cunamas.feature.gestion.presentation.locales.LocalesViewModel
import com.example.cunamas.feature.gestion.presentation.locales.crearLocales.CrearLocalViewModel
import com.example.cunamas.feature.gestion.presentation.modulo.ModulosViewModel
import com.example.cunamas.feature.gestion.presentation.modulo.crearModulo.CrearModuloViewModel
import com.example.cunamas.feature.gestion.presentation.usuarios.crearLocales.AgregarCredencialesViewModel
import com.example.cunamas.feature.gestion.presentation.usuarios_pendientes.UsuariosPendientesViewModel
import com.example.cunamas.feature.gestion.usecase.*
import com.example.cunamas.feature.gestion.usecase.calculadora.GetCategoriasAlimentoUseCase
import com.example.cunamas.feature.gestion.usecase.calculadora.GetPreparacionesUseCase
import com.example.cunamas.feature.gestion.usecase.calculadora.calculadoraDosificadora.CalcularUseCase
import com.example.cunamas.feature.gestion.usecase.calculadora.calculadoraDosificadora.GetRangosUseCase
import com.example.cunamas.feature.gestion.usecase.calculadora.calculadoraDosificadora.GetResumenServicioUseCase
import com.example.cunamas.feature.gestion.usecase.centroAlimentario.CrearCentroAlimentarioUseCase
import com.example.cunamas.feature.gestion.usecase.centroAlimentario.GetCentroAlimentarioByIdUseCase
import com.example.cunamas.feature.gestion.usecase.centroAlimentario.GetCentrosAlimentariosUseCase
import com.example.cunamas.feature.gestion.usecase.credenciales.CrearUsuarioUseCase
import com.example.cunamas.feature.gestion.usecase.distrito.BuscarDistritosUseCase
import com.example.cunamas.feature.gestion.usecase.historialAsistencia.GetAsistenciaUseCase
import com.example.cunamas.feature.gestion.usecase.locales.CrearLocalUseCase
import com.example.cunamas.feature.gestion.usecase.locales.GetLocalesUseCase
import com.example.cunamas.feature.gestion.usecase.modulo.CrearModuloUseCase
import com.example.cunamas.feature.gestion.usecase.modulo.GetModulosUseCase
import org.koin.core.module.dsl.viewModel
import org.koin.dsl.module
val gestionModule = module {
    // 1. APIs de Ktor (Inyectando el HttpClient global con get())
    single { AsistenciaApi(get()) }
    single { CalculadoraApi(get()) }
    single { CategoriasAlimentoApi(get()) }
    single { CentrosAlimentariosApi(get()) }
    single { GestionApi(get()) }
    single { LocalesApi(get()) }
    single { ModulosApi(get()) }
    single { PreparacionApi(get()) }

    // 2. Repositorios
    single<AsistenciaRepository> { AsistenciaRepositoryImpl(get()) }
    single<CalculadoraRepository> { CalculadoraRepositoryImpl(get()) }
    single<CategoriasAlimentoRepository> { CategoriasAlimentoRepositoryImpl(get()) }
    single<CentrosAlimentariosRepository> { CentrosAlimentariosRepositoryImpl(get()) }
    single<GestionRepository> { GestionRepositoryImpl(get()) }
    single<LocalesRepository> { LocalesRepositoryImpl(get()) }
    single<ModulosRepository> { ModulosRepositoryImpl(get()) }
    single<PreparacionRepository> { PreparacionRepositoryImpl(get()) }

    // 3. UseCases
    factory { AprobarUsuarioUseCase(get()) }
    factory { GetUsuarioDetalleUseCase(get()) }
    factory { GetUsuariosPendientesUseCase(get()) }
    factory { GetCategoriasAlimentoUseCase(get()) }
    factory { GetPreparacionesUseCase(get()) }
    factory { CalcularUseCase(get()) }
    factory { GetRangosUseCase(get()) }
    factory { GetResumenServicioUseCase(get()) }
    factory { CrearCentroAlimentarioUseCase(get()) }
    factory { GetCentroAlimentarioByIdUseCase(get()) }
    factory { GetCentrosAlimentariosUseCase(get()) }
    factory { CrearUsuarioUseCase(get()) }
    factory { BuscarDistritosUseCase(get()) }
    factory { GetAsistenciaUseCase(get()) }
    factory { CrearLocalUseCase(get(), get()) }
    factory { GetLocalesUseCase(get()) }
    factory { CrearModuloUseCase(get()) }
    factory { GetModulosUseCase(get()) }

    // 4. ViewModels
    viewModel {
        CalculadoraDosificadoraViewModel(
            getRangos = get(),
            getCentros = get(),
            getResumenServicio = get(),
            calcularUseCase = get(),
            savedStateHandle = get() // 👈 Koin se encarga de proveer el SavedStateHandle automáticamente
        )
    }
    viewModel { CentrosAlimentariosViewModel(get()) }
    viewModel {
        CrearCentroAlimentarioViewModel(
            buscarDistritos = get(),
            crearCentroAlimentario = get()
        )
    }
    viewModel {
        DetalleUsuarioViewModel(
            getUsuarioDetalleUseCase = get(),
            aprobarUsuarioUseCase = get(),
            sessionManager = get()
        )
    }
    viewModel { parameters ->
        AsistenciaViewModel(
            getAsistencia = get(),
            sessionManager = get(),
            idModulo = parameters.get() // 👈 Aquí atrapa el número que le mandas
        )
    }
    viewModel {
        GestionHomeViewModel(
            sessionManager = get(),
            authRepository = get()
        )
    }
    viewModel { parameters ->
        LocalesViewModel(
            getLocales = get(),
            sessionManager = get(),
            idCentroAlimentario = parameters.get() // 👈 Koin capturará el ID que le pases desde la pantalla
        )
    }
    viewModel {
        CrearLocalViewModel(
            buscarDistritosUseCase = get(),
            crearLocalUseCase = get()
        )
    }
    viewModel { parameters ->
        ModulosViewModel(
            getModulos = get(),
            sessionManager = get(),
            idLocal = parameters.get() // 👈 Koin captura el ID del local desde la pantalla
        )
    }
    viewModel { CrearModuloViewModel(get()) }
    viewModel { AgregarCredencialesViewModel(get()) }
    viewModel { UsuariosPendientesViewModel(get(), get()) }
    viewModel { CategoriasAlimentoViewModel(get(), get()) }
    viewModel { parameters ->
        PreparacionViewModel(
            idCategoria = parameters.get(),
            getPreparacionesPorCategoria = get(),
            sessionManager = get()
        )
    }
}