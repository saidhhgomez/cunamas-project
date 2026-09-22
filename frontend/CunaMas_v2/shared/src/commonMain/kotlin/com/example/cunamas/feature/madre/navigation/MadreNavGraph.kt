package com.example.cunamas.feature.madre.navigation

import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import androidx.navigation.navigation
import com.example.cunamas.core.auth.domain.RoleGroup
import com.example.cunamas.core.navigation.RoleGuard
import com.example.cunamas.core.session.SessionManager
import com.example.cunamas.feature.madre.presentation.home.MadreHomeScreen

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
                requiredGroup = RoleGroup.MADRE,
                sessionManager = sessionManager,
                onAccesoDenegado = onAccesoDenegado
            ) {
                MadreHomeScreen(navController = navController)
            }
        }
    }
}
