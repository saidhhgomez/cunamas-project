package com.example.cunamas.feature.gestion.navigation

import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavType
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import androidx.navigation.navigation
import com.example.cunamas.core.auth.domain.RoleGroup
import com.example.cunamas.core.navigation.RoleGuard
import com.example.cunamas.core.session.SessionManager
import com.example.cunamas.feature.gestion.presentation.calculadora.calculadoraDosificadora.CalculadoraDosificadoraScreen
import com.example.cunamas.feature.gestion.presentation.calculadora.calculadoraDosificadora.CalculadoraDosificadoraViewModel
import com.example.cunamas.feature.gestion.presentation.calculadora.CategoriasAlimentoScreen
import com.example.cunamas.feature.gestion.presentation.calculadora.PreparacionScreen
import com.example.cunamas.feature.gestion.presentation.centroAlimentario.CentroAlimentarioScreen
import com.example.cunamas.feature.gestion.presentation.centroAlimentario.CentrosAlimentariosViewModel
import com.example.cunamas.feature.gestion.presentation.centroAlimentario.crearCentroAlimentario.CrearCentroAlimentarioScreen
import com.example.cunamas.feature.gestion.presentation.centroAlimentario.crearCentroAlimentario.CrearCentroAlimentarioViewModel
import com.example.cunamas.feature.gestion.presentation.detalle_usuario.DetalleUsuarioScreen
import com.example.cunamas.feature.gestion.presentation.detalle_usuario.DetalleUsuarioViewModel
import com.example.cunamas.feature.gestion.presentation.historialAsistencia.AsistenciaScreen
import com.example.cunamas.feature.gestion.presentation.historialAsistencia.AsistenciaViewModel
import com.example.cunamas.feature.gestion.presentation.home.GestionHomeScreen
import com.example.cunamas.feature.gestion.presentation.home.GestionHomeViewModel
import com.example.cunamas.feature.gestion.presentation.locales.LocalesScreen
import com.example.cunamas.feature.gestion.presentation.locales.LocalesViewModel
import com.example.cunamas.feature.gestion.presentation.locales.crearLocales.CrearLocalScreen
import com.example.cunamas.feature.gestion.presentation.locales.crearLocales.CrearLocalViewModel
import com.example.cunamas.feature.gestion.presentation.modulo.ModulosScreen
import com.example.cunamas.feature.gestion.presentation.modulo.ModulosViewModel
import com.example.cunamas.feature.gestion.presentation.modulo.crearModulo.CrearModuloScreen
import com.example.cunamas.feature.gestion.presentation.modulo.crearModulo.CrearModuloViewModel
import com.example.cunamas.feature.gestion.presentation.usuarios.crearLocales.AgregarCredencialesScreen
import com.example.cunamas.feature.gestion.presentation.usuarios.crearLocales.AgregarCredencialesViewModel
import com.example.cunamas.feature.gestion.presentation.usuarios_pendientes.UsuariosPendientesScreen
import com.example.cunamas.feature.gestion.presentation.usuarios_pendientes.UsuariosPendientesViewModel
import io.ktor.http.decodeURLQueryComponent
import org.koin.compose.viewmodel.koinViewModel
import org.koin.core.parameter.parametersOf
import androidx.savedstate.read


