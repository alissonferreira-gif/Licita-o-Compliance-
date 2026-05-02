package com.semspam.app

import android.content.Context
import android.content.SharedPreferences
import com.semspam.app.models.IncomingCall
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import org.json.JSONArray
import org.json.JSONObject

object MethodChannelHandler {

    private const val CALL_LOG_PREFS = "semspam_call_log"
    private const val CALL_LOG_KEY = "entries"
    private const val MAX_LOG_ENTRIES = 50

    fun handle(context: Context, call: MethodCall, result: MethodChannel.Result) {
        when (call.method) {
            "getCallHistory" -> result.success(getCallHistory(context))
            "getNumberClassification" -> {
                val number = call.argument<String>("number")
                if (number == null) {
                    result.error("INVALID_ARGS", "number é obrigatório", null)
                } else {
                    result.success(null) // Flutter consulta Firestore diretamente
                }
            }
            "userPreferences" -> result.success(getUserPreferences(context))
            else -> result.notImplemented()
        }
    }

    fun logCall(context: Context, call: IncomingCall, score: Double) {
        val prefs = context.getSharedPreferences(CALL_LOG_PREFS, Context.MODE_PRIVATE)
        val entries = getLogEntries(prefs).let { arr ->
            JSONArray().apply {
                put(JSONObject().apply {
                    put("number", call.e164Number)
                    put("score", score)
                    put("timestamp", call.timestamp)
                    put("blocked", score >= 5 && isAutoBlockEnabled(context))
                })
                for (i in 0 until minOf(arr.length(), MAX_LOG_ENTRIES - 1)) {
                    put(arr.get(i))
                }
            }
        }
        prefs.edit().putString(CALL_LOG_KEY, entries.toString()).apply()
    }

    private fun getCallHistory(context: Context): String {
        val prefs = context.getSharedPreferences(CALL_LOG_PREFS, Context.MODE_PRIVATE)
        return prefs.getString(CALL_LOG_KEY, "[]") ?: "[]"
    }

    private fun getLogEntries(prefs: SharedPreferences): JSONArray {
        return try {
            JSONArray(prefs.getString(CALL_LOG_KEY, "[]"))
        } catch (e: Exception) {
            JSONArray()
        }
    }

    private fun getUserPreferences(context: Context): Map<String, Any> {
        val prefs = context.getSharedPreferences("FlutterSharedPreferences", Context.MODE_PRIVATE)
        return mapOf(
            "auto_block" to prefs.getBoolean("flutter.auto_block", false),
            "show_overlay" to prefs.getBoolean("flutter.show_overlay", true),
            "notify_on_block" to prefs.getBoolean("flutter.notify_on_block", true)
        )
    }

    private fun isAutoBlockEnabled(context: Context): Boolean {
        val prefs = context.getSharedPreferences("FlutterSharedPreferences", Context.MODE_PRIVATE)
        return prefs.getBoolean("flutter.auto_block", false)
    }
}
