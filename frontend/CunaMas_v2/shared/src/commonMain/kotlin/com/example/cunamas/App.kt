package com.example.cunamas

import androidx.compose.runtime.Composable
import androidx.navigation.compose.rememberNavController
import com.example.cunamas.core.navigation.AppNavHost
import com.example.cunamas.core.session.SessionManager
import org.koin.compose.koinInject

@Composable
fun App() {
    val navController = rememberNavController()
    val sessionManager: SessionManager = koinInject()

    AppNavHost(
        navController = navController,
        sessionManager = sessionManager
    )
}