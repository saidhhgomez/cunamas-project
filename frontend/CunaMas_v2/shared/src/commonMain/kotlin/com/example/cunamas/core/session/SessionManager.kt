package com.example.cunamas.core.session

import com.example.cunamas.core.auth.domain.User
import kotlinx.coroutines.flow.StateFlow

interface SessionManager {
    val currentUser: StateFlow<User?>
    fun setUser(user: User)
    fun clearUser()
    fun getToken(): String?
}