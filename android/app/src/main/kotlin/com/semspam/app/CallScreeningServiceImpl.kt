package com.semspam.app

import android.telecom.Call
import android.telecom.CallScreeningService
import android.util.Log
import com.google.firebase.firestore.FirebaseFirestore
import com.semspam.app.models.IncomingCall
import kotlinx.coroutines.*

class CallScreeningServiceImpl : CallScreeningService() {

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private val db = FirebaseFirestore.getInstance()

    override fun onScreenCall(callDetails: Call.Details) {
        val raw = callDetails.handle?.schemeSpecificPart ?: run {
            respondToCall(callDetails, CallResponse.Builder().build())
            return
        }

        val normalized = normalizeToE164BR(raw)
        if (normalized == null) {
            respondToCall(callDetails, CallResponse.Builder().build())
            return
        }

        scope.launch {
            try {
                val classification = withTimeout(1500L) {
                    checkNumberClassification(normalized)
                }
                val autoBlock = isAutoBlockEnabled()
                val responseBuilder = CallResponse.Builder()

                when {
                    classification.score >= 5 && autoBlock -> {
                        responseBuilder
                            .setDisallowCall(true)
                            .setRejectCall(true)
                            .setSkipNotification(false)
                        CallReceiver.logBlockedCall(applicationContext, normalized, classification.score)
                        Log.i(TAG, "Chamada bloqueada: $normalized (score=${classification.score})")
                    }
                    classification.score >= 5 -> {
                        showSpamNotification(normalized, classification.score)
                        responseBuilder.setSkipNotification(false)
                    }
                    else -> {
                        responseBuilder.setSkipNotification(false)
                    }
                }

                respondToCall(callDetails, responseBuilder.build())
                MethodChannelHandler.logCall(
                    applicationContext,
                    IncomingCall(normalized, raw),
                    classification.score
                )
            } catch (e: TimeoutCancellationException) {
                // Timeout: deixa a chamada passar e loga localmente
                Log.w(TAG, "Timeout ao verificar $normalized — chamada liberada")
                respondToCall(callDetails, CallResponse.Builder().build())
            } catch (e: Exception) {
                Log.e(TAG, "Erro ao verificar $normalized", e)
                respondToCall(callDetails, CallResponse.Builder().build())
            }
        }
    }

    private suspend fun checkNumberClassification(e164: String): NumberClassification {
        return suspendCancellableCoroutine { cont ->
            val docId = e164.removePrefix("+")
            db.collection("reported_numbers").document(docId).get()
                .addOnSuccessListener { doc ->
                    if (doc.exists()) {
                        val score = (doc.getDouble("blocked_score") ?: 0.0)
                        val reports = (doc.getLong("total_reports") ?: 0L).toInt()
                        cont.resume(NumberClassification(score, reports)) {}
                    } else {
                        cont.resume(NumberClassification(0.0, 0)) {}
                    }
                }
                .addOnFailureListener { e ->
                    cont.resumeWithException(e)
                }
        }
    }

    private fun isAutoBlockEnabled(): Boolean {
        val prefs = applicationContext.getSharedPreferences("FlutterSharedPreferences", MODE_PRIVATE)
        return prefs.getBoolean("flutter.auto_block", false)
    }

    private fun showSpamNotification(number: String, score: Double) {
        NotificationHelper.showSpamOverlay(applicationContext, number, score)
    }

    override fun onDestroy() {
        super.onDestroy()
        scope.cancel()
    }

    companion object {
        private const val TAG = "SemSpamScreening"

        fun normalizeToE164BR(raw: String): String? {
            val digits = raw.filter { it.isDigit() }
            return when {
                digits.startsWith("55") && digits.length in 12..13 -> "+$digits"
                digits.startsWith("0") && digits.length in 11..12 -> "+55${digits.substring(1)}"
                digits.length in 10..11 -> "+55$digits"
                else -> null
            }
        }
    }

    data class NumberClassification(val score: Double, val totalReports: Int)
}
