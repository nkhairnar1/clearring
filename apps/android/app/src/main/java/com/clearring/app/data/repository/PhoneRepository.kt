package com.clearring.app.data.repository

import com.clearring.app.data.api.ApiService
import com.clearring.app.data.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

sealed class Result<out T> {
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val message: String, val code: Int = 0) : Result<Nothing>()
}

@Singleton
class PhoneRepository @Inject constructor(private val api: ApiService) {

    suspend fun lookup(number: String): Result<LookupResponse> = withContext(Dispatchers.IO) {
        try {
            val resp = api.lookupNumber(number)
            if (resp.isSuccessful) Result.Success(resp.body()!!)
            else Result.Error("Lookup failed: ${resp.code()}", resp.code())
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    suspend fun reportNumber(request: ReportRequest): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val resp = api.reportNumber(request)
            if (resp.isSuccessful) Result.Success(Unit)
            else Result.Error("Report failed: ${resp.code()}", resp.code())
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    suspend fun blockNumber(e164: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val resp = api.blockNumber(mapOf("phoneNumber" to e164))
            if (resp.isSuccessful) Result.Success(Unit)
            else Result.Error("Block failed: ${resp.code()}", resp.code())
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    suspend fun claimBusiness(request: BusinessClaimRequest): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val resp = api.claimBusiness(request)
            if (resp.isSuccessful) Result.Success(Unit)
            else Result.Error("Claim failed: ${resp.code()}", resp.code())
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    suspend fun getBlockedNumbers(): Result<List<PhoneNumberSummary>> = withContext(Dispatchers.IO) {
        try {
            val resp = api.getBlockedNumbers()
            if (resp.isSuccessful) Result.Success(resp.body() ?: emptyList())
            else Result.Error("Failed to fetch blocked numbers: ${resp.code()}", resp.code())
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    suspend fun unblockNumber(id: String): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val resp = api.unblockNumber(id)
            if (resp.isSuccessful) Result.Success(Unit)
            else Result.Error("Unblock failed: ${resp.code()}", resp.code())
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    suspend fun getMyReports(page: Int = 1): Result<MyReportsResponse> = withContext(Dispatchers.IO) {
        try {
            val resp = api.getMyReports(page = page, limit = 20)
            if (resp.isSuccessful) Result.Success(resp.body()!!)
            else Result.Error("Failed to fetch reports: ${resp.code()}", resp.code())
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }
}

@Singleton
class AuthRepository @Inject constructor(private val api: ApiService) {

    suspend fun sendOtp(email: String): Result<String?> = withContext(Dispatchers.IO) {
        try {
            val resp = api.sendOtp(EmailOtpRequest(email))
            if (resp.isSuccessful) Result.Success(resp.body()?.devOtp)
            else Result.Error("Failed to send OTP", resp.code())
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    suspend fun verifyOtp(email: String, otp: String): Result<AuthResponseData> = withContext(Dispatchers.IO) {
        try {
            val resp = api.verifyOtp(EmailOtpVerifyRequest(email, otp))
            if (resp.isSuccessful) {
                val data = resp.body()?.data ?: return@withContext Result.Error("Empty response")
                Result.Success(data)
            } else Result.Error("Invalid OTP", resp.code())
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    suspend fun savePhone(phoneNumber: String): Result<User> = withContext(Dispatchers.IO) {
        try {
            val resp = api.savePhone(SavePhoneRequest(phoneNumber))
            if (resp.isSuccessful) {
                val user = resp.body()?.data ?: return@withContext Result.Error("Empty response")
                Result.Success(user)
            } else Result.Error("Failed to save phone", resp.code())
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }

    suspend fun getMe(): Result<User> = withContext(Dispatchers.IO) {
        try {
            val resp = api.getMe()
            if (resp.isSuccessful) {
                val user = resp.body()?.data ?: return@withContext Result.Error("No user data")
                Result.Success(user)
            } else Result.Error("Failed to get user", resp.code())
        } catch (e: Exception) {
            Result.Error(e.message ?: "Network error")
        }
    }
}
