package com.example.cunamas.feature.madre.presentation.home

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.cunamas.core.auth.domain.Role
import com.example.cunamas.core.ui.components.RoleScaffold
import com.example.cunamas.core.ui.components.WelcomeHeader
import com.example.cunamas.feature.gestion.domain.model.Distrito
import org.koin.compose.viewmodel.koinViewModel

@Composable
fun MadreHomeScreen(
    navController: NavController,
    viewModel: MadreHomeViewModel = koinViewModel()
) {
    val user by viewModel.sessionManager.currentUser.collectAsState()
    val rolActivo = user?.rolPrincipal ?: Role.DESCONOCIDO
    val tieneDireccion = user?.tieneDireccion ?: true

    RoleScaffold(
        role = rolActivo,
        rutaActual = "madre_home",
        navController = navController
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            WelcomeHeader(nombreUsuario = user?.nombre ?: "")

            Spacer(Modifier.height(32.dp))
            
            Text(
                text = "Bienvenida a CunaMás (Módulo Madre)",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(Modifier.height(16.dp))
            
            Text(
                text = "Desde aquí podrás ver el progreso de tu niño y gestionar tus datos.",
                style = MaterialTheme.typography.bodyLarge
            )
        }

        // 🏠 DIALOG MANDATORIO DE DIRECCIÓN
        if (!tieneDireccion) {
            DialogRegistroDireccion(viewModel)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DialogRegistroDireccion(viewModel: MadreHomeViewModel) {
    var idDistritoSeleccionado by remember { mutableStateOf<Int?>(null) }
    var nombreDistritoSeleccionado by remember { mutableStateOf("") }
    var nombreDireccion by remember { mutableStateOf("") }
    
    val queryDistrito by viewModel.queryDistrito.collectAsState()
    val distritosSugeridos by viewModel.distritosSugeridos.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()

    BasicAlertDialog(
        onDismissRequest = { /* No permitir cerrar */ },
        modifier = Modifier.padding(16.dp)
    ) {
        Surface(
            shape = MaterialTheme.shapes.extraLarge,
            tonalElevation = 6.dp
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    Icons.Default.LocationOn,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(48.dp)
                )
                
                Spacer(Modifier.height(16.dp))
                
                Text(
                    "¡Completa tu perfil!",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold
                )
                
                Text(
                    "Necesitamos conocer tu dirección para brindarte un mejor servicio.",
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier.padding(top = 8.dp)
                )

                Spacer(Modifier.height(24.dp))

                // 🔍 Buscador de Distritos
                OutlinedTextField(
                    value = if (idDistritoSeleccionado != null) nombreDistritoSeleccionado else queryDistrito,
                    onValueChange = { 
                        viewModel.onQueryDistritoChange(it)
                        if (idDistritoSeleccionado != null) {
                            idDistritoSeleccionado = null
                            nombreDistritoSeleccionado = ""
                        }
                    },
                    label = { Text("Busca tu distrito (Escribe 3 letras)") },
                    modifier = Modifier.fillMaxWidth(),
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                    trailingIcon = {
                        if (isLoading) CircularProgressIndicator(modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
                    },
                    singleLine = true
                )

                // 📋 Lista de sugerencias de distritos
                if (idDistritoSeleccionado == null && distritosSugeridos.isNotEmpty()) {
                    Card(
                        modifier = Modifier.fillMaxWidth().heightIn(max = 150.dp),
                        elevation = CardDefaults.cardElevation(4.dp)
                    ) {
                        LazyColumn {
                            items(distritosSugeridos) { distrito ->
                                ListItem(
                                    headlineContent = { Text(distrito.nombre) },
                                    modifier = Modifier.clickable {
                                        idDistritoSeleccionado = distrito.id
                                        nombreDistritoSeleccionado = distrito.nombre
                                        viewModel.onQueryDistritoChange("")
                                    }
                                )
                            }
                        }
                    }
                }

                Spacer(Modifier.height(16.dp))

                // 🏠 Nombre de la dirección
                OutlinedTextField(
                    value = nombreDireccion,
                    onValueChange = { nombreDireccion = it },
                    label = { Text("Dirección (Calle, Av, Jr, Mz, Lt)") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )

                if (error != null) {
                    Text(
                        text = error!!,
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }

                Spacer(Modifier.height(32.dp))

                Button(
                    onClick = { 
                        if (idDistritoSeleccionado != null && nombreDireccion.isNotBlank()) {
                            viewModel.registrarDireccion(idDistritoSeleccionado!!, nombreDireccion)
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = idDistritoSeleccionado != null && nombreDireccion.isNotBlank() && !isLoading,
                    shape = MaterialTheme.shapes.medium
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(modifier = Modifier.size(20.dp), color = MaterialTheme.colorScheme.onPrimary)
                    } else {
                        Text("Guardar y Continuar")
                    }
                }
            }
        }
    }
}
