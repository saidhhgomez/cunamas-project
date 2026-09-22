package com.example.cunamas.core.ui.components
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@Composable
fun AuthScaffold(
    content: @Composable (PaddingValues) -> Unit
) {
    Scaffold(
        modifier = Modifier
            .fillMaxSize()
            .safeDrawingPadding()   // 👈 protege TODA la pantalla: arriba, abajo, notch
    ) { paddingValues ->
        content(paddingValues)
    }
}