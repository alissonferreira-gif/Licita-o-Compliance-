import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'shared/services/ads_service.dart';
import 'shared/services/auth_service.dart';
import 'core/utils/analytics_helper.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await dotenv.load(fileName: '.env');

  await Firebase.initializeApp();

  await AdsService.initialize();

  // Login anônimo imediato — sem bloquear UI
  final container = ProviderContainer();
  container.read(authServiceProvider).signInAnonymously().catchError((_) {});

  await AnalyticsHelper.logAppOpen();

  runApp(
    UncontrolledProviderScope(
      container: container,
      child: const SemSpamApp(),
    ),
  );
}
