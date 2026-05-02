class AppConstants {
  static const String appName = 'SemSpam';
  static const String appVersion = '1.0.0';

  // Firestore collections
  static const String collectionReportedNumbers = 'reported_numbers';
  static const String collectionUserReports = 'user_reports';
  static const String collectionAppStats = 'app_stats';
  static const String docGlobalStats = 'global';

  // Cache TTL
  static const Duration cacheTtl = Duration(days: 7);
  static const Duration callScreeningTimeout = Duration(milliseconds: 1500);

  // MethodChannel
  static const String methodChannel = 'com.semspam.app/calls';
  static const String methodGetCallHistory = 'getCallHistory';
  static const String methodGetClassification = 'getNumberClassification';
  static const String methodGetPreferences = 'userPreferences';

  // SharedPreferences keys
  static const String prefOnboardingDone = 'onboarding_done';
  static const String prefAutoBlock = 'auto_block';
  static const String prefShowOverlay = 'show_overlay';
  static const String prefNotifyOnBlock = 'notify_on_block';
  static const String prefLastInterstitialAt = 'last_interstitial_at';
  static const String prefBlockedCount = 'blocked_count_month';

  // Score thresholds
  static const int scoreAutoBlockThreshold = 5;
  static const int scoreSuspiciousThreshold = 3;

  // Reporte limits
  static const int maxCommentLength = 200;
  static const Duration interstitialCooldown = Duration(hours: 24);
  static const int maxReportsPerDay = 10;

  // Estimativa de tempo economizado por chamada bloqueada
  static const int secondsPerBlockedCall = 30;

  // Phone regex BR
  static const String phoneRegexBR = r'^\+55[0-9]{10,11}$';
}
