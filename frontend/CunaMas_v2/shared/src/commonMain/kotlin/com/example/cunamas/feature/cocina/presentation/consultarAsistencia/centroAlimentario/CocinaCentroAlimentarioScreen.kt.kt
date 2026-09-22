package com.example.cunamas.feature.cocina.presentation.consultarAsistencia.centroAlimentario

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
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
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
import org.koin.compose.viewmodel.koinViewModel

@Composable
fun CocinaCentroAlimentarioScreen(
    navController: NavController,
    viewModel: CocinaCentroAlimentarioViewModel = koinViewModel() // 👈 ViewModel dedicado para cocina
) {
    val usuario by viewModel.sessionManager.currentUser.collectAsState()
    val rolActivo = usuario?.rolPrincipal ?: Role.DESCONOCIDO

    val items by viewModel.items.collectAsState()
    val query by viewModel.query.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val listState = rememberLazyListState()

    RoleScaffold(
        role = rolActivo,
        rutaActual = "cocina_centro_alimentario", // 👈 Ruta propia del módulo
        navController = navController
        // Nota: Quitamos el FloatingActionButton de "Crear" porque las socias de cocina usualmente no crean centros, solo consultan.
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
                onValueChange = viewModel::onQueryChange,
                label = { Text("Buscar centro alimentario") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
            )

            Spacer(modifier = Modifier.height(8.dp))

            // 📋 Lista de centros alimentarios orientada a cocina
            LazyColumn(state = listState, modifier = Modifier.weight(1f)) {
                items(items) { centro ->
                    CocinaCentroAlimentarioItem(
                        centro = centro,
                        onClick = {
                            // 🚀 Navega a la siguiente pantalla pasando el ID del centro (ej. detalle o locales de cocina)
                            navController.navigate("cocina_locales/${centro.id}")
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
private fun CocinaCentroAlimentarioItem(
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