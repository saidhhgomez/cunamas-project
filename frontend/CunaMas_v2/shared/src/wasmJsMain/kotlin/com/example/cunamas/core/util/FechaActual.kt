package com.example.cunamas.core.util

@JsFun("() => new Date().getFullYear()")
external fun jsAnioActual(): Int

@JsFun("() => new Date().getMonth() + 1")
external fun jsMesActual(): Int

@JsFun("() => new Date().getDate()")
external fun jsDiaActual(): Int

actual fun obtenerFechaActualPlataforma(): String {
    val year = jsAnioActual()
    val month = jsMesActual().toString().padStart(2, '0')
    val day = jsDiaActual().toString().padStart(2, '0')
    return "$year-$month-$day"
}



@JsFun("(ms) => { const d = new Date(ms); return d.getUTCFullYear(); }")
external fun jsAnioDeMillis(ms: Double): Int

@JsFun("(ms) => { const d = new Date(ms); return d.getUTCMonth() + 1; }")
external fun jsMesDeMillis(ms: Double): Int

@JsFun("(ms) => { const d = new Date(ms); return d.getUTCDate(); }")
external fun jsDiaDeMillis(ms: Double): Int

actual fun millisAFechaString(millis: Long): String {
    val ms = millis.toDouble()
    val year = jsAnioDeMillis(ms)
    val month = jsMesDeMillis(ms).toString().padStart(2, '0')
    val day = jsDiaDeMillis(ms).toString().padStart(2, '0')
    return "$year-$month-$day"
}


@JsFun("() => { const d = new Date(); return Date.UTC(d.getFullYear(), d.getMonth(), 1, 12, 0, 0); }")
external fun jsMillisPrimerDiaMesActual(): Double

actual fun obtenerMillisDelMesActual(): Long {
    return jsMillisPrimerDiaMesActual().toLong()
}