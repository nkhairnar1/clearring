package com.clearring.app.data.api

import com.clearring.app.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    @GET("numbers/lookup")
    suspend fun lookupNumber(@Query("number") number: String): Response<LookupResponse>

    @POST("auth/send-otp")
    suspend fun sendOtp(@Body request: EmailOtpRequest): Response<SendOtpResponse>

    @POST("auth/verify-otp")
    suspend fun verifyOtp(@Body request: EmailOtpVerifyRequest): Response<AuthApiResponse>

    @POST("auth/save-phone")
    suspend fun savePhone(@Body request: SavePhoneRequest): Response<UserApiResponse>

    @GET("auth/me")
    suspend fun getMe(): Response<UserApiResponse>

    @POST("numbers/report")
    suspend fun reportNumber(@Body request: ReportRequest): Response<Unit>

    @POST("numbers/mark-safe")
    suspend fun markSafe(@Body body: Map<String, String>): Response<Unit>

    @POST("numbers/block")
    suspend fun blockNumber(@Body body: Map<String, String>): Response<Unit>

    @POST("business/claim")
    suspend fun claimBusiness(@Body request: BusinessClaimRequest): Response<Unit>

    @GET("business/my-claims")
    suspend fun myBusinessClaims(): Response<List<BusinessProfile>>

    @GET("users/me/blocked")
    suspend fun getBlockedNumbers(): Response<List<PhoneNumberSummary>>

    @DELETE("users/me/blocked/{id}")
    suspend fun unblockNumber(@Path("id") id: String): Response<Unit>

    @GET("users/me/reports")
    suspend fun getMyReports(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
    ): Response<MyReportsResponse>
}
