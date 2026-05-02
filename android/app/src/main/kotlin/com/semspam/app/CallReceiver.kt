package com.semspam.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.TelephonyManager
import android.util.Log
import com.google.firebase.firestore.FirebaseFirestore

// Fallback para Android < 10 sem CallScreeningService funcional
class CallReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != TelephonyManager.ACTION_PHONE_STATE_CHANGED) return

        val state = intent.getStringExtra(TelephonyManager.EXTRA_STATE) ?: return
        if (state != TelephonyManager.EXTRA_STATE_RINGING) return

        @Suppress("DEPRECATION")
        val number = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER) ?: return
        val normalized = CallScreeningServiceImpl.normalizeToE164BR(number) ?: return

        Log.d(TAG, "CallReceiver: chamada recebida de $normalized")
        checkAndNotify(context, normalized)
    }

    private fun checkAndNotify(context: Context, e164: String) {
        val docId = e164.removePrefix("+")
        FirebaseFirestore.getInstance()
            .collection("reported_numbers")
            .document(docId)
            .get()
            .addOnSuccessListener { doc ->
                if (doc.exists()) {
                    val score = doc.getDouble("blocked_score") ?: 0.0
                    if (score >= 3.0) {
                        NotificationHelper.showSpamOverlay(context, e164, score)
                    }
                }
            }
    }

    companion object {
        private const val TAG = "SemSpamReceiver"

        fun logBlockedCall(context: Context, e164: String, score: Double) {
            Log.i(TAG, "Chamada bloqueada e logada: $e164 (score=$score)")
            NotificationHelper.showBlockedNotification(context, e164)
        }
    }
}
