package com.example.cunamas.core.util

expect object PlatformFileHandler {
    fun openPdf(bytes: ByteArray, fileName: String)
}
