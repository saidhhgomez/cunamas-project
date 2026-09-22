        package com.example.cunamas.core.auth.presentation.splash

        import androidx.lifecycle.ViewModel
        import androidx.lifecycle.viewModelScope
        import com.example.cunamas.core.auth.domain.AuthRepository
        import com.example.cunamas.core.auth.domain.User
        import kotlinx.coroutines.flow.MutableStateFlow
        import kotlinx.coroutines.flow.StateFlow
        import kotlinx.coroutines.launch

        sealed class SplashState {
            object Loading : SplashState()
            data class SesionActiva(val user: User) : SplashState()
            object SinSesion : SplashState()
        }

        class SplashViewModel(
            private val repository: AuthRepository
        ) : ViewModel() {

            private val _state = MutableStateFlow<SplashState>(SplashState.Loading)
            val state: StateFlow<SplashState> = _state

            init {
                viewModelScope.launch {
                    val result = repository.restoreSession()
                    _state.value = result.fold(
                        onSuccess = { SplashState.SesionActiva(it) },
                        onFailure = { SplashState.SinSesion }
                    )
                }
            }
        }