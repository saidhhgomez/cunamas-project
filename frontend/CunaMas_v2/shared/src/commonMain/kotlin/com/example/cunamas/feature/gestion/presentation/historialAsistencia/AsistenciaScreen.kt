package com.example.cunamas.feature.gestion.presentation.historialAsistencia
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
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
import com.example.cunamas.core.util.millisAFechaString
import com.example.cunamas.core.util.obtenerMillisDelMesActual
import com.example.cunamas.feature.gestion.domain.model.RegistroCategoria
// 🌍 Importaciones Multiplataforma con kotlinx-datetime
import kotlinx.datetime.Instant
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AsistenciaScreen(
    idModulo: Int,
    nombreModulo: String,
    navController: NavController,
    viewModel: AsistenciaViewModel
) {
    val usuario by viewModel.sessionManager.currentUser.collectAsState()
    val rolActivo = usuario?.rolPrincipal ?: Role.DESCONOCIDO

    val fecha by viewModel.fecha.collectAsState()
    val correlativo by viewModel.correlativo.collectAsState()
    val asistencia by viewModel.asistencia.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    var mostrarDatePicker by remember { mutableStateOf(false) }


    RoleScaffold(
        role = rolActivo,
        rutaActual = "asistencia",
        navController = navController,
        isLoading = isLoading
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

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = nombreModulo,
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.padding(horizontal = 16.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // 📅 Selector de fecha
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

            // 🔘 Filtro Mañana / Tarde
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
                val registrosManana = asistencia?.registroManana ?: emptyList()
                val registrosTarde = asistencia?.registroTarde ?: emptyList()

                val mostrarManana = correlativo == null || correlativo == 1
                val mostrarTarde = correlativo == null || correlativo == 2

                val todoVacio =
                    (mostrarManana && !mostrarTarde && registrosManana.isEmpty()) ||
                            (mostrarTarde && !mostrarManana && registrosTarde.isEmpty()) ||
                            (mostrarManana && mostrarTarde && registrosManana.isEmpty() && registrosTarde.isEmpty())

                if (todoVacio) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No hay asistencia",
                            style = MaterialTheme.typography.bodyLarge
                        )
                    }
                } else {
                    var expandidoManana by remember { mutableStateOf(true) }
                    var expandidoTarde by remember { mutableStateOf(true) }

                    LazyColumn(modifier = Modifier.weight(1f)) {
                        if (mostrarManana) {
                            item {
                                TurnoHeader(
                                    titulo = "Turno Mañana",
                                    expandido = expandidoManana,
                                    onToggle = { expandidoManana = !expandidoManana }
                                )
                            }
                            if (expandidoManana) {
                                if (registrosManana.isEmpty()) {
                                    item {
                                        Text(
                                            text = "No hay asistencia",
                                            style = MaterialTheme.typography.bodyMedium,
                                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                                        )
                                    }
                                } else {
                                    items(registrosManana) { registro ->
                                        RegistroItem(registro)
                                    }
                                }
                            }
                        }

                        if (mostrarTarde) {
                            item {
                                TurnoHeader(
                                    titulo = "Turno Tarde",
                                    expandido = expandidoTarde,
                                    onToggle = { expandidoTarde = !expandidoTarde }
                                )
                            }
                            if (expandidoTarde) {
                                if (registrosTarde.isEmpty()) {
                                    item {
                                        Text(
                                            text = "No hay asistencia",
                                            style = MaterialTheme.typography.bodyMedium,
                                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                                        )
                                    }
                                } else {
                                    items(registrosTarde) { registro ->
                                        RegistroItem(registro)
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
private fun TurnoHeader(
    titulo: String,
    expandido: Boolean,
    onToggle: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onToggle() }
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(text = titulo, style = MaterialTheme.typography.titleMedium)
        Icon(
            imageVector = if (expandido) Icons.Filled.KeyboardArrowUp else Icons.Filled.KeyboardArrowDown,
            contentDescription = if (expandido) "Contraer" else "Expandir"
        )
    }
}

@Composable
private fun RegistroItem(registro: RegistroCategoria) {
    val colorCategoria = getColorForCategoria(registro.categoria)

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 6.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFEEEEEE))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = formatCategoria(registro.categoria),
                style = MaterialTheme.typography.bodyLarge.copy(
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF444444)
                )
            )

            // Cuadro del número con fondo suave
            Surface(
                color = colorCategoria.copy(alpha = 0.1f),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.size(width = 48.dp, height = 36.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(
                        text = registro.cantidad.toString(),
                        style = MaterialTheme.typography.titleMedium.copy(
                            color = colorCategoria,
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                    )
                }
            }
        }
    }
}

private fun getColorForCategoria(categoria: String): Color {
    return when {
        categoria.contains("9-11", ignoreCase = true) -> Color(0xFFE91E63) // Rosado
        categoria.contains("12-23", ignoreCase = true) -> Color(0xFFFFB300) // Amarillo/Ambar
        categoria.contains("24-36", ignoreCase = true) -> Color(0xFF00ACC1) // Cian
        categoria.contains("Actor Comunal", ignoreCase = true) -> Color(0xFF9C27B0) // Morado
        else -> Color(0xFF4CAF50) // Verde para "Niños" u otros
    }
}

private fun formatCategoria(categoria: String): String {
    return if (categoria.contains("Actor Comunal", ignoreCase = true)) {
        categoria
    } else {
        "Niños ${categoria.trim()}"
    }
}