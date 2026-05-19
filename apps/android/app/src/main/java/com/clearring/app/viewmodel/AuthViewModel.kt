package com.clearring.app.viewmodel

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clearring.app.data.api.TOKEN_KEY
import com.clearring.app.data.api.dataStore
import com.clearring.app.data.model.User
import com.clearring.app.data.repository.AuthRepository
import com.clearring.app.data.repository.Result
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val repo: AuthRepository,
    @ApplicationContext private val context: Context,
) : ViewModel() {

    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
    val uiState: StateFlow<AuthUiState> = _uiState

    private val _user = MutableStateFlow<User?>(null)
    val user: StateFlow<User?> = _user

    fun sendOtp(email: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            _uiState.value = when (val result = repo.sendOtp(email)) {
                is Result.Success -> AuthUiState.OtpSent(result.data)
                is Result.Error -> AuthUiState.Error(result.message)
            }
        }
    }

    fun verifyOtp(email: String, otp: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            when (val result = repo.verifyOtp(email, otp)) {
                is Result.Success -> {
                    context.dataStore.edit { it[TOKEN_KEY] = result.data.accessToken }
                    _user.value = result.data.user
                    _uiState.value = if (result.data.isNewUser) AuthUiState.NeedsPhone else AuthUiState.Authenticated
                }
                is Result.Error -> _uiState.value = AuthUiState.Error(result.message)
            }
        }
    }

    fun savePhone(phoneNumber: String) {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            when (val result = repo.savePhone(phoneNumber)) {
                is Result.Success -> {
                    _user.value = result.data
                    _uiState.value = AuthUiState.Authenticated
                }
                is Result.Error -> _uiState.value = AuthUiState.Error(result.message)
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            context.dataStore.edit { it.remove(TOKEN_KEY) }
            _user.value = null
            _uiState.value = AuthUiState.Idle
        }
    }

    fun checkAuth() {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            val token = context.dataStore.data.firstOrNull()?.get(TOKEN_KEY)
            if (token != null) {
                _uiState.value = when (repo.getMe()) {
                    is Result.Success -> AuthUiState.Authenticated
                    is Result.Error -> {
                        context.dataStore.edit { it.remove(TOKEN_KEY) }
                        AuthUiState.Idle
                    }
                }
            } else {
                _uiState.value = AuthUiState.Idle
            }
        }
    }

    fun skipPhone() { _uiState.value = AuthUiState.Authenticated }

    fun reset() { _uiState.value = AuthUiState.Idle }
}

sealed class AuthUiState {
    object Idle : AuthUiState()
    object Loading : AuthUiState()
    data class OtpSent(val devOtp: String? = null) : AuthUiState()
    object NeedsPhone : AuthUiState()
    object Authenticated : AuthUiState()
    data class Error(val message: String) : AuthUiState()
}
