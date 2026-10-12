package com.example.cunamas.feature.gestion.presentation.centroAlimentario

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.cunamas.core.auth.domain.Role
import com.example.cunamas.core.common.CentroAlimentario
import com.example.cunamas.core.ui.components.BotonVolver
import com.example.cunamas.core.ui.components.RoleScaffold
import com.example.cunamas.core.ui.components.WelcomeHeader
import com.example.cunamas.feature.gestion.presentation.home.GestionHomeViewModel

@Composable
fun CentroAlimentarioScreen(
    navController: NavController,
    viewModel: GestionHomeViewModel,          // 👈 Recibido por parámetro, inyectado con Koin
    centrosViewModel: CentrosAlimentariosViewModel // 👈 Recibido por parámetro, inyectado con Koin
) {
    val usuario by viewModel.sessionManager.currentUser.collectAsState()
    val rolActivo = usuario?.rolPrincipal ?: Role.DESCONOCIDO

    val items by centrosViewModel.items.collectAsState()
    val query by centrosViewModel.query.collectAsState()
    val isLoading by centrosViewModel.isLoading.collectAsState()
    val listState = rememberLazyListState()

    // 🔄 Recarga automática al volver de crear un centro
    val savedStateHandle = navController.currentBackStackEntry?.savedStateHandle
    val centroCreado = savedStateHandle?.getStateFlow("centro_creado", false)?.collectAsState()

    LaunchedEffect(centroCreado?.value) {
        if (centroCreado?.value == true) {
            centrosViewModel.resetYBuscar("")
            savedStateHandle.set("centro_creado", false)
        }
    }

    RoleScaffold(
        role = rolActivo,
        rutaActual = "centro_alimentario",
        navController = navController,
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    // Navega directamente a la pantalla de creación al hacer clic
                    navController.navigate("crear_centro_alimentario")
                }
            ) {
                Icon(Icons.Filled.Add, contentDescription = "Agregar Centro Alimentario")
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

            // 🔍 Buscador
            OutlinedTextField(
                value = query,
                onValueChange = centrosViewModel::onQueryChange,
                label = { Text("Buscar por distrito") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
            )

            Spacer(modifier = Modifier.height(8.dp))

            // 📋 Lista de centros alimentarios
            LazyColumn(state = listState, modifier = Modifier.weight(1f)) {
                items(items) { centro ->
                    CentroAlimentarioItem(
                        centro = centro,
                        onClick = {
                            navController.navigate("locales/${centro.id}")
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
                            centrosViewModel.cargarMas()
                        }
                    }
            }
        }
    }
}

@Composable
private fun CentroAlimentarioItem(
    centro: CentroAlimentario,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp)
            .clickable { onClick() }
    ) {
        Column(Modifier.padding(12.dp)) {
            Text(centro.nombreCentro, style = MaterialTheme.typography.titleMedium)
            Text(centro.nombreComite, style = MaterialTheme.typography.bodyMedium)
            Text(centro.direccion, style = MaterialTheme.typography.bodySmall)
        }
    }
}