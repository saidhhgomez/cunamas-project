package com.example.cunamas.core.auth.presentation.login
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import com.example.cunamas.core.ui.components.AuthScaffold
import com.example.cunamas.core.ui.components.LoadingOverlay
import org.koin.compose.viewmodel.koinViewModel

@Composable
fun LoginScreen(
    viewModel: LoginViewModel = koinViewModel(),
    onLoginSuccess: (roles: List<String>) -> Unit,
    onIrARegistro: () -> Unit
) {
    var numeroDocumento by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }

    val state by viewModel.state.collectAsState()

    AuthScaffold { paddingValues ->
        // Contenedor general que centra todo en la pantalla (Web / PC / Celular)
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentAlignment = Alignment.Center
        ) {
            // 👇 AQUÍ ESTÁ LA SOLUCIÓN: Limitamos la columna a un ancho máximo de 400.dp
            Column(
                modifier = Modifier
                    .widthIn(max = 400.dp) // Fuerza a que en PC no pase de 400dp de ancho
                    .fillMaxWidth(0.85f)  // En celulares ocupa el 85% de la pantalla
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = "CunaMas",
                    style = MaterialTheme.typography.headlineMedium
                )
                Spacer(Modifier.height(24.dp))

                OutlinedTextField(
                    value = numeroDocumento,
                    onValueChange = { numeroDocumento = it.filter { char -> char.isDigit() } },
                    label = { Text("N° Documento") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth(), // Ahora se adapta al ancho limitado de la columna (400dp)
                    singleLine = true
                )
                Spacer(Modifier.height(12.dp))

                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it.filter { char -> !char.isWhitespace() } },
                    label = { Text("Contraseña") },
                    singleLine = true,
                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    trailingIcon = {
                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                            Icon(
                                imageVector = if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                contentDescription = if (passwordVisible) "Ocultar" else "Mostrar"
                            )
                        }
                    },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(Modifier.height(20.dp))

                Button(
                    onClick = { viewModel.login(numeroDocumento.trim(), password.trim()) },
                    enabled = state !is LoginState.Loading,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Ingresar")
                }

                TextButton(
                    onClick = onIrARegistro,
                    enabled = state !is LoginState.Loading,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("¿No tienes cuenta? Regístrate")
                }

                if (state is LoginState.Error) {
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = (state as LoginState.Error).mensaje,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodyMedium
                    )
                }

                LaunchedEffect(state) {
                    if (state is LoginState.Success) {
                        onLoginSuccess((state as LoginState.Success).user.roles.map { it.name })
                    }
                }
            }

            if (state is LoginState.Loading) {
                LoadingOverlay()
            }
        }
    }
}