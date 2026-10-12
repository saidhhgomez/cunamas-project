package com.example.cunamas.core.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.example.cunamas.core.auth.domain.RoleGroup
import com.example.cunamas.core.session.SessionManager

@Composable
fun RoleGuard(
    requiredGroup: RoleGroup,
    sessionManager: SessionManager,
    onAccesoDenegado: () -> Unit,
    content: @Composable () -> Unit
) {
    val usuario by sessionManager.currentUser.collectAsState()

    // Evaluamos el acceso asegurando que coincida algún rol
    val tieneAcceso = usuario?.roles?.any { it in requiredGroup.roles } == true

    LaunchedEffect(usuario) {
        // Redirige solo si el objeto usuario ya fue resuelto pero no posee permisos
        if (usuario != null && !tieneAcceso) {
            onAccesoDenegado()
        }
    }

    if (tieneAcceso) {
        content()
    }
}