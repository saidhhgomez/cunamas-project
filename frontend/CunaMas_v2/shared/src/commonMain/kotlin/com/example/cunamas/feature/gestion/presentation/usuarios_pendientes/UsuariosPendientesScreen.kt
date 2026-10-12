package com.example.cunamas.feature.gestion.presentation.usuarios_pendientes

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.cunamas.core.auth.domain.Role
import com.example.cunamas.core.ui.components.RoleScaffold


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UsuariosPendientesScreen(
    navController: NavController,
    viewModel: UsuariosPendientesViewModel
) {
    val state by viewModel.state.collectAsState()
    val usuario by viewModel.sessionManager.currentUser.collectAsState()
    val rolActivo = usuario?.rolPrincipal ?: Role.DESCONOCIDO

    LaunchedEffect(Unit) {
        viewModel.cargar()
    }

    RoleScaffold(
        role = rolActivo,
        rutaActual = "usuarios_pendientes",
        navController = navController,
        mostrarBottomBar = false,
        topBar = {
            TopAppBar(
                title = { Text("Aprobaciones") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Regresar")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFFD4E157),
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
                )
            )
        }
    ) { paddingValues ->
        when (val currentState = state) {
            is UsuariosPendientesState.Loading -> {
                Box(Modifier.fillMaxSize().padding(paddingValues), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            }
            is UsuariosPendientesState.Error -> {
                Box(Modifier.fillMaxSize().padding(paddingValues), contentAlignment = Alignment.Center) {
                    Text(currentState.mensaje)
                }
            }
            is UsuariosPendientesState.Listo -> {
                if (currentState.usuarios.isEmpty()) {
                    Box(Modifier.fillMaxSize().padding(paddingValues), contentAlignment = Alignment.Center) {
                        Text("No hay usuarios pendientes")
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(paddingValues)
                            .padding(16.dp)
                    ) {
                        items(currentState.usuarios) { usuarioPendiente ->
                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 6.dp)
                                    .clickable {
                                        navController.navigate("detalle_usuario/${usuarioPendiente.idPersona}")
                                    }
                            ) {
                                Column(Modifier.padding(12.dp)) {
                                    Text(usuarioPendiente.nombresCompletos, style = MaterialTheme.typography.titleMedium)
                                    Text("Doc: ${usuarioPendiente.numeroDocumento}", style = MaterialTheme.typography.bodySmall)
                                    Text(usuarioPendiente.correoElectronico, style = MaterialTheme.typography.bodySmall)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}