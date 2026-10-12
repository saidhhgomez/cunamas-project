package com.example.cunamas.core.util

import kotlin.js.Date

actual fun obtenerFechaActualPlataforma(): String {
    val date = Date()
    val year = date.getFullYear()
    val month = (date.getMonth() + 1).toString().padStart(2, '0')
    val day = date.getDate().toString().padStart(2, '0')
    return "$year-$month-$day"
}


actual fun millisAFechaString(millis: Long): String {
    val date = Date(millis.toDouble())
    val year = date.getUTCFullYear()
    val month = (date.getUTCMonth() + 1).toString().padStart(2, '0')
    val day = date.getUTCDate().toString().padStart(2, '0')
    return "$year-$month-$day"
}

actual fun obtenerMillisDelMesActual(): Long {
    val now = Date()
    return Date.UTC(now.getFullYear(), now.getMonth(), 1, 12, 0, 0).toLong() // 👈 hora 12
}