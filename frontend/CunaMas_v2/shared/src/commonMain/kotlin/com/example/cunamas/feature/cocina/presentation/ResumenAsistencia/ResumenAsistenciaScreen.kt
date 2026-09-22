package com.example.cunamas.feature.cocina.presentation.ResumenAsistencia
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.cunamas.core.auth.domain.Role
import com.example.cunamas.core.ui.components.BotonVolver
import com.example.cunamas.core.ui.components.RoleScaffold
import com.example.cunamas.core.ui.components.WelcomeHeader
import com.example.cunamas.core.util.CalendarioDialog
import org.koin.compose.viewmodel.koinViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ResumenAsistenciaScreen(
    navController: NavController,
    viewModel: ResumenAsistenciaViewModel = koinViewModel()
) {
    val usuario by viewModel.sessionManager.currentUser.collectAsState()
    val rolActivo = usuario?.rolPrincipal ?: Role.DESCONOCIDO

    val fecha by viewModel.fecha.collectAsState()
    val correlativo by viewModel.correlativo.collectAsState()
    val centroSeleccionado by viewModel.centroAlimentarioSeleccionado.collectAsState()
    val listaCentros by viewModel.listaCentros.collectAsState()
    val asistencia by viewModel.asistencia.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    var mostrarDatePicker by remember { mutableStateOf(false) }
    var expandidoDropdownCentro by remember { mutableStateOf(false) }

    var localesExpandidos by remember { mutableStateOf(setOf<Int>()) }
    var modulosExpandidos by remember { mutableStateOf(setOf<Int>()) }

    RoleScaffold(
        role = rolActivo,
        rutaActual = "resumen_asistencia",
        navController = navController,
        isLoading = isLoading
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            WelcomeHeader(nombreUsuario = usuario?.nombre ?: "") {
                BotonVolver(onClick = { navController.popBackStack() })
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = asistencia?.servicioAlimentario ?: "Resumen de Asistencia",
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

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
            ) {
                val textoCentroActual = centroSeleccionado?.nombreCentro ?: "Todos los Centros Alimentarios"

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
                    modifier = Modifier.fillMaxWidth(0.9f)
                ) {
                    DropdownMenuItem(
                        text = { Text("Todos") },
                        onClick = {
                            viewModel.onCentroAlimentarioChange(null)
                            expandidoDropdownCentro = false
                        }
                    )
                    listaCentros.forEach { centro ->
                        DropdownMenuItem(
                            text = { Text(centro.nombreCentro) },
                            onClick = {
                                viewModel.onCentroAlimentarioChange(centro)
                                expandidoDropdownCentro = false
                            }
                        )
                    }
                }
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

                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    if (locales.isEmpty()) {
                        item {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 32.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "No hay registros de asistencia",
                                    style = MaterialTheme.typography.bodyLarge
                                )
                            }
                        }
                    } else {
                        items(locales, key = { it.idLocal }) { local ->
                            val esLocalExpandido = localesExpandidos.contains(local.idLocal)

                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(containerColor = Color.White),
                                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFEEEEEE))
                            ) {
                                Column {
                                    // Cabecera del Local (Teal)
                                    Surface(
                                        color = Color(0xFF006064),
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clickable {
                                                localesExpandidos = if (esLocalExpandido) {
                                                    localesExpandidos - local.idLocal
                                                } else {
                                                    localesExpandidos + local.idLocal
                                                }
                                            }
                                    ) {
                                        Row(
                                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Icon(
                                                Icons.Filled.Business,
                                                contentDescription = null,
                                                tint = Color.White,
                                                modifier = Modifier.size(20.dp)
                                            )
                                            Spacer(modifier = Modifier.width(12.dp))
                                            Text(
                                                text = local.nombreLocal,
                                                style = MaterialTheme.typography.titleMedium.copy(
                                                    color = Color.White,
                                                    fontWeight = FontWeight.Bold
                                                ),
                                                modifier = Modifier.weight(1f)
                                            )
                                            Icon(
                                                imageVector = if (esLocalExpandido) Icons.Filled.KeyboardArrowUp else Icons.Filled.KeyboardArrowDown,
                                                contentDescription = null,
                                                tint = Color.White
                                            )
                                        }
                                    }

                                    if (esLocalExpandido) {
                                        local.modulos.forEach { modulo ->
                                            val esModuloExpandido = modulosExpandidos.contains(modulo.idModulo)

                                            Column(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .padding(12.dp)
                                            ) {
                                                // Cabecera del Módulo (con barra amarilla)
                                                Row(
                                                    modifier = Modifier
                                                        .fillMaxWidth()
                                                        .clickable {
                                                            modulosExpandidos = if (esModuloExpandido) {
                                                                modulosExpandidos - modulo.idModulo
                                                            } else {
                                                                modulosExpandidos + modulo.idModulo
                                                            }
                                                        }
                                                        .padding(vertical = 8.dp),
                                                    verticalAlignment = Alignment.CenterVertically
                                                ) {
                                                    Box(
                                                        modifier = Modifier
                                                            .width(4.dp)
                                                            .height(18.dp)
                                                            .background(
                                                                Color(0xFFCDDC39),
                                                                RoundedCornerShape(2.dp)
                                                            )
                                                    )
                                                    Spacer(modifier = Modifier.width(8.dp))
                                                    Text(
                                                        text = modulo.nombreModulo,
                                                        style = MaterialTheme.typography.titleSmall.copy(
                                                            fontWeight = FontWeight.Bold,
                                                            color = Color(0xFF333333)
                                                        ),
                                                        modifier = Modifier.weight(1f)
                                                    )
                                                    Icon(
                                                        imageVector = if (esModuloExpandido) Icons.Filled.KeyboardArrowUp else Icons.Filled.KeyboardArrowDown,
                                                        contentDescription = null,
                                                        tint = Color.Gray,
                                                        modifier = Modifier.size(20.dp)
                                                    )
                                                }

                                                if (esModuloExpandido) {
                                                    Column(
                                                        modifier = Modifier
                                                            .fillMaxWidth()
                                                            .padding(start = 12.dp),
                                                        verticalArrangement = Arrangement.spacedBy(8.dp)
                                                    ) {
                                                        modulo.asistencia.forEach { itemAsistencia ->
                                                            ResumenRegistroItem(itemAsistencia.categoria, itemAsistencia.cantidad)
                                                        }
                                                    }
                                                }
                                            }
                                            if (local.modulos.last() != modulo) {
                                                HorizontalDivider(
                                                    modifier = Modifier.padding(horizontal = 16.dp),
                                                    thickness = 0.5.dp,
                                                    color = Color(0xFFEEEEEE)
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
private fun ResumenRegistroItem(categoria: String, cantidad: Int) {
    val color = getColorForResumenCategoria(categoria)
    
    Surface(
        color = Color(0xFFF8F9FA),
        shape = RoundedCornerShape(8.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .background(color, CircleShape)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = formatResumenCategoria(categoria),
                    style = MaterialTheme.typography.bodyMedium.copy(
                        color = Color(0xFF555555),
                        fontWeight = FontWeight.Medium
                    )
                )
            }

            Surface(
                color = Color.White,
                shape = RoundedCornerShape(6.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFE0E0E0)),
                modifier = Modifier.size(width = 44.dp, height = 28.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(
                        text = cantidad.toString(),
                        style = MaterialTheme.typography.bodyMedium.copy(
                            color = color,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    )
                }
            }
        }
    }
}

private fun getColorForResumenCategoria(categoria: String): Color {
    return when {
        categoria.contains("6-8", ignoreCase = true) -> Color(0xFF4CAF50) // Verde
        categoria.contains("9-11", ignoreCase = true) -> Color(0xFFE91E63) // Rosado
        categoria.contains("12-23", ignoreCase = true) -> Color(0xFFFFB300) // Amarillo
        categoria.contains("24-36", ignoreCase = true) -> Color(0xFF00ACC1) // Cian
        categoria.contains("Actor Comunal", ignoreCase = true) -> Color(0xFF9C27B0) // Morado
        else -> Color(0xFF757575)
    }
}

private fun formatResumenCategoria(categoria: String): String {
    return if (categoria.contains("Actor Comunal", ignoreCase = true)) {
        categoria
    } else {
        "Niños ${categoria.trim()}"
    }
}