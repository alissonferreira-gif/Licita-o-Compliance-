import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/constants.dart';
import '../../core/utils/analytics_helper.dart';

class AdsService {
  static String get bannerHomeId {
    if (kDebugMode) return 'ca-app-pub-3940256099942544/6300978111';
    return dotenv.env['ADMOB_BANNER_ID_HOME'] ?? '';
  }

  static String get interstitialVerifyId {
    if (kDebugMode) return 'ca-app-pub-3940256099942544/1033173712';
    return dotenv.env['ADMOB_INTERSTITIAL_ID_VERIFY'] ?? '';
  }

  static Future<void> initialize() async {
    await MobileAds.instance.initialize();
  }

  static Future<bool> _canShowInterstitial() async {
    final prefs = await SharedPreferences.getInstance();
    final lastShown = prefs.getInt(AppConstants.prefLastInterstitialAt);
    if (lastShown == null) return true;
    final diff = DateTime.now().millisecondsSinceEpoch - lastShown;
    return diff > AppConstants.interstitialCooldown.inMilliseconds;
  }

  static Future<void> showInterstitialIfAllowed() async {
    if (!await _canShowInterstitial()) return;

    InterstitialAd.load(
      adUnitId: interstitialVerifyId,
      request: const AdRequest(),
      adLoadCallback: InterstitialAdLoadCallback(
        onAdLoaded: (ad) async {
          ad.fullScreenContentCallback = FullScreenContentCallback(
            onAdShowedFullScreenContent: (_) async {
              await AnalyticsHelper.logAdShown('interstitial');
              final prefs = await SharedPreferences.getInstance();
              await prefs.setInt(
                AppConstants.prefLastInterstitialAt,
                DateTime.now().millisecondsSinceEpoch,
              );
            },
            onAdFailedToShowFullScreenContent: (ad, _) => ad.dispose(),
            onAdDismissedFullScreenContent: (ad) => ad.dispose(),
          );
          ad.show();
        },
        onAdFailedToLoad: (_) {},
      ),
    );
  }
}
