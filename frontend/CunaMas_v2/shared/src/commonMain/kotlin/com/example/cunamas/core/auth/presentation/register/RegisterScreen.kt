package com.example.cunamas.core.auth.presentation.register

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.cunamas.core.auth.domain.TipoDocumento
import com.example.cunamas.core.ui.components.AuthScaffold
import com.example.cunamas.core.ui.components.LoadingOverlay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegisterScreen(
    viewModel: RegisterViewModel = hiltViewModel(),
    onVolverALogin: () -> Unit
) {
    var tipoDocumento by remember { mutableStateOf<TipoDocumento?>(null) }
    var numeroDocumento by remember { mutableStateOf("") }
    var nombres by remember { mutableStateOf("") }
    var apPaterno by remember { mutableStateOf("") }
    var apMaterno by remember { mutableStateOf("") }
    var correo by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }

    var menuTipoDocExpandido by remember { mutableStateOf(false) }
    var intentoEnviar by remember { mutableStateOf(false) }

    val state by viewModel.state.collectAsState()

    val requisitosPassword = viewModel.requisitosPassword(password)
    val passwordSegura = viewModel.passwordEsSegura(password)

    val errorTipoDocumento = tipoDocumento == null
    val errorNumeroDocumento = numeroDocumento.isBlank() ||
            (tipoDocumento == TipoDocumento.DNI && numeroDocumento.length != 8)
    val errorNombres = nombres.isBlank()
    val errorApPaterno = apPaterno.isBlank()
    val errorApMaterno = apMaterno.isBlank()
    val errorCorreo = correo.isBlank() || !correo.contains("@")
    val errorPassword = !passwordSegura
    val errorConfirmPassword = confirmPassword.isBlank() || confirmPassword != password

    val formularioValido = !errorTipoDocumento && !errorNumeroDocumento && !errorNombres &&
            !errorApPaterno && !errorApMaterno && !errorCorreo && !errorPassword && !errorConfirmPassword

    AuthScaffold { paddingValues ->
        Box(modifier = Modifier.fillMaxSize()) {

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .verticalScroll(rememberScrollState())
                    .padding(24.dp)
            ) {
                Text("Crear cuenta", style = MaterialTheme.typography.headlineMedium)
                Spacer(Modifier.height(4.dp))
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
                        TipoDocumento.values().forEach { tipo ->
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

                CampoTexto(
                    valor = numeroDocumento,
                    onValorChange = { numeroDocumento = viewModel.filtrarNumeroDocumento(it, tipoDocumento) },
                    etiqueta = "N° Documento *",
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
                    esError = intentoEnviar && errorApMaterno,
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

                // 👇 Contraseña con validación en tiempo real
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = viewModel.filtrarPassword(it) },
                    label = { Text("Contraseña *") },
                    isError = intentoEnviar && errorPassword,
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(Modifier.height(6.dp))

                // Checklist visual de requisitos, solo si el usuario ya empezó a escribir
                if (password.isNotEmpty()) {
                    Column(modifier = Modifier.padding(start = 4.dp)) {
                        requisitosPassword.forEach { requisito ->
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = if (requisito.cumplido) Icons.Default.CheckCircle else Icons.Default.Close,
                                    contentDescription = null,
                                    tint = if (requisito.cumplido) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(Modifier.width(6.dp))
                                Text(
                                    requisito.descripcion,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = if (requisito.cumplido) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.error
                                )
                            }
                        }
                    }
                }
                Spacer(Modifier.height(12.dp))

                CampoTexto(
                    valor = confirmPassword,
                    onValorChange = { confirmPassword = viewModel.filtrarPassword(it) },
                    etiqueta = "Confirmar contraseña *",
                    esError = intentoEnviar && errorConfirmPassword,
                    mensajeError = if (confirmPassword.isBlank()) "Confirma tu contraseña" else "Las contraseñas no coinciden",
                    esPassword = true
                )
                Spacer(Modifier.height(24.dp))

                if (intentoEnviar && !formularioValido) {
                    Card(
                        modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
                        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer)
                    ) {
                        Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Warning, contentDescription = null, tint = MaterialTheme.colorScheme.error)
                            Spacer(Modifier.width(8.dp))
                            Text(
                                "Completa todos los campos obligatorios correctamente",
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
                            viewModel.registrar(
                                idDocumento = tipoDocumento!!.id,
                                numeroDocumento = numeroDocumento,
                                nombres = nombres,
                                apPaterno = apPaterno,
                                apMaterno = apMaterno,
                                idGenero = 1,
                                correoElectronico = correo,
                                password = password,
                                confirmPassword = confirmPassword
                            )
                        }
                    },
                    enabled = state !is RegisterState.Loading,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Registrarme")
                }

                TextButton(onClick = onVolverALogin) {
                    Text("¿Ya tienes cuenta? Inicia sesión")
                }

                Spacer(Modifier.height(32.dp))
            }

            // 👇 Bloquea toda la pantalla mientras se registra
            if (state is RegisterState.Loading) {
                LoadingOverlay(mensaje = "Creando tu cuenta...")
            }
        }

        // 👇 MODAL de éxito — genérico, extensible más adelante
        if (state is RegisterState.Success) {
            AlertDialog(
                onDismissRequest = { },
                icon = {
                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                },
                title = { Text("¡Registro exitoso!") },
                text = {
                    Text((state as RegisterState.Success).mensaje)
                    // 🔜 espacio reservado para más adelante (ej. mostrar info adicional si el backend la agrega)
                },
                confirmButton = {
                    TextButton(onClick = {
                        viewModel.limpiarEstado()
                        onVolverALogin()
                    }) {
                        Text("Ir a iniciar sesión")
                    }
                }
            )
        }

        // 👇 MODAL de error — genérico
        if (state is RegisterState.Error) {
            AlertDialog(
                onDismissRequest = { viewModel.limpiarEstado() },
                icon = {
                    Icon(Icons.Default.Warning, contentDescription = null, tint = MaterialTheme.colorScheme.error)
                },
                title = { Text("No se pudo registrar") },
                text = { Text((state as RegisterState.Error).mensaje) },
                confirmButton = {
                    TextButton(onClick = { viewModel.limpiarEstado() }) {
                        Text("Entendido")
                    }
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
    teclado: KeyboardType = KeyboardType.Text,
    esPassword: Boolean = false
) {
    OutlinedTextField(
        value = valor,
        onValueChange = onValorChange,
        label = { Text(etiqueta) },
        isError = esError,
        keyboardOptions = KeyboardOptions(keyboardType = teclado),
        visualTransformation = if (esPassword) PasswordVisualTransformation() else androidx.compose.ui.text.input.VisualTransformation.None,
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