package com.example.cunamas.feature.madre.navigation

import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavType
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import androidx.navigation.navigation
import androidx.savedstate.read
import com.example.cunamas.core.auth.domain.RoleGroup
import com.example.cunamas.core.navigation.RoleGuard
import com.example.cunamas.core.session.SessionManager
import com.example.cunamas.feature.madre.presentation.home.MadreHomeScreen
import com.example.cunamas.feature.madre.presentation.modulo.MadreModulosScreen
import com.example.cunamas.feature.madre.presentation.asistencia.MadreAsistenciaScreen
import io.ktor.http.decodeURLQueryComponent

fun NavGraphBuilder.madreNavGraph(
    navController: NavController,
    sessionManager: SessionManager,
    onAccesoDenegado: () -> Unit
) {
    navigation(
        startDestination = "madre_home",
        route = "madre_graph"
    ) {
        composable("madre_home") {
            RoleGuard(
                requiredGroup = RoleGroup.MADRES,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                MadreHomeScreen(navController = navController)
            }
        }

        composable(
            route = "madre_modulos/{idLocal}",
            arguments = listOf(navArgument("idLocal") { type = NavType.IntType })
        ) { backStackEntry ->
            val idLocal = backStackEntry.arguments?.read {
                if (contains("idLocal")) getInt("idLocal") else 0
            } ?: 0
            RoleGuard(
                requiredGroup = RoleGroup.MADRES,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                MadreModulosScreen(idLocal = idLocal, navController = navController)
            }
        }

        composable(
            route = "madre_asistencia/{idModulo}/{nombreModulo}",
            arguments = listOf(
                navArgument("idModulo") { type = NavType.IntType },
                navArgument("nombreModulo") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val args = backStackEntry.arguments
            val idModulo = args?.read {
                if (contains("idModulo")) getInt("idModulo") else 0
            } ?: 0
            val nombreModuloRaw = args?.read {
                if (contains("nombreModulo")) getString("nombreModulo") else ""
            } ?: ""
            val nombreModulo = nombreModuloRaw.decodeURLQueryComponent()

            RoleGuard(
                requiredGroup = RoleGroup.MADRES,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                MadreAsistenciaScreen(
                    idModulo = idModulo,
                    nombreModulo = nombreModulo,
                    navController = navController
                )
            }
        }
    }
}
