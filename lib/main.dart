import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'shared/services/ads_service.dart';
import 'shared/services/auth_service.dart';
import 'shared/services/consent_service.dart';
import 'core/utils/analytics_helper.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await dotenv.load(fileName: '.env');

  // firebase_options.dart é gerado por `flutterfire configure`
  // Se não existir ainda, Firebase.initializeApp() usa google-services.json
  await Firebase.initializeApp();

  // 1) UMP Consent (LGPD/GDPR) ANTES de inicializar AdMob
  final consent = ConsentService();
  await consent.requestConsentIfNeeded();
  final canRequestAds = await consent.canRequestAds();

  // 2) Inicializa AdMob só se autorizado pelo consent
  if (canRequestAds) {
    await AdsService.initialize();
  }

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
