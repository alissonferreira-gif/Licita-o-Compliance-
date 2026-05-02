package com.semspam.app

import android.os.Bundle
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {

    private lateinit var channel: MethodChannel

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        channel = MethodChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            "com.semspam.app/calls"
        )
        channel.setMethodCallHandler { call, result ->
            MethodChannelHandler.handle(applicationContext, call, result)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        channel.setMethodCallHandler(null)
    }
}
