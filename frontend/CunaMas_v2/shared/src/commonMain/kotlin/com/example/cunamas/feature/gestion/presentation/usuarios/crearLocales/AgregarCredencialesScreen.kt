package com.example.cunamas.feature.gestion.presentation.usuarios.crearLocales


import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.cunamas.core.auth.domain.Role
import com.example.cunamas.core.ui.components.RoleScaffold
import com.example.cunamas.core.common.TipoDocumento

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AgregarCredencialesScreen(
    navController: NavController,
    viewModel: AgregarCredencialesViewModel // 👈 Recibido por parámetro, inyectado con Koin
) {
    val state by viewModel.state.collectAsState()
    val clipboardManager = LocalClipboardManager.current

    var tipoDocumento by remember { mutableStateOf<TipoDocumento?>(null) }
    var numeroDocumento by remember { mutableStateOf("") }
    var nombres by remember { mutableStateOf("") }
    var apPaterno by remember { mutableStateOf("") }
    var apMaterno by remember { mutableStateOf("") }
    var correo by remember { mutableStateOf("") }
    var rolSeleccionado by remember { mutableStateOf<Role?>(null) }

    var menuTipoDocExpandido by remember { mutableStateOf(false) }
    var menuRolExpandido by remember { mutableStateOf(false) }
    var intentoEnviar by remember { mutableStateOf(false) }

    val errorTipoDocumento = tipoDocumento == null
    val errorNumeroDocumento = numeroDocumento.isBlank() ||
            (tipoDocumento == TipoDocumento.DNI && numeroDocumento.length != 8)
    val errorNombres = nombres.isBlank()
    val errorApPaterno = apPaterno.isBlank()
    val errorApMaterno = apMaterno.isBlank()
    val errorCorreo = correo.isBlank() || !correo.contains("@")
    val errorRol = rolSeleccionado == null

    val formularioValido = !errorTipoDocumento && !errorNumeroDocumento && !errorNombres &&
            !errorApPaterno && !errorApMaterno && !errorCorreo && !errorRol

    RoleScaffold(
        role = Role.ADMINISTRADOR,
        rutaActual = "agregar_credenciales",
        navController = navController,
        mostrarBottomBar = false,
        isLoading = state is CrearUsuarioState.Enviando, // 👈 Bloqueo global
        topBar = {
            TopAppBar(
                title = { Text("Agregar acceso") },
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
        Box(modifier = Modifier.fillMaxSize()) {

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .verticalScroll(rememberScrollState())
                    .padding(24.dp)
            ) {
                Text(
                    "Los campos marcados con * son obligatorios",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(Modifier.height(16.dp))

                // 👇 Tipo de documento
                Text("Tipo de documento *", style = MaterialTheme.typography.labelLarge)
                Spacer(Modifier.height(4.dp))
                ExposedDropdownMenuBox(
                    expanded = menuTipoDocExpandido,
                    onExpandedChange = { menuTipoDocExpandido = it }
                ) {
                    OutlinedTextField(
                        value = tipoDocumento?.label ?: "Selecciona tipo de documento",
                        onValueChange = {},
                        readOnly = true,
                        isError = intentoEnviar && errorTipoDocumento,
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = menuTipoDocExpandido) },
                        modifier = Modifier.fillMaxWidth().menuAnchor()
                    )
                    ExposedDropdownMenu(
                        expanded = menuTipoDocExpandido,
                        onDismissRequest = { menuTipoDocExpandido = false }
                    ) {
                        TipoDocumento.entries.forEach { tipo -> // Actualizado a entries para KMP moderno
                            DropdownMenuItem(
                                text = { Text(tipo.label) },
                                onClick = {
                                    tipoDocumento = tipo
                                    numeroDocumento = ""
                                    menuTipoDocExpandido = false
                                }
                            )
                        }
                    }
                }
                if (intentoEnviar && errorTipoDocumento) {
                    CampoErrorTexto("Selecciona un tipo de documento")
                }
                Spacer(Modifier.height(12.dp))

                // 👇 Número de documento
                CampoTexto(
                    valor = numeroDocumento,
                    onValorChange = { nuevoValor ->
                        numeroDocumento = viewModel.filtrarNumeroDocumento(nuevoValor, tipoDocumento)
                    },
                    etiqueta = "N° de documento *",
                    esError = intentoEnviar && errorNumeroDocumento,
                    mensajeError = viewModel.mensajeErrorNumeroDocumento(tipoDocumento),
                    teclado = if (tipoDocumento?.soloNumerico == true) KeyboardType.Number else KeyboardType.Text
                )
                Spacer(Modifier.height(12.dp))

                CampoTexto(
                    valor = nombres,
                    onValorChange = { nombres = viewModel.filtrarTextoSinEspaciosDobles(it) },
                    etiqueta = "Nombres *",
                    esError = intentoEnviar && errorNombres,
                    mensajeError = "Los nombres son obligatorios"
                )
                Spacer(Modifier.height(12.dp))

                CampoTexto(
                    valor = apPaterno,
                    onValorChange = { apPaterno = viewModel.filtrarTextoSinEspaciosDobles(it) },
                    etiqueta = "Apellido paterno *",
                    esError = intentoEnviar && errorApPaterno,
                    mensajeError = "El apellido paterno es obligatorio"
                )
                Spacer(Modifier.height(12.dp))

                CampoTexto(
                    valor = apMaterno,
                    onValorChange = { apMaterno = viewModel.filtrarTextoSinEspaciosDobles(it) },
                    etiqueta = "Apellido materno *",
                    esError = intentoEnviar && errorApMaterno, // 👈 Corregido aquí
                    mensajeError = "El apellido materno es obligatorio"
                )

                Spacer(Modifier.height(12.dp))

                CampoTexto(
                    valor = correo,
                    onValorChange = { correo = viewModel.filtrarCorreo(it) },
                    etiqueta = "Correo electrónico *",
                    esError = intentoEnviar && errorCorreo,
                    mensajeError = "Ingresa un correo electrónico válido",
                    teclado = KeyboardType.Email
                )
                Spacer(Modifier.height(16.dp))

                // 👇 Rol
                Text("Rol *", style = MaterialTheme.typography.labelLarge)
                Spacer(Modifier.height(4.dp))
                ExposedDropdownMenuBox(
                    expanded = menuRolExpandido,
                    onExpandedChange = { menuRolExpandido = it }
                ) {
                    OutlinedTextField(
                        value = rolSeleccionado?.nombreBackend ?: "Selecciona un rol",
                        onValueChange = {},
                        readOnly = true,
                        isError = intentoEnviar && errorRol,
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = menuRolExpandido) },
                        modifier = Modifier.fillMaxWidth().menuAnchor()
                    )
                    ExposedDropdownMenu(
                        expanded = menuRolExpandido,
                        onDismissRequest = { menuRolExpandido = false }
                    ) {
                        Role.rolesAsignables().forEach { rol ->
                            DropdownMenuItem(
                                text = { Text(rol.nombreBackend) },
                                onClick = {
                                    rolSeleccionado = rol
                                    menuRolExpandido = false
                                }
                            )
                        }
                    }
                }
                if (intentoEnviar && errorRol) {
                    CampoErrorTexto("Selecciona un rol")
                }

                Spacer(Modifier.height(24.dp))

                if (intentoEnviar && !formularioValido) {
                    Card(
                        modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer)
                    ) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.Warning, contentDescription = null, tint = MaterialTheme.colorScheme.error)
                            Spacer(Modifier.width(8.dp))
                            Text(
                                "Completa todos los campos obligatorios para continuar",
                                color = MaterialTheme.colorScheme.onErrorContainer,
                                style = MaterialTheme.typography.bodySmall
                            )
                        }
                    }
                }

                Button(
                    onClick = {
                        intentoEnviar = true
                        if (formularioValido) {
                            viewModel.crear(
                                idDocumento = tipoDocumento!!.id,
                                numeroDocumento = numeroDocumento,
                                nombres = nombres,
                                apPaterno = apPaterno,
                                apMaterno = apMaterno,
                                idGenero = 1,
                                correoElectronico = correo,
                                rolesIds = listOf(rolSeleccionado!!.idBackend)
                            )
                        }
                    },
                    enabled = state !is CrearUsuarioState.Enviando,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Crear acceso")
                }
            }
        }

        // 👇 MODAL de éxito
        if (state is CrearUsuarioState.Exito) {
            val credencial = (state as CrearUsuarioState.Exito).credencial

            AlertDialog(
                onDismissRequest = { },
                icon = {
                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                },
                title = { Text("¡Acceso creado!") },
                text = {
                    Column {
                        Text(credencial.mensaje)
                        Spacer(Modifier.height(16.dp))
                        Text("Contraseña temporal:", style = MaterialTheme.typography.labelMedium)
                        Spacer(Modifier.height(4.dp))
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                        ) {
                            Text(
                                text = credencial.passwordTemporal,
                                modifier = Modifier.padding(16.dp).fillMaxWidth(),
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                textAlign = TextAlign.Center
                            )
                        }
                        Spacer(Modifier.height(8.dp))
                        Text(
                            "Comparte esta contraseña con el usuario. Deberá cambiarla en su primer inicio de sesión.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                confirmButton = {
                    TextButton(onClick = {
                        clipboardManager.setText(AnnotatedString(credencial.passwordTemporal))
                        navController.popBackStack()
                    }) {
                        Text("Copiar y regresar")
                    }
                }
            )
        }

        if (state is CrearUsuarioState.Error) {
            AlertDialog(
                onDismissRequest = { viewModel.limpiarError() },
                icon = { Icon(Icons.Default.Warning, contentDescription = null, tint = MaterialTheme.colorScheme.error) },
                title = { Text("Error") },
                text = { Text((state as CrearUsuarioState.Error).mensaje) },
                confirmButton = {
                    TextButton(onClick = { viewModel.limpiarError() }) { Text("Entendido") }
                }
            )
        }
    }
}

@Composable
private fun CampoTexto(
    valor: String,
    onValorChange: (String) -> Unit,
    etiqueta: String,
    esError: Boolean,
    mensajeError: String,
    teclado: KeyboardType = KeyboardType.Text
) {
    OutlinedTextField(
        value = valor,
        onValueChange = onValorChange,
        label = { Text(etiqueta) },
        isError = esError,
        keyboardOptions = KeyboardOptions(keyboardType = teclado),
        modifier = Modifier.fillMaxWidth()
    )
    if (esError) {
        CampoErrorTexto(mensajeError)
    }
}

@Composable
private fun CampoErrorTexto(mensaje: String) {
    Text(
        text = mensaje,
        color = MaterialTheme.colorScheme.error,
        style = MaterialTheme.typography.bodySmall,
        modifier = Modifier.padding(start = 4.dp, top = 2.dp)
    )
}