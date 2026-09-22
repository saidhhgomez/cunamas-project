package com.example.cunamas.feature.cocina.presentation.home

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.cunamas.core.auth.domain.Role
import com.example.cunamas.core.navigation.AuthRoutes
import com.example.cunamas.core.ui.components.RoleScaffold
import com.example.cunamas.core.ui.components.WelcomeHeader
import org.koin.compose.viewmodel.koinViewModel // 👈 Importación correcta de Koin para Compose

@Composable
fun SociaCocinaHomeScreen(
    navController: NavController,
    viewModel: SociaCocinaHomeViewModel = koinViewModel() // 👈 Koin se encarga de todo por detrás
) {
    val usuario by viewModel.sessionManager.currentUser.collectAsState()
    val rolActivo = usuario?.rolPrincipal ?: Role.DESCONOCIDO

    RoleScaffold(
        role = rolActivo,
        rutaActual = "socia_cocina_home",
        navController = navController
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            item {
                WelcomeHeader(
                    nombreUsuario = usuario?.nombre ?: ""
                ) {
                    IconButton(onClick = {
                        viewModel.cerrarSesion()
                        navController.navigate(AuthRoutes.LOGIN) {
                            popUpTo(0) { inclusive = true }
                        }
                    }) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ExitToApp,
                            contentDescription = "Cerrar sesión",
                            tint = Color.Red
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                Text(
                    text = "Resumen detallado",
                    style = MaterialTheme.typography.titleLarge,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                )

                Spacer(modifier = Modifier.height(16.dp))
            }

            item {
                OpcionMenuCard(
                    titulo = "Consultar Asistencia",
                    descripcion = "Ver y registrar la asistencia diaria del módulo",
                    onClick = { navController.navigate("cocina_centro_alimentario") }
                )
            }

            item {
                Spacer(modifier = Modifier.height(12.dp))
                OpcionMenuCard(
                    titulo = "Resumen Asistencia",
                    descripcion = "Visualizar reportes y estadísticas acumuladas",
                    onClick = {
                        navController.navigate("resumen_asistencia")
                    }
                )
            }

            item {
                Spacer(modifier = Modifier.height(12.dp))
                OpcionMenuCard(
                    titulo = "Reporte PDF",
                    descripcion = "Generar y descargar el reporte del servicio alimentario",
                    onClick = {
                        navController.navigate("cocina_reporte")
                    }
                )
            }

            item {
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

@Composable
private fun OpcionMenuCard(
    titulo: String,
    descripcion: String,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 4.dp)
            .clickable { onClick() },
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            horizontalAlignment = Alignment.Start
        ) {
            Text(
                text = titulo,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = descripcion,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}