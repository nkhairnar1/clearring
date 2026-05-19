package com.clearring.app.service

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.telecom.Call
import android.telecom.CallScreeningService
import androidx.core.app.NotificationCompat
import com.clearring.app.BuildConfig
import com.clearring.app.MainActivity
import com.clearring.app.data.api.AUTO_SCREEN_KEY
import com.clearring.app.data.api.SCREENING_THRESHOLD_KEY
import com.clearring.app.data.api.dataStore
import com.clearring.app.data.repository.ContactsRepository
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.firstOrNull
import okhttp3.OkHttpClient
import okhttp3.Request

class ClearRingScreeningService : CallScreeningService() {

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private val client = OkHttpClient()
    private val contactsRepo = ContactsRepository()

    companion object {
        private const val CHANNEL_ID = "clearring_blocked"
        private const val NOTIF_ID = 1001
        private const val DEFAULT_THRESHOLD = 80
    }

    override fun onScreenCall(callDetails: Call.Details) {
        val number = callDetails.handle?.schemeSpecificPart ?: run {
            allowCall(callDetails)
            return
        }

        scope.launch {
            try {
                val prefs = applicationContext.dataStore.data.firstOrNull()
                val autoScreen = prefs?.get(AUTO_SCREEN_KEY) ?: true
                if (!autoScreen) {
                    allowCall(callDetails)
                    return@launch
                }

                val contactName = contactsRepo.getContactName(applicationContext, number)
                if (contactName != null) {
                    allowCall(callDetails)
                    return@launch
                }

                val threshold = prefs?.get(SCREENING_THRESHOLD_KEY) ?: DEFAULT_THRESHOLD
                // Threshold > 100 means screening is disabled
                if (threshold > 100) {
                    allowCall(callDetails)
                    return@launch
                }

                val url = "${BuildConfig.BASE_URL}/numbers/lookup?number=${number}"
                val request = Request.Builder().url(url).build()
                val response = client.newCall(request).execute()

                if (response.isSuccessful) {
                    val body = response.body?.string() ?: ""
                    val isConfirmedFraud = body.contains("\"CONFIRMED_FRAUD\"")
                    val spamScore = extractSpamScore(body)
                    val riskLevel = extractRiskLevel(body)

                    if (isConfirmedFraud || spamScore >= threshold) {
                        respondToCall(
                            callDetails,
                            CallResponse.Builder()
                                .setDisallowCall(true)
                                .setRejectCall(true)
                                .setSilenceCall(false)
                                .setSkipCallLog(false)
                                .setSkipNotification(false)
                                .build()
                        )
                        showBlockedNotification(number, spamScore, riskLevel)
                    } else {
                        allowCall(callDetails)
                    }
                } else {
                    allowCall(callDetails)
                }
            } catch (e: Exception) {
                allowCall(callDetails)
            }
        }
    }

    private fun showBlockedNotification(number: String, spamScore: Int, riskLevel: String) {
        val nm = getSystemService(NotificationManager::class.java)
        if (nm.getNotificationChannel(CHANNEL_ID) == null) {
            nm.createNotificationChannel(
                NotificationChannel(CHANNEL_ID, "Blocked Calls", NotificationManager.IMPORTANCE_HIGH).apply {
                    description = "Calls blocked by ClearRing spam screening"
                }
            )
        }

        val viewIntent = PendingIntent.getActivity(
            applicationContext, 0,
            Intent(applicationContext, MainActivity::class.java).apply {
                action = "VIEW_LOOKUP"
                putExtra("number", number)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        val displayNumber = if (number.startsWith("+91") && number.length == 13)
            "+91 ${number.substring(3, 8)} ${number.substring(8)}" else number
        val riskDisplay = riskLevel.replace("_", " ")

        val notif = NotificationCompat.Builder(applicationContext, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle("ClearRing blocked a call")
            .setContentText("From $displayNumber · Score: $spamScore/100 · $riskDisplay")
            .setStyle(NotificationCompat.BigTextStyle()
                .bigText("Incoming call from $displayNumber was blocked.\nSpam Score: $spamScore/100 · Risk: $riskDisplay"))
            .addAction(0, "View details", viewIntent)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()

        nm.notify(NOTIF_ID, notif)
    }

    private fun allowCall(callDetails: Call.Details) {
        respondToCall(callDetails, CallResponse.Builder().setDisallowCall(false).build())
    }

    private fun extractSpamScore(json: String): Int {
        val regex = "\"spamScore\":(\\d+)".toRegex()
        return regex.find(json)?.groupValues?.getOrNull(1)?.toIntOrNull() ?: 0
    }

    private fun extractRiskLevel(json: String): String {
        val regex = "\"riskLevel\":\"([^\"]+)\"".toRegex()
        return regex.find(json)?.groupValues?.getOrNull(1) ?: "UNKNOWN"
    }

    override fun onDestroy() {
        super.onDestroy()
        scope.cancel()
    }
}
