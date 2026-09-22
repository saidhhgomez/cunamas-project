package com.example.cunamas.core.util
import java.time.LocalDate
import java.util.Calendar
import java.util.TimeZone

actual fun obtenerFechaActualPlataforma(): String {
    return LocalDate.now().toString()
}


actual fun millisAFechaString(millis: Long): String {
    val cal = Calendar.getInstance(TimeZone.getTimeZone("UTC"))
    cal.timeInMillis = millis
    val year = cal.get(Calendar.YEAR)
    val month = (cal.get(Calendar.MONTH) + 1).toString().padStart(2, '0')
    val day = cal.get(Calendar.DAY_OF_MONTH).toString().padStart(2, '0')
    return "$year-$month-$day"
}


actual fun obtenerMillisDelMesActual(): Long {
    val cal = Calendar.getInstance(TimeZone.getTimeZone("UTC"))
    cal.set(Calendar.DAY_OF_MONTH, 1)
    cal.set(Calendar.HOUR_OF_DAY, 12) // 👈 mediodía en vez de medianoche
    cal.set(Calendar.MINUTE, 0)
    cal.set(Calendar.SECOND, 0)
    cal.set(Calendar.MILLISECOND, 0)
    return cal.timeInMillis
}