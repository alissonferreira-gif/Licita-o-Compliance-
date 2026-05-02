package com.semspam.app

import android.app.Activity
import android.app.role.RoleManager
import android.content.Context
import android.content.Intent
import android.os.Build
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel

object RoleHandler {

    const val REQUEST_CODE_ROLE = 7821
    private var pendingResult: MethodChannel.Result? = null

    fun handle(activity: Activity, call: MethodCall, result: MethodChannel.Result) {
        when (call.method) {
            "isCallScreeningRoleSupported" -> {
                result.success(Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q)
            }
            "isCallScreeningRoleHeld" -> {
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                    result.success(false)
                    return
                }
                val rm = activity.getSystemService(Context.ROLE_SERVICE) as RoleManager
                result.success(rm.isRoleHeld(RoleManager.ROLE_CALL_SCREENING))
            }
            "requestCallScreeningRole" -> {
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
                    result.success(false)
                    return
                }
                val rm = activity.getSystemService(Context.ROLE_SERVICE) as RoleManager
                if (!rm.isRoleAvailable(RoleManager.ROLE_CALL_SCREENING)) {
                    result.success(false)
                    return
                }
                if (rm.isRoleHeld(RoleManager.ROLE_CALL_SCREENING)) {
                    result.success(true)
                    return
                }
                pendingResult = result
                val intent = rm.createRequestRoleIntent(RoleManager.ROLE_CALL_SCREENING)
                activity.startActivityForResult(intent, REQUEST_CODE_ROLE)
            }
            else -> result.notImplemented()
        }
    }

    fun handleActivityResult(requestCode: Int, resultCode: Int) {
        if (requestCode != REQUEST_CODE_ROLE) return
        pendingResult?.success(resultCode == Activity.RESULT_OK)
        pendingResult = null
    }
}
