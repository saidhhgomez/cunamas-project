package com.example.cunamas.feature.madre.presentation.asistencia

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.cunamas.core.auth.domain.Role
import com.example.cunamas.core.ui.components.RoleScaffold
import org.koin.compose.viewmodel.koinViewModel
import org.koin.core.parameter.parametersOf

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MadreAsistenciaScreen(
    idModulo: Int,
    navController: NavController,
    viewModel: MadreAsistenciaViewModel = koinViewModel(parameters = { parametersOf(idModulo) })
) {
    val user by viewModel.sessionManager.currentUser.collectAsState()
    val rolActivo = user?.rolPrincipal ?: Role.DESCONOCIDO
    
    val correlativo by viewModel.correlativo.collectAsState()
    val categorias by viewModel.categorias.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()
    val exito by viewModel.exito.collectAsState()

    LaunchedEffect(exito) {
        if (exito) {
            navController.popBackStack()
        }
    }

    RoleScaffold(
        role = rolActivo,
        rutaActual = "madre_asistencia",
        navController = navController,
        topBar = {
            TopAppBar(
                title = { Text("Registrar Asistencia") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Regresar")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            Text(
                "Seleccione el turno:",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            
            Row(
                modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    selected = correlativo == 1,
                    onClick = { viewModel.onCorrelativoChange(1) },
                    label = { Text("Media Mañana") }
                )
                FilterChip(
                    selected = correlativo == 2,
                    onClick = { viewModel.onCorrelativoChange(2) },
                    label = { Text("Media Tarde") }
                )
            }

            if (correlativo != null) {
                Spacer(Modifier.height(16.dp))
                
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Categoría", fontWeight = FontWeight.Bold)
                            Text("Cantidad", fontWeight = FontWeight.Bold)
                        }
                        HorizontalDivider()
                    }

                    items(categorias) { cat ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = if (cat.id != 5) "Niños ${cat.nombre}" else cat.nombre,
                                style = MaterialTheme.typography.bodyLarge
                            )
                            
                            OutlinedTextField(
                                value = cat.cantidad,
                                onValueChange = { viewModel.onCantidadChange(cat.id, it) },
                                modifier = Modifier.width(80.dp),
                                singleLine = true,
                                keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(
                                    keyboardType = androidx.compose.ui.text.input.KeyboardType.Number
                                )
                            )
                        }
                    }
                }

                if (error != null) {
                    Text(
                        text = error!!,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.padding(vertical = 8.dp)
                    )
                }

                Button(
                    onClick = { viewModel.registrar() },
                    modifier = Modifier.fillMaxWidth().padding(top = 16.dp),
                    enabled = !isLoading
                ) {
                    if (isLoading) CircularProgressIndicator(modifier = Modifier.size(24.dp))
                    else Text("Enviar Asistencia")
                }
            } else {
                Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("Seleccione un turno para continuar", style = MaterialTheme.typography.bodyLarge)
                }
            }
        }
    }
}
