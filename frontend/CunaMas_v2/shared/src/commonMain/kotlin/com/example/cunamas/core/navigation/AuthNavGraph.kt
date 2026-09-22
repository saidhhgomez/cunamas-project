package com.example.cunamas.core.navigation

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavController
import androidx.navigation.compose.composable
import androidx.navigation.navigation
import com.example.cunamas.core.auth.presentation.login.LoginScreen
import com.example.cunamas.core.auth.presentation.register.RegisterScreen
import com.example.cunamas.core.auth.presentation.splash.SplashScreen

object AuthRoutes {
    const val SPLASH = "splash"
    const val LOGIN = "login"
    const val REGISTER = "register"
    const val GRAPH = "auth_graph"
}

fun NavGraphBuilder.authNavGraph(
    navController: NavController,
    onNavegarARolHome: (roles: List<String>) -> Unit
) {
    navigation(startDestination = AuthRoutes.SPLASH, route = AuthRoutes.GRAPH) {

        composable(AuthRoutes.SPLASH) {
            SplashScreen(
                onSesionActiva = { roles -> onNavegarARolHome(roles) },
                onSinSesion = {
                    navController.navigate(AuthRoutes.LOGIN) {
                        popUpTo(AuthRoutes.SPLASH) { inclusive = true }
                    }
                }
            )
        }

        composable(AuthRoutes.LOGIN) {
            LoginScreen(
                onLoginSuccess = { roles -> onNavegarARolHome(roles) },
                onIrARegistro = { navController.navigate(AuthRoutes.REGISTER) }
            )
        }

        composable(AuthRoutes.REGISTER) {
            RegisterScreen(
                onVolverALogin = { navController.popBackStack() }
            )
        }
    }
}