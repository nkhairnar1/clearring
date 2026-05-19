package com.clearring.app.viewmodel

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clearring.app.data.local.LookupDao
import com.clearring.app.data.local.LookupEntity
import com.clearring.app.data.model.BusinessClaimRequest
import com.clearring.app.data.model.LookupResponse
import com.clearring.app.data.model.ReportRequest
import com.clearring.app.data.repository.ContactsRepository
import com.clearring.app.data.repository.PhoneRepository
import com.clearring.app.data.repository.Result
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class LookupViewModel @Inject constructor(
    private val repo: PhoneRepository,
    private val contactsRepo: ContactsRepository,
    private val lookupDao: LookupDao,
    @ApplicationContext private val context: Context,
) : ViewModel() {

    private val _lookupState = MutableStateFlow<LookupState>(LookupState.Idle)
    val lookupState: StateFlow<LookupState> = _lookupState

    private val _reportState = MutableStateFlow<ReportState>(ReportState.Idle)
    val reportState: StateFlow<ReportState> = _reportState

    private val _claimState = MutableStateFlow<ClaimState>(ClaimState.Idle)
    val claimState: StateFlow<ClaimState> = _claimState

    val recentLookups = mutableListOf<LookupResponse>()

    // Persisted recent lookups from Room (for stats)
    val persistedLookups = lookupDao.getAllFlow()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun lookup(number: String) {
        viewModelScope.launch {
            _lookupState.value = LookupState.Loading
            _lookupState.value = when (val result = repo.lookup(number)) {
                is Result.Success -> {
                    val contactName = contactsRepo.getContactName(context, number)
                    val enriched = result.data.copy(
                        isKnownContact = contactName != null,
                        contactName = contactName,
                    )
                    // Update in-memory list for UI
                    recentLookups.removeAll { it.e164 == enriched.e164 }
                    recentLookups.add(0, enriched)
                    if (recentLookups.size > 50) recentLookups.removeAt(recentLookups.lastIndex)

                    // Persist to Room
                    lookupDao.upsert(
                        LookupEntity(
                            e164Number = enriched.e164,
                            spamScore = enriched.spamScore,
                            riskLevel = enriched.riskLevel,
                            category = enriched.category,
                            isVerified = enriched.isVerified,
                            totalReports = enriched.totalReports,
                            businessName = enriched.businessProfile?.businessName,
                            isKnownContact = enriched.isKnownContact,
                            contactName = enriched.contactName,
                        )
                    )

                    LookupState.Success(enriched)
                }
                is Result.Error -> LookupState.Error(result.message)
            }
        }
    }

    fun reportNumber(request: ReportRequest) {
        viewModelScope.launch {
            _reportState.value = ReportState.Loading
            _reportState.value = when (val result = repo.reportNumber(request)) {
                is Result.Success -> ReportState.Success
                is Result.Error -> ReportState.Error(result.message)
            }
        }
    }

    fun blockNumber(e164: String) {
        viewModelScope.launch {
            repo.blockNumber(e164)
            lookupDao.delete(e164)
        }
    }

    fun claimBusiness(request: BusinessClaimRequest) {
        viewModelScope.launch {
            _claimState.value = ClaimState.Loading
            _claimState.value = when (val result = repo.claimBusiness(request)) {
                is Result.Success -> ClaimState.Success
                is Result.Error -> ClaimState.Error(result.message)
            }
        }
    }

    fun clearHistory() {
        viewModelScope.launch {
            lookupDao.clearAll()
            recentLookups.clear()
        }
    }

    fun resetLookup() { _lookupState.value = LookupState.Idle }
    fun resetReport() { _reportState.value = ReportState.Idle }
    fun resetClaim() { _claimState.value = ClaimState.Idle }
}

sealed class LookupState {
    object Idle : LookupState()
    object Loading : LookupState()
    data class Success(val data: LookupResponse) : LookupState()
    data class Error(val message: String) : LookupState()
}

sealed class ReportState {
    object Idle : ReportState()
    object Loading : ReportState()
    object Success : ReportState()
    data class Error(val message: String) : ReportState()
}

sealed class ClaimState {
    object Idle : ClaimState()
    object Loading : ClaimState()
    object Success : ClaimState()
    data class Error(val message: String) : ClaimState()
}
