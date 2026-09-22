package com.example.cunamas.feature.cocina.presentation.consultarAsistencia.locales

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
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.cunamas.core.auth.domain.Role
import com.example.cunamas.core.common.Local
import com.example.cunamas.core.ui.components.BotonVolver
import com.example.cunamas.core.ui.components.RoleScaffold
import com.example.cunamas.core.ui.components.WelcomeHeader
import org.koin.compose.viewmodel.koinViewModel
import org.koin.core.parameter.parametersOf

@Composable
fun CocinaLocalesScreen(
    idLocal: Int, // O idCentro, dependiendo de cómo manejes el parámetro que viene de centros alimentarios
    navController: NavController,
    viewModel: CocinaLocalesViewModel = koinViewModel(
        parameters = { parametersOf(idLocal) } // 👈 Inyecta el ID recibido por la ruta usando Koin
    )
) {
    val usuario by viewModel.sessionManager.currentUser.collectAsState()
    val rolActivo = usuario?.rolPrincipal ?: Role.DESCONOCIDO

    val items by viewModel.items.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val listState = rememberLazyListState()

    RoleScaffold(
        role = rolActivo,
        rutaActual = "cocina_locales",
        navController = navController
        // Nota: Se omite el FloatingActionButton de creación, ya que las socias de cocina solo consultan locales y módulos.
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            WelcomeHeader(
                nombreUsuario = usuario?.nombre ?: "",
            ) {
                BotonVolver(onClick = { navController.popBackStack() })
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 🏷️ TÍTULO
            Text(
                text = "Locales",
                style = MaterialTheme.typography.titleLarge,
                textAlign = TextAlign.Center,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            )

            Spacer(modifier = Modifier.height(8.dp))

            LazyColumn(state = listState, modifier = Modifier.weight(1f)) {
                items(items) { local ->
                    CocinaLocalItem(
                        local = local,
                        onClick = {
                            // 🚀 Navega a la siguiente pantalla (ej. módulos de cocina) pasando el ID del local
                            navController.navigate("cocina_modulos/${local.id}")
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
private fun CocinaLocalItem(
    local: Local,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp)
            .clickable { onClick() }
    ) {
        Column(Modifier.padding(12.dp)) {
            Text(local.nombre, style = MaterialTheme.typography.titleMedium)
            Text(local.direccion, style = MaterialTheme.typography.bodyMedium)
            Text(local.servicioAlimentario, style = MaterialTheme.typography.bodySmall)
        }
    }
}