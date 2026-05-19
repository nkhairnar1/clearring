package com.clearring.app.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface LookupDao {

    @Query("SELECT * FROM recent_lookups ORDER BY lookedUpAt DESC LIMIT 50")
    fun getAllFlow(): Flow<List<LookupEntity>>

    @Query("SELECT * FROM recent_lookups ORDER BY lookedUpAt DESC LIMIT 50")
    suspend fun getAll(): List<LookupEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(entity: LookupEntity)

    @Query("DELETE FROM recent_lookups WHERE e164Number = :e164")
    suspend fun delete(e164: String)

    @Query("DELETE FROM recent_lookups")
    suspend fun clearAll()

    @Query("SELECT COUNT(*) FROM recent_lookups")
    suspend fun count(): Int
}
