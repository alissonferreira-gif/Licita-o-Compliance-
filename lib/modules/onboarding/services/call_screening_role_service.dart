import 'package:flutter/services.dart';

class CallScreeningRoleService {
  static const _channel = MethodChannel('com.semspam.app/role');

  /// Retorna true se o app já é o Call Screening role atual.
  static Future<bool> isHeld() async {
    try {
      return await _channel.invokeMethod<bool>('isCallScreeningRoleHeld') ?? false;
    } on PlatformException {
      return false;
    }
  }

  /// Solicita ao usuário aprovar o app como Call Screening role.
  /// Retorna true se aprovado, false caso contrário.
  static Future<bool> request() async {
    try {
      return await _channel.invokeMethod<bool>('requestCallScreeningRole') ?? false;
    } on PlatformException {
      return false;
    }
  }

  /// Retorna true se o dispositivo suporta CallScreeningService (Android 10+).
  static Future<bool> isSupported() async {
    try {
      return await _channel.invokeMethod<bool>('isCallScreeningRoleSupported') ?? false;
    } on PlatformException {
      return false;
    }
  }
}
