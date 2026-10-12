package com.example.cunamas.core.session

import com.example.cunamas.core.auth.domain.User
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow


class SessionManagerImpl : SessionManager {
    private val _currentUser = MutableStateFlow<User?>(null)
    override val currentUser: StateFlow<User?> = _currentUser

    override fun setUser(user: User) {
        _currentUser.value = user
    }

    override fun clearUser() {
        _currentUser.value = null
    }

    override fun getToken(): String? {
        return _currentUser.value?.token
    }
}