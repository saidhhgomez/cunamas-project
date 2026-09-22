package com.example.cunamas.core.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage

@Composable
fun WelcomeHeader(
    nombreUsuario: String,
    fotoUrl: String? = null,   // 👈 nuevo, opcional
    accion: @Composable () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFFA2E835)) // o Color(0xFFF5F5F5)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            AvatarUsuario(nombreUsuario = nombreUsuario, fotoUrl = fotoUrl)

            Spacer(Modifier.width(12.dp))

            Column {
                Text(
                    text = "Bienvenido,",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                Text(
                    text = nombreUsuario,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }

        accion()
    }
}

@Composable
private fun AvatarUsuario(
    nombreUsuario: String,
    fotoUrl: String?,
    tamano: androidx.compose.ui.unit.Dp = 48.dp
) {
    if (fotoUrl != null) {
        // 👇 hay foto real, la cargamos desde la URL
        AsyncImage(
            model = fotoUrl,
            contentDescription = "Foto de perfil",
            modifier = Modifier
                .size(tamano)
                .clip(CircleShape)
        )
    } else {
        // 👇 sin foto, mostramos un círculo con la inicial del nombre
        Box(
            modifier = Modifier
                .size(tamano)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.primary),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = nombreUsuario.trim().firstOrNull()?.uppercase() ?: "?",
                color = Color.White,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp
            )
        }
    }
}