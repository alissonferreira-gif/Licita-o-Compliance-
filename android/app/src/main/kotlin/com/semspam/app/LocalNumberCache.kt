package com.semspam.app

import android.content.Context
import org.json.JSONObject

object LocalNumberCache {

    private const val PREFS = "semspam_number_cache"
    private const val TTL_MS = 7L * 24 * 60 * 60 * 1000  // 7 dias

    data class CacheEntry(val score: Double, val totalReports: Int, val cachedAt: Long) {
        fun isFresh(): Boolean = System.currentTimeMillis() - cachedAt < TTL_MS
    }

    fun get(context: Context, e164: String): CacheEntry? {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val raw = prefs.getString(e164, null) ?: return null
        return try {
            val obj = JSONObject(raw)
            val entry = CacheEntry(
                score = obj.getDouble("score"),
                totalReports = obj.getInt("totalReports"),
                cachedAt = obj.getLong("cachedAt")
            )
            if (entry.isFresh()) entry else null
        } catch (e: Exception) {
            null
        }
    }

    fun put(context: Context, e164: String, score: Double, totalReports: Int) {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val obj = JSONObject().apply {
            put("score", score)
            put("totalReports", totalReports)
            put("cachedAt", System.currentTimeMillis())
        }
        prefs.edit().putString(e164, obj.toString()).apply()
    }

    fun clear(context: Context) {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        prefs.edit().clear().apply()
    }
}
