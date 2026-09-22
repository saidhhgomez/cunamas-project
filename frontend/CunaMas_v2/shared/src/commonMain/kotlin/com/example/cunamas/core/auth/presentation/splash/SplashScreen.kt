package com.example.cunamas.core.auth.presentation.splash

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import org.koin.compose.viewmodel.koinViewModel
import com.example.cunamas.core.ui.components.AuthScaffold

@Composable
fun SplashScreen(
    viewModel: SplashViewModel = koinViewModel(),
    onSesionActiva: (roles: List<String>) -> Unit,
    onSinSesion: () -> Unit
) {
    val state by viewModel.state.collectAsState()

    // Manejamos la navegación de forma limpia y reactiva basada en el estado principal
    LaunchedEffect(state) {
        when (val currentState = state) {
            is SplashState.SesionActiva -> {
                onSesionActiva(currentState.user.roles.map { it.name })
            }
            is SplashState.SinSesion -> {
                onSinSesion()
            }
            is SplashState.Loading -> {
                // No hace nada, se mantiene mostrando el indicador de carga
            }
        }
    }

    AuthScaffold { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentAlignment = Alignment.Center
        ) {
            // Mostramos el indicador mientras el estado sea Loading
            if (state is SplashState.Loading) {
                CircularProgressIndicator()
            }
        }
    }
}