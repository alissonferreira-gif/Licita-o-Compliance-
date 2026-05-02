package com.semspam.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.core.app.NotificationCompat

object NotificationHelper {

    private const val CHANNEL_SPAM = "semspam_alerts"
    private const val CHANNEL_BLOCKED = "semspam_blocked"

    fun createChannels(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        nm.createNotificationChannel(
            NotificationChannel(
                CHANNEL_SPAM,
                "Alertas de Spam",
                NotificationManager.IMPORTANCE_HIGH
            ).apply { description = "Alertas de chamadas suspeitas em tempo real" }
        )

        nm.createNotificationChannel(
            NotificationChannel(
                CHANNEL_BLOCKED,
                "Chamadas Bloqueadas",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply { description = "Notificações de chamadas bloqueadas automaticamente" }
        )
    }

    fun showSpamOverlay(context: Context, number: String, score: Double) {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val scoreLabel = when {
            score >= 8 -> "⚠️ Spam MUITO suspeito"
            score >= 5 -> "⚠️ Spam confirmado"
            else -> "⚠️ Número suspeito"
        }

        val notification = NotificationCompat.Builder(context, CHANNEL_SPAM)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentTitle(scoreLabel)
            .setContentText("Ligação de $number — toque para ver detalhes")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setAutoCancel(true)
            .build()

        nm.notify(number.hashCode(), notification)
    }

    fun showBlockedNotification(context: Context, number: String) {
        val prefs = context.getSharedPreferences("FlutterSharedPreferences", Context.MODE_PRIVATE)
        if (!prefs.getBoolean("flutter.notify_on_block", true)) return

        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val notification = NotificationCompat.Builder(context, CHANNEL_BLOCKED)
            .setSmallIcon(android.R.drawable.ic_delete)
            .setContentTitle("🛡️ Ligação bloqueada")
            .setContentText("Bloqueamos uma chamada de spam de $number")
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .build()

        nm.notify(number.hashCode() + 1000, notification)
    }
}
