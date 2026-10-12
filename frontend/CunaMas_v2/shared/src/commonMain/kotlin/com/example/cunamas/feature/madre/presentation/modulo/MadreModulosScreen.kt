package com.example.cunamas.feature.madre.presentation.modulo

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.cunamas.core.auth.domain.Role
import com.example.cunamas.core.ui.components.BotonVolver
import com.example.cunamas.core.ui.components.RoleScaffold
import com.example.cunamas.core.ui.components.WelcomeHeader
import com.example.cunamas.core.util.encodeURLParam
import org.koin.compose.viewmodel.koinViewModel
import org.koin.core.parameter.parametersOf

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MadreModulosScreen(
    idLocal: Int,
    navController: NavController,
    viewModel: MadreModulosViewModel = koinViewModel(parameters = { parametersOf(idLocal) })
) {
    val user by viewModel.sessionManager.currentUser.collectAsState()
    val rolActivo = user?.rolPrincipal ?: Role.DESCONOCIDO
    val items by viewModel.items.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    RoleScaffold(
        role = rolActivo,
        rutaActual = "madre_modulos",
        navController = navController
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            WelcomeHeader(nombreUsuario = user?.nombre ?: "") {
                BotonVolver(onClick = { navController.popBackStack() })
            }

            Text(
                text = "Módulos del Local",
                style = MaterialTheme.typography.titleLarge,
                modifier = Modifier.padding(16.dp)
            )

            if (isLoading && items.isEmpty()) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            } else if (items.isEmpty()) {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No hay módulos registrados en este local.")
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(items) { modulo ->
                        ModuloItemMadre(modulo.nombre) {
                            val encodedNombre = modulo.nombre.encodeURLParam()
                            navController.navigate("madre_asistencia/${modulo.id}/$encodedNombre")
                        }
                    }
                    if (isLoading) {
                        item {
                            Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                                CircularProgressIndicator()
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ModuloItemMadre(nombre: String, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        elevation = CardDefaults.cardElevation(2.dp)
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = nombre, style = MaterialTheme.typography.titleMedium)
        }
    }
}
