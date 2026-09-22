package com.example.cunamas

import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.window.ComposeViewport
import com.example.cunamas.core.auth.di.initKoin
import kotlinx.browser.document

@OptIn(ExperimentalComposeUiApi::class)
fun main() {
    // 1. Inicializamos Koin obligatoriamente antes de cargar la interfaz
    initKoin()

    val body = document.body ?: return

    ComposeViewport(body) {
        App()
    }
}