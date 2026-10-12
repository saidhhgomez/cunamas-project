package com.example.cunamas.feature.gestion.presentation.calculadora.calculadoraDosificadora
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Home
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.cunamas.core.auth.domain.Role
import com.example.cunamas.core.ui.components.BotonVolver
import com.example.cunamas.core.ui.components.RoleScaffold
import com.example.cunamas.core.util.CalendarioDialog
import com.example.cunamas.feature.gestion.domain.model.ResultadoCalculo
import com.example.cunamas.feature.gestion.domain.model.TotalCategoria

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CalculadoraDosificadoraScreen(
    idCategoria: Int,
    idPreparacion: Int,
    navController: NavController,
    viewModel: CalculadoraDosificadoraViewModel
) {
    val fecha by viewModel.fecha.collectAsState()
    val servicios by viewModel.serviciosDisponibles.collectAsState()
    val servicioSeleccionado by viewModel.servicioSeleccionado.collectAsState()
    val correlativo by viewModel.correlativo.collectAsState()
    val nombreServicio by viewModel.nombreServicio.collectAsState()
    val totales by viewModel.totales.collectAsState()
    val isLoadingResumen by viewModel.isLoadingResumen.collectAsState()
    val resultado by viewModel.resultado.collectAsState()
    val isCalculando by viewModel.isCalculando.collectAsState()
    val calculoVigente by viewModel.calculoVigente.collectAsState()

    var mostrarDatePicker by remember { mutableStateOf(false) }
    var mostrarDropdownServicio by remember { mutableStateOf(false) }

    val mostrarTotales = servicioSeleccionado != null && correlativo != null

    RoleScaffold(
        role = Role.ADMINISTRADOR,
        rutaActual = "categorias_alimento",
        navController = navController,
        isLoading = isCalculando,
        mostrarBottomBar = false,
        topBar = {
            Surface(
                color = Color(0xFFD4E157),
                contentColor = Color.White
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp)
                        .windowInsetsPadding(WindowInsets.statusBars),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    BotonVolver(onClick = { navController.popBackStack() })
                }
            }
        },
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = false,
                    onClick = {
                        navController.navigate("gestion_home") {
                            popUpTo("gestion_home") { inclusive = true }
                        }
                    },
                    icon = { Icon(Icons.Filled.Home, contentDescription = "Inicio") },
                    label = { Text("Inicio") }
                )
            }
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp)
        ) {
            item {
                Spacer(Modifier.height(16.dp))
                Text(
                    "Calculadora Dosificadora",
                    style = MaterialTheme.typography.headlineSmall,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(Modifier.height(20.dp))
            }
            item {
                OutlinedButton(
                    onClick = { mostrarDatePicker = true },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Filled.DateRange, contentDescription = null)
                    Spacer(Modifier.width(8.dp))
                    Text(fecha.ifEmpty { "Seleccionar Fecha" })
                }

                Spacer(Modifier.height(12.dp))
            }

            // 🏢 Filtro S.A (servicio alimentario)
            item {
                ExposedDropdownMenuBox(
                    expanded = mostrarDropdownServicio,
                    onExpandedChange = { mostrarDropdownServicio = it }
                ) {
                    OutlinedTextField(
                        value = servicioSeleccionado?.nombreCentro ?: "",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("S.A. (Servicio Alimentario)") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = mostrarDropdownServicio) },
                        modifier = Modifier
                            .menuAnchor()
                            .fillMaxWidth()
                    )
                    ExposedDropdownMenu(
                        expanded = mostrarDropdownServicio,
                        onDismissRequest = { mostrarDropdownServicio = false }
                    ) {
                        servicios.forEach { servicio ->
                            DropdownMenuItem(
                                text = { Text(servicio.nombreCentro) },
                                onClick = {
                                    viewModel.onServicioSeleccionado(servicio)
                                    mostrarDropdownServicio = false
                                }
                            )
                        }
                    }
                }

                Spacer(Modifier.height(12.dp))
            }

            // 🔘 Filtro correlativo
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilterChip(
                        selected = correlativo == 1,
                        onClick = { viewModel.onCorrelativoChange(1) },
                        label = { Text("Turno Mañana") }
                    )
                    FilterChip(
                        selected = correlativo == 2,
                        onClick = { viewModel.onCorrelativoChange(2) },
                        label = { Text("Turno Tarde") }
                    )
                }

                Spacer(Modifier.height(16.dp))
            }

            // 📊 Totales (solo cuando los 3 filtros están seleccionados)
            if (mostrarTotales) {
                if (isLoadingResumen) {
                    item {
                        Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                            CircularProgressIndicator(Modifier.padding(16.dp))
                        }
                    }
                } else {
                    item {
                        Text(
                            "Totales de $nombreServicio",
                            style = MaterialTheme.typography.titleMedium
                        )
                        Spacer(Modifier.height(8.dp))
                    }

                    items(totales) { total ->
                        TotalEditableRow(
                            total = total,
                            onCantidadChange = { nueva ->
                                viewModel.onCantidadEditada(total.id, nueva)
                            }
                        )
                    }

                    item {
                        Spacer(Modifier.height(16.dp))

                        Button(
                            onClick = { viewModel.calcular() },
                            modifier = Modifier.fillMaxWidth(),
                            enabled = !isCalculando && !calculoVigente
                        ) {
                            if (isCalculando) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(20.dp),
                                    color = MaterialTheme.colorScheme.onPrimary,
                                    strokeWidth = 2.dp
                                )
                            } else if (calculoVigente) {
                                Text("Calculado")
                            } else {
                                Text("Calcular")
                            }
                        }
                    }

                    resultado?.let { r ->
                        item {
                            Spacer(Modifier.height(16.dp))
                            ResultadoCard(r)
                            Spacer(Modifier.height(24.dp))
                        }
                    }
                }
            } else {
                item {
                    Spacer(Modifier.height(24.dp))
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

@Composable
private fun TotalEditableRow(
    total: TotalCategoria,
    onCantidadChange: (Int) -> Unit
) {
    var texto by remember(total.id) {
        mutableStateOf(if (total.cantidad == 0) "" else total.cantidad.toString())
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = formatCategoria(total.categoria),
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.weight(1f)
        )
        OutlinedTextField(
            value = texto,
            onValueChange = { nuevo ->
                val filtrado = nuevo.filter { it.isDigit() }.take(3)
                val normalizado = filtrado.trimStart('0')

                texto = when {
                    filtrado.isEmpty() -> ""
                    normalizado.isEmpty() -> "0"
                    else -> normalizado
                }

                onCantidadChange(texto.toIntOrNull() ?: 0)
            },
            keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(
                keyboardType = androidx.compose.ui.text.input.KeyboardType.Number
            ),
            modifier = Modifier.width(90.dp),
            singleLine = true
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

@Composable
private fun ResultadoCard(resultado: ResultadoCalculo) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = resultado.alimento,
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.align(Alignment.Start)
            )

            Spacer(Modifier.height(12.dp))

            Text(
                text = "${resultado.totalGramosOMl} ${resultado.unidad}",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.primary
            )
            Text(
                text = "Total requerido",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(Modifier.height(20.dp))

            Text(
                text = "Empaques sugeridos",
                style = MaterialTheme.typography.titleSmall,
                modifier = Modifier.align(Alignment.Start)
            )

            Spacer(Modifier.height(12.dp))

            val opciones = resultado.empaquesSugeridos.entries.toList()
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                opciones.forEachIndexed { index, (opcion, cantidad) ->
                    EmpaqueChip(
                        cantidad = cantidad,
                        descripcion = opcion,
                        modifier = Modifier.weight(1f)
                    )
                    if (index < opciones.lastIndex) {
                        Text(
                            text = "O",
                            style = MaterialTheme.typography.labelLarge,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun EmpaqueChip(
    cantidad: Int,
    descripcion: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.secondaryContainer
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp, horizontal = 6.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "$cantidad",
                style = MaterialTheme.typography.titleLarge,
                color = MaterialTheme.colorScheme.onSecondaryContainer
            )
            Spacer(Modifier.height(2.dp))
            Text(
                text = formatDescripcionEmpaque(descripcion),
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSecondaryContainer,
                textAlign = TextAlign.Center
            )
        }
    }
}

private fun formatDescripcionEmpaque(texto: String): String {
    return texto
        .replace("Opción en empaques de ", "")
        .trim()
}
