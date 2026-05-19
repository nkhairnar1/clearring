package com.clearring.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clearring.app.data.repository.PhoneRepository
import com.clearring.app.data.repository.Result
import com.clearring.app.ui.screens.MyReportsState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MyReportsViewModel @Inject constructor(
    private val repo: PhoneRepository,
) : ViewModel() {

    private val _state = MutableStateFlow<MyReportsState>(MyReportsState.Loading)
    val state: StateFlow<MyReportsState> = _state

    fun load() {
        loadPage(1)
    }

    fun loadPage(page: Int) {
        viewModelScope.launch {
            _state.value = MyReportsState.Loading
            _state.value = when (val result = repo.getMyReports(page)) {
                is Result.Success -> MyReportsState.Success(
                    reports = result.data.data,
                    total = result.data.total,
                    page = result.data.page,
                    totalPages = result.data.totalPages,
                )
                is Result.Error -> MyReportsState.Error(result.message)
            }
        }
    }
}
