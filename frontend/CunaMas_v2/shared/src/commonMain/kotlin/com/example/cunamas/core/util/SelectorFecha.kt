package com.example.cunamas.core.util

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.example.cunamas.core.util.diasEnMes
import com.example.cunamas.core.util.formatearFecha

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SelectorFechaDialog(
    anioInicial: Int,
    mesInicial: Int,
    diaInicial: Int,
    onConfirmar: (String) -> Unit,
    onCancelar: () -> Unit
) {
    var anio by remember { mutableStateOf(anioInicial) }
    var mes by remember { mutableStateOf(mesInicial) }
    var dia by remember { mutableStateOf(diaInicial) }

    val diasDisponibles = remember(anio, mes) { diasEnMes(anio, mes) }
    // Si el día seleccionado ya no existe en el nuevo mes (ej: 31 -> febrero), ajusta
    LaunchedEffect(diasDisponibles) {
        if (dia > diasDisponibles) dia = diasDisponibles
    }

    AlertDialog(
        onDismissRequest = onCancelar,
        title = { Text("Seleccionar fecha") },
        text = {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                SelectorNumerico(
                    label = "Día",
                    valor = dia,
                    rango = 1..diasDisponibles,
                    onCambiar = { dia = it },
                    modifier = Modifier.weight(1f)
                )
                SelectorNumerico(
                    label = "Mes",
                    valor = mes,
                    rango = 1..12,
                    onCambiar = { mes = it },
                    modifier = Modifier.weight(1f)
                )
                SelectorNumerico(
                    label = "Año",
                    valor = anio,
                    rango = 2020..2030,
                    onCambiar = { anio = it },
                    modifier = Modifier.weight(1f)
                )
            }
        },
        confirmButton = {
            TextButton(onClick = {
                onConfirmar(formatearFecha(anio, mes, dia))
            }) {
                Text("Aceptar")
            }
        },
        dismissButton = {
            TextButton(onClick = onCancelar) {
                Text("Cancelar")
            }
        }
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SelectorNumerico(
    label: String,
    valor: Int,
    rango: IntRange,
    onCambiar: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    var expandido by remember { mutableStateOf(false) }

    ExposedDropdownMenuBox(
        expanded = expandido,
        onExpandedChange = { expandido = it },
        modifier = modifier
    ) {
        OutlinedTextField(
            value = valor.toString().padStart(2, '0'),
            onValueChange = {},
            readOnly = true,
            label = { Text(label) },
            modifier = Modifier.menuAnchor().fillMaxWidth()
        )
        ExposedDropdownMenu(
            expanded = expandido,
            onDismissRequest = { expandido = false }
        ) {
            rango.forEach { opcion ->
                DropdownMenuItem(
                    text = { Text(opcion.toString().padStart(2, '0')) },
                    onClick = {
                        onCambiar(opcion)
                        expandido = false
                    }
                )
            }
        }
    }
}