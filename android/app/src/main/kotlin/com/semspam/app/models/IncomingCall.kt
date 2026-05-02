package com.semspam.app.models

data class IncomingCall(
    val e164Number: String,
    val rawNumber: String,
    val timestamp: Long = System.currentTimeMillis()
)
