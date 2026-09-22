package com.example.cunamas.core.ui.components

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavController
import com.example.cunamas.core.auth.domain.Role



@Composable
fun RoleScaffold(
    role: Role,
    rutaActual: String,
    navController: NavController,
    mostrarBottomBar: Boolean = true,
    isLoading: Boolean = false,
    topBar: @Composable () -> Unit = {},
    bottomBar: @Composable () -> Unit = {}, // 👈 Nuevo parámetro
    floatingActionButton: @Composable () -> Unit = {},
    content: @Composable (PaddingValues) -> Unit
) {
    Box(modifier = Modifier.fillMaxSize()) {
        Scaffold(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding(),
            topBar = topBar,
            bottomBar = {
                if (mostrarBottomBar) {
                    RoleBottomNavBar(
                        navController = navController,
                        role = role,
                        rutaActual = rutaActual
                    )
                } else {
                    bottomBar() // 👈 Usa el bottomBar personalizado si existe
                }
            },
            floatingActionButton = floatingActionButton,
            content = content
        )

        if (isLoading) {
            LoadingOverlay()
        }
    }
}