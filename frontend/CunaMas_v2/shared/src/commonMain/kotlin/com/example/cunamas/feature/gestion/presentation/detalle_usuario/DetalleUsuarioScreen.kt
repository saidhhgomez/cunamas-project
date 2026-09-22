package com.example.cunamas.feature.gestion.presentation.detalle_usuario

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.cunamas.core.auth.domain.Role
import com.example.cunamas.core.ui.components.RoleScaffold

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DetalleUsuarioScreen(
    idPersona: Int,
    navController: NavController,
    viewModel: DetalleUsuarioViewModel // 👈 Recibido por parámetro, inyectado con Koin
) {
    val state by viewModel.state.collectAsState()
    val aprobacionState by viewModel.aprobacionState.collectAsState()
    val usuarioSesion by viewModel.sessionManager.currentUser.collectAsState()
    val rolActivo = usuarioSesion?.rolPrincipal ?: Role.DESCONOCIDO

    var rolSeleccionado by remember { mutableStateOf<Role?>(null) }
    var menuExpandido by remember { mutableStateOf(false) }

    LaunchedEffect(idPersona) {
        viewModel.cargarDetalle(idPersona)
    }

    RoleScaffold(
        role = rolActivo,
        rutaActual = "usuarios_pendientes",
        navController = navController,
        mostrarBottomBar = false,
        isLoading = aprobacionState is AprobacionState.Enviando, // 👈 Bloqueo global
        topBar = {
            TopAppBar(
                title = { Text("Detalle de usuario") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Regresar")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFFD4E157),
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
                ),
                windowInsets = WindowInsets(0, 0, 0, 0)
            )
        }
    ) { paddingValues ->
        when (val currentState = state) {
            is DetalleUsuarioState.Loading -> {
                Box(Modifier.fillMaxSize().padding(paddingValues), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            }
            is DetalleUsuarioState.Error -> {
                Box(Modifier.fillMaxSize().padding(paddingValues), contentAlignment = Alignment.Center) {
                    Text(currentState.mensaje)
                }
            }
            is DetalleUsuarioState.Listo -> {
                val usuario = currentState.usuario

                Box(modifier = Modifier.fillMaxSize()) {

                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(paddingValues)
                            .verticalScroll(rememberScrollState())
                            .padding(24.dp)
                    ) {
                        Text(usuario.nombreCompleto, style = MaterialTheme.typography.headlineSmall)
                        Spacer(Modifier.height(16.dp))

                        InfoFila("Documento", "${usuario.tipoDocumento} - ${usuario.numeroDocumento}")
                        InfoFila("Correo", usuario.correoElectronico)
                        InfoFila("Teléfono", usuario.telefono ?: "No registrado")
                        InfoFila("Género", usuario.genero)
                        InfoFila("Distrito", usuario.distrito ?: "No registrado")
                        InfoFila("Fecha de registro", usuario.fechaRegistro)

                        Spacer(Modifier.height(24.dp))
                        HorizontalDivider()
                        Spacer(Modifier.height(24.dp))

                        Text("Asignar rol", style = MaterialTheme.typography.titleMedium)
                        Spacer(Modifier.height(8.dp))

                        ExposedDropdownMenuBox(
                            expanded = menuExpandido,
                            onExpandedChange = { menuExpandido = it }
                        ) {
                            OutlinedTextField(
                                value = rolSeleccionado?.nombreBackend ?: "Selecciona un rol",
                                onValueChange = {},
                                readOnly = true,
                                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = menuExpandido) },
                                modifier = Modifier.fillMaxWidth().menuAnchor()
                            )
                            ExposedDropdownMenu(
                                expanded = menuExpandido,
                                onDismissRequest = { menuExpandido = false }
                            ) {
                                Role.rolesAsignables().forEach { rol ->
                                    DropdownMenuItem(
                                        text = { Text(rol.nombreBackend) },
                                        onClick = {
                                            rolSeleccionado = rol
                                            menuExpandido = false
                                        }
                                    )
                                }
                            }
                        }

                        Spacer(Modifier.height(24.dp))

                        Button(
                            onClick = {
                                rolSeleccionado?.let { rol ->
                                    viewModel.aprobar(usuario.idPersona, listOf(rol.idBackend))
                                }
                            },
                            enabled = rolSeleccionado != null && aprobacionState !is AprobacionState.Enviando,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Aprobar usuario")
                        }
                    }

                }

                // MODAL de éxito
                if (aprobacionState is AprobacionState.Exito) {
                    LaunchedEffect(Unit) {
                        kotlinx.coroutines.delay(2000)
                        navController.navigate("gestion_home") {
                            popUpTo("gestion_home") { inclusive = true }
                        }
                    }

                    AlertDialog(
                        onDismissRequest = { },
                        icon = {
                            Icon(
                                Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary
                            )
                        },
                        title = { Text("¡Listo!") },
                        text = { Text((aprobacionState as AprobacionState.Exito).mensaje) },
                        confirmButton = {}
                    )
                }

                // MODAL de error
                if (aprobacionState is AprobacionState.Error) {
                    AlertDialog(
                        onDismissRequest = { viewModel.limpiarError() },
                        icon = {
                            Icon(
                                Icons.Default.Warning,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.error
                            )
                        },
                        title = { Text("Error") },
                        text = { Text((aprobacionState as AprobacionState.Error).mensaje) },
                        confirmButton = {
                            TextButton(onClick = { viewModel.limpiarError() }) {
                                Text("Entendido")
                            }
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun InfoFila(label: String, valor: String) {
    Column(modifier = Modifier.padding(vertical = 6.dp)) {
        Text(label, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(valor, style = MaterialTheme.typography.bodyLarge)
    }
}