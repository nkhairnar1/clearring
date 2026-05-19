package com.clearring.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clearring.app.data.repository.PhoneRepository
import com.clearring.app.data.repository.Result
import com.clearring.app.ui.screens.BlockedState
import com.clearring.app.ui.screens.UnblockState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class BlockedNumbersViewModel @Inject constructor(
    private val repo: PhoneRepository,
) : ViewModel() {

    private val _state = MutableStateFlow<BlockedState>(BlockedState.Loading)
    val state: StateFlow<BlockedState> = _state

    private val _unblockState = MutableStateFlow<UnblockState>(UnblockState.Idle)
    val unblockState: StateFlow<UnblockState> = _unblockState

    fun load() {
        viewModelScope.launch {
            _state.value = BlockedState.Loading
            _state.value = when (val result = repo.getBlockedNumbers()) {
                is Result.Success -> BlockedState.Success(result.data)
                is Result.Error -> BlockedState.Error(result.message)
            }
        }
    }

    fun unblock(id: String) {
        viewModelScope.launch {
            _unblockState.value = UnblockState.Loading
            _unblockState.value = when (val result = repo.unblockNumber(id)) {
                is Result.Success -> UnblockState.Success
                is Result.Error -> UnblockState.Error(result.message)
            }
        }
    }
}
