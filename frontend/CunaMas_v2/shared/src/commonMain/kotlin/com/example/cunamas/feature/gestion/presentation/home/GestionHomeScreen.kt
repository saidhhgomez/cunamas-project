package com.example.cunamas.feature.gestion.presentation.home


import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.cunamas.core.auth.domain.Role
import com.example.cunamas.core.navigation.AuthRoutes
import com.example.cunamas.core.ui.components.RoleScaffold
import com.example.cunamas.core.ui.components.WelcomeHeader
import com.example.cunamas.feature.gestion.domain.model.UsuarioPendiente
import com.example.cunamas.feature.gestion.presentation.usuarios_pendientes.UsuariosPendientesState
import com.example.cunamas.feature.gestion.presentation.usuarios_pendientes.UsuariosPendientesViewModel
import org.koin.compose.viewmodel.koinViewModel

@Composable
fun GestionHomeScreen(
    navController: NavController,
    viewModel: GestionHomeViewModel = koinViewModel(),
    aprobacionesViewModel: UsuariosPendientesViewModel = koinViewModel() // 👈 Añadido valor por defecto con Koin para que no falle al llamarlo
) {
    val usuario by viewModel.sessionManager.currentUser.collectAsState()
    val rolActivo = usuario?.rolPrincipal ?: Role.DESCONOCIDO

    val aprobacionesState by aprobacionesViewModel.state.collectAsState()

    RoleScaffold(
        role = rolActivo,
        rutaActual = "gestion_home",
        navController = navController,
        floatingActionButton = {
            FloatingActionButton(onClick = { navController.navigate("agregar_credenciales") }) {
                Icon(Icons.Default.Add, contentDescription = "Agregar credenciales")
            }
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // 🔝 Header + botones de rol
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

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "Aprobaciones",
                    style = MaterialTheme.typography.titleMedium,
                    fontSize = 28.sp,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
                Spacer(modifier = Modifier.height(8.dp))
            }

            // ✅ Sección de aprobaciones (usuarios pendientes) embebida corregida con UsuariosPendientesState
            when (val currentState = aprobacionesState) {
                is UsuariosPendientesState.Loading -> {
                    item {
                        Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator(Modifier.padding(16.dp))
                        }
                    }
                }
                is UsuariosPendientesState.Error -> {
                    item {
                        Text(
                            text = currentState.mensaje,
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier.padding(horizontal = 16.dp)
                        )
                    }
                }
                is UsuariosPendientesState.Listo -> {
                    if (currentState.usuarios.isEmpty()) {
                        item {
                            Text(
                                text = "No hay usuarios pendientes",
                                style = MaterialTheme.typography.bodyMedium,
                                modifier = Modifier.padding(horizontal = 16.dp)
                            )
                        }
                    } else {
                        items(currentState.usuarios) { pendiente ->
                            UsuarioPendienteItem(
                                usuario = pendiente,
                                onClick = {
                                    navController.navigate("detalle_usuario/${pendiente.idPersona}")
                                }
                            )
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

@Composable
private fun UsuarioPendienteItem(
    usuario: UsuarioPendiente,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFEEEEEE))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = usuario.nombresCompletos,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF333333)
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    text = "Doc: ${usuario.numeroDocumento}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.Gray
                )
            }

            // Estado: Si es false está pendiente
            if (!usuario.estadoCuenta) {
                Surface(
                    color = Color(0xFFFF9800).copy(alpha = 0.1f),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = "Pendiente",
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        style = MaterialTheme.typography.labelMedium.copy(
                            color = Color(0xFFFF9800),
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp
                        )
                    )
                }
            }
        }
    }
}