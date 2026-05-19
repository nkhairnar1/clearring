package com.clearring.app.data.model

import com.google.gson.annotations.SerializedName

data class PhoneNumberSummary(
    val id: String = "",
    @SerializedName("e164Number") val e164Number: String = "",
    val spamScore: Int = 0,
    val riskLevel: String = "SAFE",
    val category: String? = null,
    val isVerified: Boolean = false,
    val totalReports: Int = 0,
    val adminOverrideStatus: String? = null,
    val businessProfile: BusinessProfile? = null,
)

data class BusinessProfile(
    val id: String,
    val businessName: String,
    val category: String? = null,
    val verificationStatus: String? = null,
    val website: String? = null,
    val address: String? = null,
    val city: String? = null,
    val state: String? = null,
    val country: String? = null,
    val callReasons: List<CallReason> = emptyList(),
)

data class CallReason(
    val id: String,
    val reasonTitle: String? = null,
    val reasonDescription: String? = null,
    val isActive: Boolean = true,
)

data class RecentReport(
    val reportType: String,
    val reportedAt: String,
)

data class LookupResponse(
    val number: String = "",
    val e164: String = "",
    val label: String = "",
    val category: String? = null,
    val riskLevel: String = "SAFE",
    val spamScore: Int = 10,
    val isVerified: Boolean = false,
    val verificationType: String? = null,
    val sourceType: String? = null,
    val totalReports: Int = 0,
    val fraudReports: Int = 0,
    val scamReports: Int = 0,
    val spamReports: Int = 0,
    val safeReports: Int = 0,
    val lastReportedAt: String? = null,
    val adminOverrideStatus: String? = null,
    val numberType: String? = null,
    val callerName: String? = null,
    val similarNumbersHighRisk: Int = 0,
    val lookupCount: Int = 0,
    val firstSeenAt: String? = null,
    val warnings: List<String> = emptyList(),
    val trustSignals: List<String> = emptyList(),
    val recentReports: List<RecentReport> = emptyList(),
    val businessProfile: BusinessProfile? = null,
    val fromCache: Boolean = false,
    val isKnownContact: Boolean = false,
    val contactName: String? = null,
)

data class User(
    val id: String,
    val email: String,
    val phoneNumber: String? = null,
    val name: String? = null,
    val role: String,
    val trustScore: Int,
    @SerializedName("theme") val theme: String? = null,
)

data class AuthResponseData(
    val user: User,
    val accessToken: String,
    val refreshToken: String,
    val expiresIn: Int? = null,
    val isNewUser: Boolean = false,
)

data class AuthApiResponse(val success: Boolean, val data: AuthResponseData? = null)
data class UserApiResponse(val success: Boolean, val data: User? = null)

data class EmailOtpRequest(val email: String)
data class EmailOtpVerifyRequest(val email: String, val otp: String)
data class SavePhoneRequest(val phoneNumber: String)
data class SendOtpResponse(val success: Boolean, val devOtp: String? = null)

data class ReportRequest(
    val phoneNumber: String,
    val reportType: String,
    val notes: String? = null,
    val moneyRequested: Boolean? = null,
    val otpRequested: Boolean? = null,
    val threatUsed: Boolean? = null,
    val paymentLinkRequested: Boolean? = null,
)

data class BusinessClaimRequest(
    val phoneNumber: String,
    val businessName: String,
    val businessType: String? = null,
    val website: String? = null,
)

data class ApiError(val message: String, val statusCode: Int)

data class WaitlistRequest(
    val email: String,
    val phoneNumber: String? = null,
    val source: String = "android",
)

data class MyReportsResponse(
    val data: List<MyReport>,
    val total: Int,
    val page: Int,
    val totalPages: Int,
)

data class MyReport(
    val id: String,
    val reportType: String,
    val status: String,
    val notes: String?,
    val createdAt: String,
    val phoneNumber: PhoneNumberSummary? = null,
)
