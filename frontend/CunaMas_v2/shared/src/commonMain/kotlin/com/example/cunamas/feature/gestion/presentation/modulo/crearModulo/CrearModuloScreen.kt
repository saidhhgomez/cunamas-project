package com.example.cunamas.feature.gestion.presentation.modulo.crearModulo

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

@Composable
fun CrearModuloScreen(
    idLocal: Int,
    navController: NavController,
    viewModel: CrearModuloViewModel
) {
    val nombreModulo by viewModel.nombreModulo.collectAsState()
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
        rutaActual = "modulos",
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
            Text("Nuevo Módulo", style = MaterialTheme.typography.headlineSmall)

            Spacer(Modifier.height(20.dp))

            OutlinedTextField(
                value = nombreModulo,
                onValueChange = viewModel::onNombreModuloChange,
                label = { Text("Nombre del Módulo") },
                placeholder = { Text("Ej: Módulo A") },
                enabled = !isGuardando,
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(Modifier.height(24.dp))

            Button(
                onClick = {
                    viewModel.guardar(idLocal) { mensaje ->
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

    // Modal de Éxito con redirección automática
    mensajeExito?.let { mensaje ->
        LaunchedEffect(mensaje) {
            delay(2000)
            navController.previousBackStackEntry
                ?.savedStateHandle
                ?.set("modulo_creado", true)
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

    // Modal de Error
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
