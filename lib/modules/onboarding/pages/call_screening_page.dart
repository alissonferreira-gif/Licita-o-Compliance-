import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/call_screening_role_service.dart';
import '../../../core/theme/colors.dart';
import '../../../modules/call_protection/presentation/pages/home_page.dart';
import '../../../core/utils/analytics_helper.dart';
import '../../../core/constants.dart';

class CallScreeningPage extends StatefulWidget {
  const CallScreeningPage({super.key});

  @override
  State<CallScreeningPage> createState() => _CallScreeningPageState();
}

class _CallScreeningPageState extends State<CallScreeningPage> {
  bool _isSupported = false;
  bool _isHeld = false;
  bool _isRequesting = false;
  bool _showResult = false;

  @override
  void initState() {
    super.initState();
    _checkSupport();
  }

  Future<void> _checkSupport() async {
    final supported = await CallScreeningRoleService.isSupported();
    final held = supported ? await CallScreeningRoleService.isHeld() : false;
    if (mounted) {
      setState(() {
        _isSupported = supported;
        _isHeld = held;
      });
    }
  }

  Future<void> _requestRole() async {
    setState(() => _isRequesting = true);
    final granted = await CallScreeningRoleService.request();
    if (mounted) {
      setState(() {
        _isHeld = granted;
        _isRequesting = false;
        _showResult = true;
      });
    }
    if (granted) {
      await AnalyticsHelper.logPermissionGranted('call_screening_role');
    }
  }

  Future<void> _finish() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(AppConstants.prefCallScreeningGranted, _isHeld);
    await AnalyticsHelper.logOnboardingCompleted();
    if (mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const HomePage()),
        (_) => false,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 24),
              const Text('🛡️', style: TextStyle(fontSize: 56), semanticsLabel: ''),
              const SizedBox(height: 16),
              const Text(
                'Ative a proteção completa',
                style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              if (!_isSupported) ...[
                _UnsupportedCard(),
              ] else if (_isHeld) ...[
                _GrantedCard(),
              ] else ...[
                const Text(
                  'Para bloquear chamadas spam automaticamente, o SemSpam precisa ser definido como o app de proteção de chamadas do seu celular. Isso é necessário para que o bloqueio funcione em tempo real.',
                  style: TextStyle(fontSize: 15, color: AppColors.textSecondary, height: 1.5),
                ),
                const SizedBox(height: 24),
                Card(
                  color: AppColors.suspiciousLight,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: const [
                        Text('📋', style: TextStyle(fontSize: 24), semanticsLabel: ''),
                        SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'O Android irá pedir sua confirmação. Selecione "SemSpam" na tela que aparecer.',
                            style: TextStyle(fontSize: 14),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                if (_showResult) ...[
                  const SizedBox(height: 12),
                  Text(
                    'Você pode ativar a qualquer momento em Configurações.',
                    style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                  ),
                ],
              ],
              const Spacer(),
              if (_isSupported && !_isHeld) ...[
                FilledButton(
                  onPressed: _isRequesting ? null : _requestRole,
                  child: _isRequesting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text(
                          'Ativar proteção',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                        ),
                ),
                const SizedBox(height: 8),
                TextButton(
                  onPressed: _isRequesting ? null : _finish,
                  child: const Text('Ativar depois nas configurações'),
                ),
              ] else ...[
                FilledButton(
                  onPressed: _finish,
                  child: Text(
                    _isHeld ? 'Continuar' : 'Entendi, continuar',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }
}

class _GrantedCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      color: AppColors.verifiedLight,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: const [
            Icon(Icons.check_circle, color: AppColors.verified, size: 32),
            SizedBox(width: 12),
            Expanded(
              child: Text(
                '✅ Proteção ativada com sucesso!\nO SemSpam já pode bloquear spam automaticamente.',
                style: TextStyle(fontSize: 14, height: 1.5),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _UnsupportedCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Card(
      color: AppColors.unknownLight,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: const [
            Icon(Icons.info_outline, color: AppColors.unknown, size: 28),
            SizedBox(width: 12),
            Expanded(
              child: Text(
                'Seu Android não suporta bloqueio automático (requer Android 10+). O SemSpam ainda avisará sobre chamadas suspeitas.',
                style: TextStyle(fontSize: 14, height: 1.5),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
