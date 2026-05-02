package com.semspam.app

import android.content.Intent
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {

    private lateinit var callsChannel: MethodChannel
    private lateinit var roleChannel: MethodChannel

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        callsChannel = MethodChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            "com.semspam.app/calls"
        )
        callsChannel.setMethodCallHandler { call, result ->
            MethodChannelHandler.handle(applicationContext, call, result)
        }

        roleChannel = MethodChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            "com.semspam.app/role"
        )
        roleChannel.setMethodCallHandler { call, result ->
            RoleHandler.handle(this, call, result)
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        RoleHandler.handleActivityResult(requestCode, resultCode)
    }

    override fun onDestroy() {
        super.onDestroy()
        callsChannel.setMethodCallHandler(null)
        roleChannel.setMethodCallHandler(null)
    }
}