fun NavGraphBuilder.gestionNavGraph(
    navController: NavController,
    sessionManager: SessionManager,
    onAccesoDenegado: () -> Unit
) {
    navigation(startDestination = "gestion_home", route = "gestion_graph") {

        composable("gestion_home") {
            RoleGuard(
                requiredGroup = RoleGroup.GESTION,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                GestionHomeScreen(navController = navController)
            }
        }

        composable("usuarios_pendientes") {
            val vm: UsuariosPendientesViewModel = koinViewModel()
            RoleGuard(
                requiredGroup = RoleGroup.GESTION,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                UsuariosPendientesScreen(navController = navController, viewModel = vm)
            }
        }

        composable("centro_alimentario") {
            val homeVm: GestionHomeViewModel = koinViewModel()
            val centrosVm: CentrosAlimentariosViewModel = koinViewModel()
            RoleGuard(
                requiredGroup = RoleGroup.GESTION,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                CentroAlimentarioScreen(
                    navController = navController,
                    viewModel = homeVm,
                    centrosViewModel = centrosVm
                )
            }
        }

        composable(
            route = "detalle_usuario/{idPersona}",
            arguments = listOf(navArgument("idPersona") { type = NavType.IntType })
        ) { backStackEntry ->
            val idPersona = backStackEntry.arguments?.read {
                if (contains("idPersona")) getInt("idPersona") else 0
            } ?: 0
            val vm: DetalleUsuarioViewModel = koinViewModel()
            RoleGuard(
                requiredGroup = RoleGroup.GESTION,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                DetalleUsuarioScreen(idPersona = idPersona, navController = navController, viewModel = vm)
            }
        }

        composable(
            route = "locales/{idLocal}",
            arguments = listOf(navArgument("idLocal") { type = NavType.IntType })
        ) { backStackEntry ->
            val idLocal = backStackEntry.arguments?.read {
                if (contains("idLocal")) getInt("idLocal") else 0
            } ?: 0
            val vm: LocalesViewModel = koinViewModel { parametersOf(idLocal) }
            RoleGuard(
                requiredGroup = RoleGroup.GESTION,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                LocalesScreen(idLocal = idLocal, navController = navController, viewModel = vm)
            }
        }

        composable(
            route = "modulos/{idLocal}",
            arguments = listOf(navArgument("idLocal") { type = NavType.IntType })
        ) { backStackEntry ->
            val idLocal = backStackEntry.arguments?.read {
                if (contains("idLocal")) getInt("idLocal") else 0
            } ?: 0
            val vm: ModulosViewModel = koinViewModel { parametersOf(idLocal) }
            RoleGuard(
                requiredGroup = RoleGroup.GESTION,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                ModulosScreen(idLocal = idLocal, navController = navController, viewModel = vm)
            }
        }

        composable(
            route = "asistencia/{idModulo}/{nombreModulo}",
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
            val vm: AsistenciaViewModel = koinViewModel { parametersOf(idModulo) }
            RoleGuard(
                requiredGroup = RoleGroup.GESTION,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                AsistenciaScreen(
                    idModulo = idModulo,
                    nombreModulo = nombreModulo,
                    navController = navController,
                    viewModel = vm
                )
            }
        }

        composable("categorias_alimento") {
            RoleGuard(
                requiredGroup = RoleGroup.GESTION,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                CategoriasAlimentoScreen(navController = navController)
            }
        }

        composable(
            route = "preparacion/{idCategoria}",
            arguments = listOf(navArgument("idCategoria") { type = NavType.IntType })
        ) { backStackEntry ->
            val idCategoria = backStackEntry.arguments?.read {
                if (contains("idCategoria")) getInt("idCategoria") else 0
            } ?: 0
            RoleGuard(
                requiredGroup = RoleGroup.GESTION,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                PreparacionScreen(idCategoria = idCategoria, navController = navController)
            }
        }

        composable("agregar_credenciales") {
            val vm: AgregarCredencialesViewModel = koinViewModel()
            RoleGuard(
                requiredGroup = RoleGroup.GESTION,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                AgregarCredencialesScreen(navController = navController, viewModel = vm)
            }
        }

        composable(
            route = "calculadora_dosificadora/{idCategoria}/{idPreparacion}",
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
            val vm: CalculadoraDosificadoraViewModel = koinViewModel()
            RoleGuard(
                requiredGroup = RoleGroup.GESTION,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                CalculadoraDosificadoraScreen(
                    idCategoria = idCategoria,
                    idPreparacion = idPreparacion,
                    navController = navController,
                    viewModel = vm
                )
            }
        }

        composable("crear_centro_alimentario") {
            val vm: CrearCentroAlimentarioViewModel = koinViewModel()
            RoleGuard(
                requiredGroup = RoleGroup.GESTION,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                CrearCentroAlimentarioScreen(navController = navController, viewModel = vm)
            }
        }

        composable(
            route = "crear_local/{idCentroAlimentario}",
            arguments = listOf(
                navArgument("idCentroAlimentario") { type = NavType.IntType }
            )
        ) { backStackEntry ->
            val idCentroAlimentario = backStackEntry.arguments?.read {
                if (contains("idCentroAlimentario")) getInt("idCentroAlimentario") else 0
            } ?: 0
            val vm: CrearLocalViewModel = koinViewModel()
            RoleGuard(
                requiredGroup = RoleGroup.GESTION,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                CrearLocalScreen(
                    idCentroAlimentario = idCentroAlimentario,
                    navController = navController,
                    viewModel = vm
                )
            }
        }

        composable(
            route = "crear_modulo/{idLocal}",
            arguments = listOf(navArgument("idLocal") { type = NavType.IntType })
        ) { backStackEntry ->
            val idLocal = backStackEntry.arguments?.read {
                if (contains("idLocal")) getInt("idLocal") else 0
            } ?: 0
            val vm: CrearModuloViewModel = koinViewModel()
            RoleGuard(
                requiredGroup = RoleGroup.GESTION,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                CrearModuloScreen(
                    idLocal = idLocal,
                    navController = navController,
                    viewModel = vm
                )
            }
        }
    }
}
