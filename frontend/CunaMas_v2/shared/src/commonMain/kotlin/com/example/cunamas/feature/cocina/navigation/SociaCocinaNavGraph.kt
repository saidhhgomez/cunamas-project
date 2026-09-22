package com.example.cunamas.feature.cocina.navigation

import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavType
import androidx.navigation.compose.navigation
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import androidx.savedstate.read
import com.example.cunamas.core.auth.domain.RoleGroup
import com.example.cunamas.core.navigation.RoleGuard
import com.example.cunamas.core.session.SessionManager
import com.example.cunamas.feature.cocina.presentation.CocinaCalculadora.CocinaCalculadoraCategoriasScreen
import com.example.cunamas.feature.cocina.presentation.CocinaCalculadora.CocinaCalculadoraPreparacionesScreen
import com.example.cunamas.feature.cocina.presentation.CocinaCalculadora.CocinaCalculadoraScreen
import com.example.cunamas.feature.cocina.presentation.CocinaCalculadora.CocinaIA.CocinaIAScreen
import com.example.cunamas.feature.cocina.presentation.ResumenAsistencia.ResumenAsistenciaScreen
import com.example.cunamas.feature.cocina.presentation.reporte.CocinaReporteScreen
import com.example.cunamas.feature.cocina.presentation.consultarAsistencia.centroAlimentario.CocinaCentroAlimentarioScreen
import com.example.cunamas.feature.cocina.presentation.consultarAsistencia.locales.CocinaLocalesScreen
import com.example.cunamas.feature.cocina.presentation.consultarAsistencia.modulo.CocinaModulosScreen
import com.example.cunamas.feature.cocina.presentation.consultarAsistencia.historialAsistencia.CocinaAsistenciaScreen
import com.example.cunamas.feature.cocina.presentation.home.SociaCocinaHomeScreen
import io.ktor.http.decodeURLQueryComponent
import org.koin.compose.viewmodel.koinViewModel

fun NavGraphBuilder.sociaCocinaNavGraph(
    navController: NavController,
    sessionManager: SessionManager,
    onAccesoDenegado: () -> Unit
) {
    navigation(
        startDestination = "socia_cocina_home",
        route = "cocina_graph"
    ) {
        composable("socia_cocina_home") {
            RoleGuard(
                requiredGroup = RoleGroup.COCINA,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                SociaCocinaHomeScreen(navController = navController)
            }
        }

        // 1. Pantalla de listado de centros alimentarios para cocina
        composable("cocina_centro_alimentario") {
            RoleGuard(
                requiredGroup = RoleGroup.COCINA,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                CocinaCentroAlimentarioScreen(navController = navController)
            }
        }

        // 2. Pantalla de Locales de Cocina
        composable(route = "cocina_locales/{centroId}") { backStackEntry ->
            val centroIdStr = backStackEntry.savedStateHandle.get<String>("centroId") ?: "0"
            val centroId = centroIdStr.toIntOrNull() ?: 0

            RoleGuard(
                requiredGroup = RoleGroup.COCINA,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                CocinaLocalesScreen(
                    idLocal = centroId,
                    navController = navController
                )
            }
        }

        // 3. Pantalla de Módulos
        composable(route = "cocina_modulos/{idLocal}") { backStackEntry ->
            val idLocalStr = backStackEntry.savedStateHandle.get<String>("idLocal") ?: "0"
            val idLocal = idLocalStr.toIntOrNull() ?: 0

            RoleGuard(
                requiredGroup = RoleGroup.COCINA,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                CocinaModulosScreen(
                    idLocal = idLocal,
                    navController = navController
                )
            }
        }

        composable(
            route = "cocina_asistencia/{idModulo}/{nombreModulo}",
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
                requiredGroup = RoleGroup.COCINA,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                CocinaAsistenciaScreen(
                    idModulo = idModulo,
                    nombreModulo = nombreModulo,
                    navController = navController
                )
            }
        }



        composable(route = "resumen_asistencia") {
            RoleGuard(
                requiredGroup = RoleGroup.COCINA,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                ResumenAsistenciaScreen(
                    navController = navController
                )
            }
        }

        // --- CALCULADORA COCINA ---
        composable("cocina_calculadora_categorias") {
            RoleGuard(
                requiredGroup = RoleGroup.COCINA,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                CocinaCalculadoraCategoriasScreen(navController = navController)
            }
        }

        composable(
            route = "cocina_calculadora_preparaciones/{idCategoria}",
            arguments = listOf(navArgument("idCategoria") { type = NavType.IntType })
        ) { backStackEntry ->
            val idCategoria = backStackEntry.arguments?.read {
                if (contains("idCategoria")) getInt("idCategoria") else 0
            } ?: 0
            RoleGuard(
                requiredGroup = RoleGroup.COCINA,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                CocinaCalculadoraPreparacionesScreen(
                    idCategoria = idCategoria,
                    navController = navController
                )
            }
        }

        composable(
            route = "cocina_calculadora_dosificadora/{idCategoria}/{idPreparacion}",
            arguments = listOf(
                navArgument("idCategoria") { type = NavType.IntType },
                navArgument("idPreparacion") { type = NavType.IntType }
            )
        ) { backStackEntry ->
            val args = backStackEntry.arguments
            val idCategoria = args?.read {
                if (contains("idCategoria")) getInt("idCategoria") else 0
            } ?: 0
            val idPreparacion = args?.read {
                if (contains("idPreparacion")) getInt("idPreparacion") else 0
            } ?: 0

            RoleGuard(
                requiredGroup = RoleGroup.COCINA,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                CocinaCalculadoraScreen(
                    idCategoria = idCategoria,
                    idPreparacion = idPreparacion,
                    navController = navController,
                    viewModel = koinViewModel()
                )
            }
        }

        composable(
            route = "cocina_ia/{jsonResumen}",
            arguments = listOf(navArgument("jsonResumen") { type = NavType.StringType })
        ) { backStackEntry ->
            val jsonResumen = backStackEntry.arguments?.read {
                if (contains("jsonResumen")) getString("jsonResumen") else ""
            } ?: ""
            RoleGuard(
                requiredGroup = RoleGroup.COCINA,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                CocinaIAScreen(
                    jsonResumen = jsonResumen,
                    navController = navController
                )
            }
        }

        composable(route = "cocina_reporte") {
            RoleGuard(
                requiredGroup = RoleGroup.COCINA,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                CocinaReporteScreen(navController = navController)
            }
        }
    }
}