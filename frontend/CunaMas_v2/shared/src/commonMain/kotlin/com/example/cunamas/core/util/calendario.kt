package com.example.cunamas.core.util

fun diasEnMes(year: Int, month: Int): Int {
    return when (month) {
        1, 3, 5, 7, 8, 10, 12 -> 31
        4, 6, 9, 11 -> 30
        2 -> if (esBisiesto(year)) 29 else 28
        else -> 30
    }
}

private fun esBisiesto(year: Int): Boolean {
    return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0)
}

fun formatearFecha(year: Int, month: Int, day: Int): String {
    val m = month.toString().padStart(2, '0')
    val d = day.toString().padStart(2, '0')
    return "$year-$m-$d"
}


fun diaSemana(year: Int, month: Int, day: Int): Int {
    val t = intArrayOf(0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4)
    var y = year
    if (month < 3) y -= 1
    return (y + y / 4 - y / 100 + y / 400 + t[month - 1] + day) % 7
}

// Convierte a índice Lunes=0 ... Domingo=6
fun diaSemanaLunesPrimero(year: Int, month: Int, day: Int): Int {
    val domingoPrimero = diaSemana(year, month, day)
    return (domingoPrimero + 6) % 7
}

fun nombreMes(month: Int): String {
    return listOf(
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    )[month - 1]
}