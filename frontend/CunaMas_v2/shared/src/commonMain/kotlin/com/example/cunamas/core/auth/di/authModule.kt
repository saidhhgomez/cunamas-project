package com.example.cunamas.core.auth.di

import com.example.cunamas.core.auth.data.AuthRepositoryImpl
import com.example.cunamas.core.auth.data.TokenStorage
import com.example.cunamas.core.auth.data.remote.AuthApi
import com.example.cunamas.core.auth.domain.AuthRepository
import com.example.cunamas.core.auth.domain.GetCurrentUserUseCase
import com.example.cunamas.core.auth.domain.LoginUseCase
import com.example.cunamas.core.auth.domain.RegisterUseCase
import com.example.cunamas.core.auth.presentation.login.LoginViewModel
import com.example.cunamas.core.auth.presentation.register.RegisterViewModel
import com.example.cunamas.core.auth.presentation.splash.SplashViewModel
import org.koin.core.module.dsl.viewModel
import org.koin.dsl.module
val authModule = module {
    single { AuthApi(get()) }
    single<AuthRepository> { AuthRepositoryImpl(get(), get(), get()) }
    // Use Cases
    factory { LoginUseCase(get()) }
    factory { GetCurrentUserUseCase(get()) }
    factory { RegisterUseCase(get()) }

    // ViewModels
    viewModel { LoginViewModel(get()) }
    viewModel { SplashViewModel(get()) } // <-- ¡Agrega esta línea aquí!
    viewModel { RegisterViewModel(get()) }}