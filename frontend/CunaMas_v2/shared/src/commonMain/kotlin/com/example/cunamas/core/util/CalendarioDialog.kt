package com.example.cunamas.core.util

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowLeft
import androidx.compose.material.icons.filled.KeyboardArrowRight
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp

@Composable
fun CalendarioDialog(
    anioInicial: Int,
    mesInicial: Int,
    diaInicial: Int,
    onConfirmar: (String) -> Unit,
    onCancelar: () -> Unit
) {
    var anio by remember { mutableStateOf(anioInicial) }
    var mes by remember { mutableStateOf(mesInicial) }
    var diaSeleccionado by remember { mutableStateOf(diaInicial) }
    var mostrarSelectorMesAnio by remember { mutableStateOf(false) }

    fun cambiarMes(delta: Int) {
        var nuevoMes = mes + delta
        var nuevoAnio = anio
        if (nuevoMes > 12) { nuevoMes = 1; nuevoAnio++ }
        if (nuevoMes < 1) { nuevoMes = 12; nuevoAnio-- }
        mes = nuevoMes
        anio = nuevoAnio
    }

    val diasDelMes = diasEnMes(anio, mes)
    val offsetPrimerDia = diaSemanaLunesPrimero(anio, mes, 1)

    AlertDialog(
        onDismissRequest = onCancelar,
        title = { Text("Seleccionar fecha") },
        text = {
            Column {
                if (mostrarSelectorMesAnio) {
                    // 🗓️ Vista rápida de Mes/Año
                    SelectorMesAnio(
                        anioActual = anio,
                        mesActual = mes,
                        onSeleccionar = { nuevoAnio, nuevoMes ->
                            anio = nuevoAnio
                            mes = nuevoMes
                            if (diaSeleccionado > diasEnMes(nuevoAnio, nuevoMes)) {
                                diaSeleccionado = diasEnMes(nuevoAnio, nuevoMes)
                            }
                            mostrarSelectorMesAnio = false
                        }
                    )
                } else {
                    // Encabezado clickeable: mes/año con flechas
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "${nombreMes(mes)} de $anio",
                            style = MaterialTheme.typography.titleMedium,
                            modifier = Modifier.clickable { mostrarSelectorMesAnio = true }
                        )
                        Row {
                            IconButton(onClick = { cambiarMes(-1) }) {
                                Icon(Icons.Filled.KeyboardArrowLeft, contentDescription = "Mes anterior")
                            }
                            IconButton(onClick = { cambiarMes(1) }) {
                                Icon(Icons.Filled.KeyboardArrowRight, contentDescription = "Mes siguiente")
                            }
                        }
                    }

                    Spacer(Modifier.height(8.dp))

                    Row(modifier = Modifier.fillMaxWidth()) {
                        listOf("L", "M", "X", "J", "V", "S", "D").forEach { dia ->
                            Text(
                                text = dia,
                                modifier = Modifier.weight(1f),
                                textAlign = TextAlign.Center,
                                style = MaterialTheme.typography.labelMedium
                            )
                        }
                    }

                    Spacer(Modifier.height(4.dp))

                    LazyVerticalGrid(
                        columns = GridCells.Fixed(7),
                        modifier = Modifier.height(240.dp)
                    ) {
                        items(offsetPrimerDia) {
                            Box(Modifier.aspectRatio(1f))
                        }
                        items(diasDelMes) { index ->
                            val dia = index + 1
                            val seleccionado = dia == diaSeleccionado
                            Box(
                                modifier = Modifier
                                    .aspectRatio(1f)
                                    .padding(2.dp)
                                    .background(
                                        color = if (seleccionado) MaterialTheme.colorScheme.primary else Color.Transparent,
                                        shape = CircleShape
                                    )
                                    .clickable { diaSeleccionado = dia },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = dia.toString(),
                                    color = if (seleccionado) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
                                )
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            if (!mostrarSelectorMesAnio) {
                TextButton(onClick = {
                    onConfirmar(formatearFecha(anio, mes, diaSeleccionado))
                }) {
                    Text("Aceptar")
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onCancelar) {
                Text("Cancelar")
            }
        }
    )
}

@Composable
private fun SelectorMesAnio(
    anioActual: Int,
    mesActual: Int,
    onSeleccionar: (anio: Int, mes: Int) -> Unit
) {
    var anioTemporal by remember { mutableStateOf(anioActual) }

    Column {
        // Selector de año (desde el actual hacia adelante, 5 años)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = { if (anioTemporal > anioActual) anioTemporal-- },
                enabled = anioTemporal > anioActual
            ) {
                Icon(Icons.Filled.KeyboardArrowLeft, contentDescription = "Año anterior")
            }
            Text(
                text = anioTemporal.toString(),
                style = MaterialTheme.typography.titleLarge
            )
            IconButton(onClick = { anioTemporal++ }) {
                Icon(Icons.Filled.KeyboardArrowRight, contentDescription = "Año siguiente")
            }
        }

        Spacer(Modifier.height(12.dp))

        // Grilla de meses (1 a 12)
        LazyVerticalGrid(
            columns = GridCells.Fixed(3),
            modifier = Modifier.height(200.dp)
        ) {
            items(12) { index ->
                val numeroMes = index + 1
                // Si es el año actual, no permitir meses ya pasados
                val deshabilitado = anioTemporal == anioActual && false // ajusta aquí si quieres bloquear meses pasados del año actual
                Box(
                    modifier = Modifier
                        .padding(4.dp)
                        .clickable(enabled = !deshabilitado) {
                            onSeleccionar(anioTemporal, numeroMes)
                        }
                        .background(
                            color = if (numeroMes == mesActual && anioTemporal == anioActual)
                                MaterialTheme.colorScheme.primary
                            else Color.Transparent,
                            shape = MaterialTheme.shapes.small
                        )
                        .padding(vertical = 12.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = nombreMes(numeroMes).replaceFirstChar { it.uppercase() },
                        color = if (numeroMes == mesActual && anioTemporal == anioActual)
                            MaterialTheme.colorScheme.onPrimary
                        else MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }
    }
}