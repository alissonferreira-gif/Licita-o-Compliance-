import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ConsentService {
  /// Solicita consentimento se necessário, mostra form UMP, e completa.
  /// Retorna true quando o consent flow terminou (positivo ou negativo).
  Future<bool> requestConsentIfNeeded() async {
    final params = ConsentRequestParameters();
    final completer = _Completer();

    ConsentInformation.instance.requestConsentInfoUpdate(
      params,
      () async {
        final isFormAvailable =
            await ConsentInformation.instance.isConsentFormAvailable();
        if (isFormAvailable) {
          await _loadAndShowFormIfRequired();
        }
        completer.complete();
      },
      (FormError error) {
        // Falha silenciosa: continua sem consentimento personalizado
        completer.complete();
      },
    );

    await completer.future;
    return true;
  }

  Future<void> _loadAndShowFormIfRequired() async {
    final status = await ConsentInformation.instance.getConsentStatus();
    if (status == ConsentStatus.required) {
      await ConsentForm.loadAndShowConsentFormIfRequired(
        (FormError? error) {},
      );
    }
  }

  /// Permite reabrir o form depois (botão "Privacidade" nas settings).
  Future<void> showPrivacyOptionsForm() async {
    await ConsentForm.showPrivacyOptionsForm((FormError? error) {});
  }

  /// Verifica se já podemos mostrar anúncios.
  Future<bool> canRequestAds() async {
    return ConsentInformation.instance.canRequestAds();
  }
}

// Simples helper para converter callback em Future sem import de async
class _Completer {
  bool _completed = false;
  void Function()? _onComplete;

  void complete() {
    _completed = true;
    _onComplete?.call();
  }

  Future<void> get future async {
    if (_completed) return;
    await Future.doWhile(() async {
      await Future.delayed(const Duration(milliseconds: 50));
      return !_completed;
    });
  }
}

final consentServiceProvider = Provider<ConsentService>((ref) => ConsentService());
