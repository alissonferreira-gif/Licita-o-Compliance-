import 'package:firebase_analytics/firebase_analytics.dart';

class AnalyticsHelper {
  static final _analytics = FirebaseAnalytics.instance;

  static Future<void> logAppOpen() async {
    await _analytics.logAppOpen();
  }

  static Future<void> logOnboardingCompleted() async {
    await _analytics.logEvent(name: 'onboarding_completed');
  }

  static Future<void> logPermissionGranted(String permissionType) async {
    await _analytics.logEvent(
      name: 'permission_granted',
      parameters: {'permission_type': permissionType},
    );
  }

  static Future<void> logReportSent(String numberType) async {
    await _analytics.logEvent(
      name: 'report_sent',
      parameters: {'number_type': numberType},
    );
  }

  static Future<void> logVerifyDone(String classificationLevel) async {
    await _analytics.logEvent(
      name: 'verify_done',
      parameters: {'classification': classificationLevel},
    );
  }

  static Future<void> logAutoBlockTriggered() async {
    await _analytics.logEvent(name: 'auto_block_triggered');
  }

  static Future<void> logAdShown(String adType) async {
    await _analytics.logEvent(
      name: 'ad_shown',
      parameters: {'ad_type': adType},
    );
  }

  static Future<void> logAdClicked(String adType) async {
    await _analytics.logEvent(
      name: 'ad_clicked',
      parameters: {'ad_type': adType},
    );
  }

  static Future<void> logShareApp() async {
    await _analytics.logEvent(name: 'share_app');
  }
}
