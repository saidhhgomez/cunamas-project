package com.example.cunamas.feature.gestion.presentation.locales.crearLocales

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.navigation.NavController
import com.example.cunamas.core.auth.domain.Role
import com.example.cunamas.core.ui.components.BotonVolver
import com.example.cunamas.core.ui.components.RoleScaffold
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CrearLocalScreen(
    idCentroAlimentario: Int,
    navController: NavController,
    viewModel: CrearLocalViewModel
) {
    val queryDistrito by viewModel.queryDistrito.collectAsState()
    val resultadosDistrito by viewModel.resultadosDistrito.collectAsState()
    val isBuscandoDistrito by viewModel.isBuscandoDistrito.collectAsState()
    val distritoSeleccionado by viewModel.distritoSeleccionado.collectAsState()

    val nombreDireccion by viewModel.nombreDireccion.collectAsState()
    val localNombre by viewModel.localNombre.collectAsState()

    val isGuardando by viewModel.isGuardando.collectAsState()
    val errorGuardado by viewModel.errorGuardado.collectAsState()

    var mensajeExito by remember { mutableStateOf<String?>(null) }
    var mostrarErrorDialog by remember { mutableStateOf(false) }

    LaunchedEffect(errorGuardado) {
        if (errorGuardado != null) {
            mostrarErrorDialog = true
        }
    }

    RoleScaffold(
        role = Role.ADMINISTRADOR,
        rutaActual = "locales",
        navController = navController,
        mostrarBottomBar = false,
        isLoading = isGuardando,
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
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            Text("Nuevo Centro de Atención Infantil", style = MaterialTheme.typography.headlineSmall)

            Spacer(Modifier.height(20.dp))

            Column {
                OutlinedTextField(
                    value = queryDistrito,
                    onValueChange = viewModel::onQueryDistritoChange,
                    label = { Text("Buscar distrito") },
                    trailingIcon = {
                        if (isBuscandoDistrito) {
                            CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp)
                        }
                    },
                    enabled = !isGuardando,
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                if (resultadosDistrito.isNotEmpty()) {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 4.dp)
                    ) {
                        Column {
                            resultadosDistrito.forEach { distrito ->
                                Text(
                                    text = "${distrito.distrito} - ${distrito.provincia}, ${distrito.departamento}",
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable { viewModel.onDistritoSeleccionado(distrito) }
                                        .padding(12.dp)
                                )
                            }
                        }
                    }
                }

                if (distritoSeleccionado != null) {
                    Spacer(Modifier.height(4.dp))
                    Text(
                        "✓ Distrito seleccionado: ${distritoSeleccionado?.distrito}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }

            Spacer(Modifier.height(16.dp))

            OutlinedTextField(
                value = nombreDireccion,
                onValueChange = viewModel::onNombreDireccionChange,
                label = { Text("Dirección (calle, número)") },
                enabled = !isGuardando,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(12.dp))

            OutlinedTextField(
                value = localNombre,
                onValueChange = viewModel::onLocalNombreChange,
                label = { Text("Nombre del local / CIAI") },
                placeholder = { Text("Ej: CIAI VES Primero") },
                enabled = !isGuardando,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(24.dp))

            Button(
                onClick = {
                    viewModel.guardar(idCentroAlimentario) { mensaje ->
                        mensajeExito = mensaje
                    }
                },
                enabled = viewModel.formularioValido() && !isGuardando,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Guardar")
            }
        }
    }

    // ✅ Modal de éxito
    mensajeExito?.let { mensaje ->
        LaunchedEffect(mensaje) {
            delay(2000)
            navController.previousBackStackEntry
                ?.savedStateHandle
                ?.set("local_creado", true)
            navController.previousBackStackEntry
                ?.savedStateHandle
                ?.set("mensaje_creado", mensaje)
            navController.popBackStack()
        }

        Dialog(
            onDismissRequest = { },
            properties = DialogProperties(dismissOnBackPress = false, dismissOnClickOutside = false)
        ) {
            Card {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Filled.CheckCircle,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(48.dp)
                    )
                    Spacer(Modifier.height(12.dp))
                    Text(
                        text = mensaje,
                        style = MaterialTheme.typography.bodyLarge,
                        textAlign = TextAlign.Center
                    )
                }
            }
        }
    }

    // ❌ Modal de error
    if (mostrarErrorDialog && errorGuardado != null) {
        LaunchedEffect(errorGuardado) {
            delay(2500)
            mostrarErrorDialog = false
        }

        AlertDialog(
            onDismissRequest = { mostrarErrorDialog = false },
            icon = {
                Icon(
                    imageVector = Icons.Filled.Warning,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.error
                )
            },
            title = { Text("No se pudo guardar") },
            text = { Text(errorGuardado ?: "") },
            confirmButton = {}
        )
    }
}
