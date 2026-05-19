package com.clearring.app.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "recent_lookups")
data class LookupEntity(
    @PrimaryKey val e164Number: String,
    val spamScore: Int,
    val riskLevel: String,
    val category: String?,
    val isVerified: Boolean,
    val totalReports: Int,
    val businessName: String?,
    val isKnownContact: Boolean,
    val contactName: String?,
    val lookedUpAt: Long = System.currentTimeMillis(),
)
