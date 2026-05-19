package com.clearring.app.data.local

import androidx.room.Database
import androidx.room.RoomDatabase

@Database(entities = [LookupEntity::class], version = 1, exportSchema = false)
abstract class ClearRingDatabase : RoomDatabase() {
    abstract fun lookupDao(): LookupDao
}
