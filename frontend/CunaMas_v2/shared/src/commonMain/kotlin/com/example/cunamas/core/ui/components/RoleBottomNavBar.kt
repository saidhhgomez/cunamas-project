package com.example.cunamas.core.ui.components

import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavController
import com.example.cunamas.core.auth.domain.Role

data class ItemMenu(
    val label: String,
    val ruta: String,
    val icono: androidx.compose.ui.graphics.vector.ImageVector
)

fun obtenerMenuParaRol(role: Role): List<ItemMenu> {
    return when (role) {
        Role.ADMINISTRADOR, Role.ASISTENTE_TECNICO, Role.EXPERTA_NUTRICION -> listOf(
            ItemMenu("Inicio", "gestion_home", Icons.Default.Home),
            ItemMenu("Gestion", "centro_alimentario", Icons.Default.CheckCircle),
            ItemMenu("Calculadora", "categorias_alimento", Icons.Default.Person)
        )
        Role.SOCIA_COCINA_TIPO1, Role.SOCIA_COCINA_TIPO2 -> listOf(
            ItemMenu("Inicio", "socia_cocina_home", Icons.Default.Home),
            ItemMenu("Calculadora", "cocina_calculadora_categorias", Icons.Default.Person)
        )
        Role.MADRE_CUIDADORA, Role.MADRE_GUIA -> listOf(
            ItemMenu("Inicio", "madre_home", Icons.Default.Home),
        )
        else -> listOf()
    }
}

@Composable
fun RoleBottomNavBar(
    navController: NavController,
    role: Role,
    rutaActual: String
) {
    val items = obtenerMenuParaRol(role)

    NavigationBar(
        modifier = Modifier.navigationBarsPadding()
    ) {
        items.forEach { item ->
            NavigationBarItem(
                selected = rutaActual == item.ruta,
                onClick = {
                    if (rutaActual != item.ruta) {
                        navController.navigate(item.ruta) {
                            launchSingleTop = true
                            popUpTo(item.ruta) { inclusive = true }
                        }
                    }
                },
                icon = { Icon(item.icono, contentDescription = item.label) },
                label = { Text(item.label) }
            )
        }
    }
}
