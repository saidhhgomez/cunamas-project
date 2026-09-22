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
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.cunamas.core.ui.components.AuthScaffold

@Composable
fun SplashScreen(
    viewModel: SplashViewModel = hiltViewModel(),
    onSesionActiva: (roles: List<String>) -> Unit,
    onSinSesion: () -> Unit
) {
    val state by viewModel.state.collectAsState()

    AuthScaffold { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentAlignment = Alignment.Center
        ) {
            when (val currentState = state) {
                is SplashState.Loading -> CircularProgressIndicator()
                is SplashState.SesionActiva -> {
                    LaunchedEffect(Unit) {
                        onSesionActiva(currentState.user.roles.map { it.name })
                    }
                }
                is SplashState.SinSesion -> {
                    LaunchedEffect(Unit) { onSinSesion() }
                }
            }
        }
    }
}