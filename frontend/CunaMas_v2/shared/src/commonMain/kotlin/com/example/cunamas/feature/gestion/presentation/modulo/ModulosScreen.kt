package com.example.cunamas.feature.gestion.presentation.modulo

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.cunamas.core.auth.domain.Role
import com.example.cunamas.core.common.Modulo
import com.example.cunamas.core.ui.components.BotonVolver
import com.example.cunamas.core.ui.components.RoleScaffold
import com.example.cunamas.core.ui.components.WelcomeHeader
import com.example.cunamas.core.util.encodeURLParam

@Composable
fun ModulosScreen(
    idLocal: Int,
    navController: NavController,
    viewModel: ModulosViewModel // 👈 Recibido por parámetro, inyectado con Koin
) {
    val usuario by viewModel.sessionManager.currentUser.collectAsState()
    val rolActivo = usuario?.rolPrincipal ?: Role.DESCONOCIDO

    val items by viewModel.items.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val listState = rememberLazyListState()

    // Escuchar retorno de CrearModuloScreen
    val currentBackStackEntry = navController.currentBackStackEntry
    val moduloCreado = currentBackStackEntry
        ?.savedStateHandle
        ?.getStateFlow("modulo_creado", false)
        ?.collectAsState()

    LaunchedEffect(moduloCreado?.value) {
        if (moduloCreado?.value == true) {
            viewModel.recargar()
            currentBackStackEntry?.savedStateHandle?.set("modulo_creado", false)
        }
    }

    RoleScaffold(
        role = rolActivo,
        rutaActual = "modulos",
        navController = navController,
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    navController.navigate("crear_modulo/$idLocal")
                },
                containerColor = MaterialTheme.colorScheme.primaryContainer,
                contentColor = MaterialTheme.colorScheme.onPrimaryContainer
            ) {
                Icon(
                    imageVector = Icons.Filled.Add,
                    contentDescription = "Agregar Módulo"
                )
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            WelcomeHeader(
                nombreUsuario = usuario?.nombre ?: ""
            ) {
                BotonVolver(onClick = { navController.popBackStack() })
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Módulos",
                style = MaterialTheme.typography.titleLarge,
                textAlign = TextAlign.Center,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            )

            Spacer(modifier = Modifier.height(8.dp))

            LazyColumn(state = listState, modifier = Modifier.weight(1f)) {
                items(items) { modulo ->
                    ModuloItem(
                        modulo = modulo,
                        onClick = {
                            // 🌍 Codificación segura multiplataforma (evita java.net.URLEncoder)
                            // Si prefieres omitirlo o usar una función común, puedes asegurar el formato:
                            val nombreCodificado = modulo.nombre.encodeURLParam() // O formato limpio equivalente
                            navController.navigate("asistencia/${modulo.id}/$nombreCodificado")
                        }
                    )
                }
                item {
                    if (isLoading) {
                        Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator(Modifier.padding(16.dp))
                        }
                    }
                }
            }

            LaunchedEffect(listState) {
                snapshotFlow { listState.layoutInfo.visibleItemsInfo.lastOrNull()?.index }
                    .collect { lastVisible ->
                        if (lastVisible != null && lastVisible >= items.size - 3) {
                            viewModel.cargarMas()
                        }
                    }
            }
        }
    }
}

@Composable
private fun ModuloItem(
    modulo: Modulo,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp)
            .clickable { onClick() }
    ) {
        Column(Modifier.padding(12.dp)) {
            Text(modulo.nombre, style = MaterialTheme.typography.titleMedium)
        }
    }
}