package com.clearring.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class ClearRingApp : Application() {

    override fun onCreate() {
        super.onCreate()
        registerNotificationChannels()
    }

    private fun registerNotificationChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val nm = getSystemService(NotificationManager::class.java)

        nm.createNotificationChannels(
            listOf(
                NotificationChannel(
                    CHANNEL_SCREENING,
                    "Call Screening",
                    NotificationManager.IMPORTANCE_HIGH,
                ).apply {
                    description = "Alerts for screened or blocked incoming calls"
                    enableVibration(true)
                },
                NotificationChannel(
                    CHANNEL_REPORTS,
                    "Report Updates",
                    NotificationManager.IMPORTANCE_DEFAULT,
                ).apply {
                    description = "Updates when numbers you reported change status"
                },
                NotificationChannel(
                    CHANNEL_GENERAL,
                    "General",
                    NotificationManager.IMPORTANCE_LOW,
                ).apply {
                    description = "Miscellaneous ClearRing notifications"
                },
            )
        )
    }

    companion object {
        const val CHANNEL_SCREENING = "clearring_screening"
        const val CHANNEL_REPORTS   = "clearring_reports"
        const val CHANNEL_GENERAL   = "clearring_general"
    }
}
