package com.example.cunamas.feature.cocina.presentation.consultarAsistencia.historialAsistencia

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.List
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.cunamas.core.auth.domain.Role
import com.example.cunamas.core.ui.components.RoleScaffold
import com.example.cunamas.core.ui.components.WelcomeHeader
import com.example.cunamas.core.util.CalendarioDialog
import org.koin.compose.viewmodel.koinViewModel
import org.koin.core.parameter.parametersOf

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CocinaAsistenciaScreen(
    idServicioAlimentario: Int,
    nombreModulo: String,
    navController: NavController,
    viewModel: CocinaAsistenciaViewModel = koinViewModel(
        parameters = { parametersOf(idServicioAlimentario) }
    )
) {
    val usuario by viewModel.sessionManager.currentUser.collectAsState()
    val rolActivo = usuario?.rolPrincipal ?: Role.DESCONOCIDO

    val fecha by viewModel.fecha.collectAsState()
    val correlativo by viewModel.correlativo.collectAsState()
    val asistencia by viewModel.asistencia.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    var mostrarDatePicker by remember { mutableStateOf(false) }

    var localesExpandidos by remember { mutableStateOf(setOf<Int>()) }
    var modulosExpandidos by remember { mutableStateOf(setOf<Int>()) }
    var mostrarTotales by remember { mutableStateOf(true) }

    RoleScaffold(
        role = rolActivo,
        rutaActual = "cocina_resumen_asistencia",
        navController = navController
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            WelcomeHeader(nombreUsuario = usuario?.nombre ?: "") {
                IconButton(onClick = { navController.popBackStack() }) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = asistencia?.servicioAlimentario ?: nombreModulo,
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.padding(horizontal = 16.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedButton(
                onClick = { mostrarDatePicker = true },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
            ) {
                Icon(Icons.Filled.DateRange, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text(fecha)
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
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

            Spacer(modifier = Modifier.height(16.dp))

            if (isLoading) {
                Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(Modifier.padding(16.dp))
                }
            } else {
                val locales = asistencia?.locales ?: emptyList()
                val totales = asistencia?.totales ?: emptyList()

                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    if (totales.isNotEmpty()) {
                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(
                                    containerColor = MaterialTheme.colorScheme.tertiaryContainer
                                ),
                                onClick = { mostrarTotales = !mostrarTotales }
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(Icons.AutoMirrored.Filled.List, contentDescription = null)
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Text(
                                                text = "Totales del Servicio",
                                                style = MaterialTheme.typography.titleMedium,
                                                fontWeight = FontWeight.Bold
                                            )
                                        }
                                        Icon(
                                            imageVector = if (mostrarTotales) Icons.Filled.KeyboardArrowUp else Icons.Filled.KeyboardArrowDown,
                                            contentDescription = null
                                        )
                                    }

                                    if (mostrarTotales) {
                                        Spacer(modifier = Modifier.height(12.dp))
                                        totales.forEach { total ->
                                            Row(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .padding(vertical = 4.dp),
                                                horizontalArrangement = Arrangement.SpaceBetween
                                            ) {
                                                Text(
                                                    text = formatCategoria(total.categoria),
                                                    style = MaterialTheme.typography.bodyMedium,
                                                    fontWeight = FontWeight.Medium
                                                )
                                                Text(
                                                    text = total.cantidad.toString(),
                                                    style = MaterialTheme.typography.bodyLarge,
                                                    fontWeight = FontWeight.Bold,
                                                    color = MaterialTheme.colorScheme.primary
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (locales.isEmpty()) {
                        item {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 32.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "No hay registros de asistencia por locales",
                                    style = MaterialTheme.typography.bodyLarge
                                )
                            }
                        }
                    } else {
                        items(locales, key = { it.idLocal }) { local ->
                            val esLocalExpandido = localesExpandidos.contains(local.idLocal)

                            Column {
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = CardDefaults.cardColors(
                                        containerColor = MaterialTheme.colorScheme.primaryContainer
                                    ),
                                    onClick = {
                                        localesExpandidos = if (esLocalExpandido) {
                                            localesExpandidos - local.idLocal
                                        } else {
                                            localesExpandidos + local.idLocal
                                        }
                                    }
                                ) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(16.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Row(verticalAlignment = Alignment.CenterVertically) {
                                            Icon(Icons.Filled.Business, contentDescription = null)
                                            Spacer(modifier = Modifier.width(8.dp))
                                            Text(
                                                text = local.nombreLocal,
                                                style = MaterialTheme.typography.titleMedium
                                            )
                                        }
                                        Icon(
                                            imageVector = if (esLocalExpandido) Icons.Filled.KeyboardArrowUp else Icons.Filled.KeyboardArrowDown,
                                            contentDescription = null
                                        )
                                    }
                                }

                                if (esLocalExpandido) {
                                    Spacer(modifier = Modifier.height(8.dp))
                                    local.modulos.forEach { modulo ->
                                        val esModuloExpandido = modulosExpandidos.contains(modulo.idModulo)

                                        Card(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .padding(start = 16.dp, top = 4.dp, bottom = 4.dp),
                                            colors = CardDefaults.cardColors(
                                                containerColor = MaterialTheme.colorScheme.surfaceVariant
                                            ),
                                            onClick = {
                                                modulosExpandidos = if (esModuloExpandido) {
                                                    modulosExpandidos - modulo.idModulo
                                                } else {
                                                    modulosExpandidos + modulo.idModulo
                                                }
                                            }
                                        ) {
                                            Column(modifier = Modifier.padding(12.dp)) {
                                                Row(
                                                    modifier = Modifier.fillMaxWidth(),
                                                    horizontalArrangement = Arrangement.SpaceBetween,
                                                    verticalAlignment = Alignment.CenterVertically
                                                ) {
                                                    Text(
                                                        text = modulo.nombreModulo,
                                                        style = MaterialTheme.typography.titleSmall
                                                    )
                                                    Icon(
                                                        imageVector = if (esModuloExpandido) Icons.Filled.KeyboardArrowUp else Icons.Filled.KeyboardArrowDown,
                                                        contentDescription = null
                                                    )
                                                }

                                                if (esModuloExpandido) {
                                                    Spacer(modifier = Modifier.height(8.dp))
                                                    modulo.asistencia.forEach { itemAsistencia ->
                                                        Row(
                                                            modifier = Modifier
                                                                .fillMaxWidth()
                                                                .padding(vertical = 4.dp),
                                                            horizontalArrangement = Arrangement.SpaceBetween
                                                        ) {
                                                            Text(
                                                                text = formatCategoria(itemAsistencia.categoria),
                                                                style = MaterialTheme.typography.bodyMedium
                                                            )
                                                            Text(
                                                                text = itemAsistencia.cantidad.toString(),
                                                                style = MaterialTheme.typography.bodyMedium
                                                            )
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (mostrarDatePicker) {
        val partes = fecha.split("-")
        val anioInicial = partes.getOrNull(0)?.toIntOrNull() ?: 2026
        val mesInicial = partes.getOrNull(1)?.toIntOrNull() ?: 1
        val diaInicial = partes.getOrNull(2)?.toIntOrNull() ?: 1

        CalendarioDialog(
            anioInicial = anioInicial,
            mesInicial = mesInicial,
            diaInicial = diaInicial,
            onConfirmar = { nuevaFecha ->
                viewModel.onFechaChange(nuevaFecha)
                mostrarDatePicker = false
            },
            onCancelar = { mostrarDatePicker = false }
        )
    }
}

private fun formatCategoria(categoria: String): String {
    return if (categoria.contains("Actor Comunal", ignoreCase = true)) {
        categoria
    } else {
        "Niños ${categoria.trim()}"
    }
}