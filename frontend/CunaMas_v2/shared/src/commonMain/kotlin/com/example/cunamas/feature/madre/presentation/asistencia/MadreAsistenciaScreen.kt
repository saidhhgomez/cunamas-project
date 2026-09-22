package com.example.cunamas.feature.madre.presentation.asistencia

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.cunamas.core.auth.domain.Role
import com.example.cunamas.core.ui.components.LoadingOverlay
import com.example.cunamas.core.ui.components.RoleScaffold
import org.koin.compose.viewmodel.koinViewModel
import org.koin.core.parameter.parametersOf

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MadreAsistenciaScreen(
    idModulo: Int,
    nombreModulo: String,
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
        if (exito != null) {
            kotlinx.coroutines.delay(2000)
            navController.popBackStack()
        }
    }

    RoleScaffold(
        role = rolActivo,
        rutaActual = "madre_asistencia",
        navController = navController,
        isLoading = isLoading, // 👈 Pasa el estado aquí
        topBar = {
            TopAppBar(
                title = { Text("Registrar Asistencia") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Regresar")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFFD4E157),
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
                )
            )
        }
    ) { paddingValues ->
        Box(modifier = Modifier.fillMaxSize()) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(16.dp)
            ) {
                Text(
                    text = nombreModulo,
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )

                Spacer(Modifier.height(16.dp))

                Text(
                    "Seleccione el turno:",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
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
                            val colorCategoria = getColorForMadreCategoria(cat.nombre)
                            
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(10.dp)
                                            .background(colorCategoria, CircleShape)
                                    )
                                    Spacer(Modifier.width(12.dp))
                                    Text(
                                        text = if (cat.id != 5) "Niños ${cat.nombre}" else cat.nombre,
                                        style = MaterialTheme.typography.bodyLarge,
                                        color = Color(0xFF333333)
                                    )
                                }
                                
                                AsistenciaInput(
                                    value = cat.cantidad,
                                    onValueChange = { viewModel.onCantidadChange(cat.id, it) },
                                    color = colorCategoria,
                                    enabled = !isLoading
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
                        Text("Enviar Asistencia")
                    }
                } else {
                    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("Seleccione un turno para continuar", style = MaterialTheme.typography.bodyLarge)
                    }
                }
            }
        }
    }
}

@Composable
private fun AsistenciaInput(
    value: String,
    onValueChange: (String) -> Unit,
    color: Color,
    enabled: Boolean = true
) {
    BasicTextField(
        value = value,
        onValueChange = {
            if (it.length <= 3 && it.all { char -> char.isDigit() }) {
                onValueChange(it)
            }
        },
        modifier = Modifier.width(56.dp).height(36.dp),
        textStyle = LocalTextStyle.current.copy(
            textAlign = TextAlign.Center,
            fontWeight = FontWeight.Bold,
            color = color,
            fontSize = 16.sp
        ),
        singleLine = true,
        enabled = enabled,
        keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(
            keyboardType = androidx.compose.ui.text.input.KeyboardType.Number
        ),
        decorationBox = { innerTextField ->
            Surface(
                color = Color.White,
                shape = RoundedCornerShape(8.dp),
                border = BorderStroke(1.5.dp, color),
                modifier = Modifier.fillMaxSize()
            ) {
                Box(
                    contentAlignment = Alignment.Center,
                    modifier = Modifier.fillMaxSize()
                ) {
                    innerTextField()
                }
            }
        }
    )
}

private fun getColorForMadreCategoria(nombre: String): Color {
    return when {
        nombre.contains("6-8", ignoreCase = true) -> Color(0xFF4CAF50) // Verde
        nombre.contains("9-11", ignoreCase = true) -> Color(0xFFE91E63) // Rosado
        nombre.contains("12-23", ignoreCase = true) -> Color(0xFFFFB300) // Amarillo
        nombre.contains("24-36", ignoreCase = true) -> Color(0xFF00ACC1) // Cian
        nombre.contains("Actor Comunal", ignoreCase = true) -> Color(0xFF9C27B0) // Morado
        else -> Color(0xFF757575)
    }
}
