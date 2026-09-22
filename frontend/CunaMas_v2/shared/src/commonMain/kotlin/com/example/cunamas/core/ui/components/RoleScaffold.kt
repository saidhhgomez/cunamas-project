package com.example.cunamas.core.ui.components

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
    topBar: @Composable () -> Unit = {},
    floatingActionButton: @Composable () -> Unit = {},
    content: @Composable (PaddingValues) -> Unit
) {
    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding(),   // 👈 protección arriba, UNA sola vez para toda pantalla que use esto
        topBar = topBar,
        bottomBar = {
            if (mostrarBottomBar) {
                RoleBottomNavBar(
                    navController = navController,
                    role = role,
                    rutaActual = rutaActual
                )
            }
        },
        floatingActionButton = floatingActionButton,
        content = content
    )
}