package com.example.cunamas.core.util

/**
 * Codifica caracteres especiales para parámetros de URL de forma multiplataforma pura.
 */
fun String.encodeURLParam(): String {
    val allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
    val sb = StringBuilder()
    for (char in this) {
        if (char in allowedChars) {
            sb.append(char)
        } else {
            // Convierte caracteres especiales a formato hexadecimal %XX
            val bytes = char.toString().encodeToByteArray()
            for (byte in bytes) {
                val hex = (byte.toInt() and 0xFF).toString(16).uppercase()
                sb.append("%")
                if (hex.length == 1) sb.append("0")
                sb.append(hex)
            }
        }
    }
    return sb.toString()
}