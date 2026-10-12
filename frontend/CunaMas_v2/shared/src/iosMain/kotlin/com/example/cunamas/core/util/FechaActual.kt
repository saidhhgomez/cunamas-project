package com.example.cunamas.core.util

import platform.Foundation.NSCalendar
import platform.Foundation.NSCalendarUnitMonth
import platform.Foundation.NSCalendarUnitYear
import platform.Foundation.NSDate
import platform.Foundation.NSDateFormatter
import platform.Foundation.NSTimeZone
import platform.Foundation.dateWithTimeIntervalSince1970
import platform.Foundation.timeIntervalSince1970
import platform.Foundation.timeZoneWithAbbreviation

actual fun obtenerFechaActualPlataforma():String {
    val formatter = NSDateFormatter()
    formatter.dateFormat = "yyyy-MM-dd"
    return formatter.stringFromDate(NSDate())
}

actual fun millisAFechaString(millis: Long): String {
    val date = NSDate.dateWithTimeIntervalSince1970(millis / 1000.0)
    val formatter = NSDateFormatter()
    formatter.dateFormat = "yyyy-MM-dd"
    formatter.timeZone = NSTimeZone.timeZoneWithAbbreviation("UTC")!!
    return formatter.stringFromDate(date)
}


actual fun obtenerMillisDelMesActual(): Long {
    val cal = NSCalendar.currentCalendar
    cal.timeZone = NSTimeZone.timeZoneWithAbbreviation("UTC")!!
    val comps = cal.components(NSCalendarUnitYear or NSCalendarUnitMonth, NSDate())
    comps.day = 1
    comps.hour = 12 // 👈 mediodía
    val date = cal.dateFromComponents(comps)!!
    return (date.timeIntervalSince1970 * 1000).toLong()
}