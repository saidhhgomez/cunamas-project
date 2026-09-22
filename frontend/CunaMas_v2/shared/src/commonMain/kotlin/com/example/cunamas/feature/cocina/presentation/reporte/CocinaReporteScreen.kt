package com.example.cunamas.feature.cocina.presentation.reporte

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.cunamas.core.auth.domain.Role
import com.example.cunamas.core.ui.components.BotonVolver
import com.example.cunamas.core.ui.components.RoleScaffold
import com.example.cunamas.core.ui.components.WelcomeHeader
import com.example.cunamas.core.util.CalendarioDialog
import org.koin.compose.viewmodel.koinViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CocinaReporteScreen(
    navController: NavController,
    viewModel: CocinaReporteViewModel = koinViewModel()
) {
    val usuario by viewModel.sessionManager.currentUser.collectAsState()
    val rolActivo = usuario?.rolPrincipal ?: Role.DESCONOCIDO

    val fecha by viewModel.fecha.collectAsState()
    val correlativo by viewModel.correlativo.collectAsState()
    val centroSeleccionado by viewModel.centroAlimentarioSeleccionado.collectAsState()
    val listaCentros by viewModel.listaCentros.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val isDownloading by viewModel.isDownloading.collectAsState()
    val error by viewModel.error.collectAsState()

    var mostrarDatePicker by remember { mutableStateOf(false) }
    var expandidoDropdownCentro by remember { mutableStateOf(false) }

    RoleScaffold(
        role = rolActivo,
        rutaActual = "cocina_reporte",
        navController = navController
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            WelcomeHeader(nombreUsuario = usuario?.nombre ?: "") {
                BotonVolver(onClick = { navController.popBackStack() })
            }

            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                item {
                    Text(
                        text = "Generar Reporte del Servicio",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                    )
                }

                // 🏢 Filtro Centro Alimentario (Obligatorio)
                item {
                    Text(
                        text = "Centro Alimentario *",
                        style = MaterialTheme.typography.titleMedium,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(Modifier.height(8.dp))
                    
                    Box(modifier = Modifier.fillMaxWidth()) {
                        val textoCentroActual = centroSeleccionado?.nombreCentro ?: "Seleccionar Centro"
                        OutlinedButton(
                            onClick = { expandidoDropdownCentro = true },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(text = textoCentroActual)
                            Spacer(modifier = Modifier.weight(1f))
                            Icon(
                                imageVector = if (expandidoDropdownCentro) Icons.Filled.KeyboardArrowUp else Icons.Filled.KeyboardArrowDown,
                                contentDescription = null
                            )
                        }

                        DropdownMenu(
                            expanded = expandidoDropdownCentro,
                            onDismissRequest = { expandidoDropdownCentro = false },
                            modifier = Modifier.fillMaxWidth(0.85f)
                        ) {
                            listaCentros.forEach { centro ->
                                DropdownMenuItem(
                                    text = { Text(centro.nombreCentro) },
                                    onClick = {
                                        viewModel.onCentroAlimentarioChange(centro)
                                        expandidoDropdownCentro = false
                                    }
                                )
                            }
                            if (isLoading) {
                                DropdownMenuItem(
                                    text = { CircularProgressIndicator(modifier = Modifier.size(24.dp)) },
                                    onClick = {}
                                )
                            }
                        }
                    }
                }

                // 📅 Filtro Fecha
                item {
                    Text(
                        text = "Fecha *",
                        style = MaterialTheme.typography.titleMedium,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(Modifier.height(8.dp))
                    OutlinedButton(
                        onClick = { mostrarDatePicker = true },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Filled.DateRange, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text(fecha.ifEmpty { "Seleccionar Fecha" })
                    }
                }

                // 🔘 Filtro Turno
                item {
                    Text(
                        text = "Turno *",
                        style = MaterialTheme.typography.titleMedium,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
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
                }

                item {
                    Spacer(Modifier.height(24.dp))
                    Button(
                        onClick = { viewModel.generarReporte() },
                        modifier = Modifier.fillMaxWidth().height(56.dp),
                        enabled = centroSeleccionado != null && fecha.isNotEmpty() && correlativo != null && !isDownloading,
                        shape = MaterialTheme.shapes.medium
                    ) {
                        if (isDownloading) {
                            CircularProgressIndicator(modifier = Modifier.size(24.dp), color = MaterialTheme.colorScheme.onPrimary)
                        } else {
                            Icon(Icons.Default.PictureAsPdf, contentDescription = null)
                            Spacer(Modifier.width(8.dp))
                            Text("Generar y Ver PDF")
                        }
                    }
                }

                if (error != null) {
                    item {
                        Text(
                            text = error!!,
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
            }
        }
    }

    if (mostrarDatePicker) {
        val partes = if (fecha.isNotEmpty()) fecha.split("-") else emptyList()
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
