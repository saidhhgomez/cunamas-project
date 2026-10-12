package com.example.cunamas.core.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.example.cunamas.core.auth.domain.Role
import com.example.cunamas.core.auth.domain.RoleGroup
import com.example.cunamas.core.auth.presentation.login.LoginScreen
import com.example.cunamas.core.auth.presentation.register.RegisterScreen
import com.example.cunamas.core.auth.presentation.splash.SplashScreen
import com.example.cunamas.core.session.SessionManager
import com.example.cunamas.feature.cocina.navigation.sociaCocinaNavGraph
import com.example.cunamas.feature.gestion.navigation.gestionNavGraph
import com.example.cunamas.feature.madre.navigation.madreNavGraph

@Composable
fun AppNavHost(
    navController: NavHostController,
    sessionManager: SessionManager
) {
    NavHost(
        navController = navController,
        startDestination = "splash"
    ) {
        // 1. Pantalla Splash
        composable("splash") {
            SplashScreen(
                onSesionActiva = { roles ->
                    val rolPrincipal = roles.mapNotNull { rolStr ->
                        runCatching { Role.valueOf(rolStr) }.getOrNull()
                    }.firstOrNull() ?: Role.DESCONOCIDO

                    val grupo = RoleGroup.paraRol(rolPrincipal)
                    val destino = grupo?.rutaGraph ?: "login"

                    navController.navigate(destino) {
                        popUpTo("splash") { inclusive = true }
                    }
                },
                onSinSesion = {
                    navController.navigate("login") {
                        popUpTo("splash") { inclusive = true }
                    }
                }
            )
        }

        // 2. Pantalla Login
        composable("login") {
            LoginScreen(
                onLoginSuccess = { roles ->
                    val rolPrincipal = roles.mapNotNull { rolStr ->
                        runCatching { Role.valueOf(rolStr) }.getOrNull()
                    }.firstOrNull() ?: Role.DESCONOCIDO

                    val grupo = RoleGroup.paraRol(rolPrincipal)
                    val destino = grupo?.rutaGraph ?: "login"

                    navController.navigate(destino) {
                        popUpTo("login") { inclusive = true }
                    }
                },
                onIrARegistro = {
                    navController.navigate("register")
                }
            )
        }

        // 3. Pantalla Registro
        composable("register") {
            RegisterScreen(
                onVolverALogin = {
                    navController.popBackStack()
                }
            )
        }

        // 4. Grafo de Gestión
        gestionNavGraph(
            navController = navController,
            sessionManager = sessionManager,
            onAccesoDenegado = {
                navController.navigate("login") {
                    popUpTo(navController.graph.startDestinationId) { inclusive = true }
                }
            }
        )

        // 5. Grafo de Cocina
        sociaCocinaNavGraph(
            navController = navController,
            sessionManager = sessionManager,
            onAccesoDenegado = {
                navController.navigate("login") {
                    popUpTo(navController.graph.startDestinationId) { inclusive = true }
                }
            }
        )

        // 6. Grafo de Madres
        madreNavGraph(
            navController = navController,
            sessionManager = sessionManager,
            onAccesoDenegado = {
                navController.navigate("login") {
                    popUpTo(navController.graph.startDestinationId) { inclusive = true }
                }
            }
        )
    }
}