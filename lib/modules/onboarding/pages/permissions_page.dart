import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../core/theme/colors.dart';
import '../../../core/utils/analytics_helper.dart';
import 'call_screening_page.dart';

class PermissionsPage extends StatefulWidget {
  const PermissionsPage({super.key});

  @override
  State<PermissionsPage> createState() => _PermissionsPageState();
}

class _PermissionsPageState extends State<PermissionsPage> {
  final Map<Permission, bool> _granted = {
    Permission.phone: false,
    Permission.notification: false,
  };

  @override
  void initState() {
    super.initState();
    _checkInitialStatus();
  }

  Future<void> _checkInitialStatus() async {
    for (final perm in _granted.keys) {
      final status = await perm.status;
      if (mounted) {
        setState(() => _granted[perm] = status.isGranted);
      }
    }
  }

  Future<void> _requestPermission(Permission permission) async {
    final status = await permission.request();
    if (mounted) {
      setState(() => _granted[permission] = status.isGranted);
    }
    if (status.isGranted) {
      await AnalyticsHelper.logPermissionGranted(permission.toString());
    }
  }

  Future<void> _finishOnboarding() async {
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const CallScreeningPage()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final allGranted = _granted.values.every((v) => v);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 24),
              const Text(
                '🔒',
                style: TextStyle(fontSize: 48),
                semanticsLabel: '',
              ),
              const SizedBox(height: 16),
              const Text(
                'Permissões necessárias',
                style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Para proteger você, o SemSpam precisa de acesso a algumas funcionalidades do seu celular.',
                style: TextStyle(fontSize: 15, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 32),
              _PermissionCard(
                icon: Icons.phone_outlined,
                title: 'Telefone',
                description: 'Detecta chamadas recebidas e consulta nosso banco de números suspeitos.',
                isGranted: _granted[Permission.phone] ?? false,
                onRequest: () => _requestPermission(Permission.phone),
              ),
              const SizedBox(height: 12),
              _PermissionCard(
                icon: Icons.notifications_outlined,
                title: 'Notificações',
                description: 'Avisa quando uma ligação suspeita for bloqueada.',
                isGranted: _granted[Permission.notification] ?? false,
                onRequest: () => _requestPermission(Permission.notification),
              ),
              const Spacer(),
              FilledButton(
                onPressed: _finishOnboarding,
                child: Text(
                  allGranted ? 'Vamos começar!' : 'Continuar sem todas as permissões',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                ),
              ),
              if (!allGranted) ...[
                const SizedBox(height: 8),
                const Text(
                  'Você pode conceder as permissões depois nas configurações.',
                  style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                  textAlign: TextAlign.center,
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

class _PermissionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final bool isGranted;
  final VoidCallback onRequest;

  const _PermissionCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.isGranted,
    required this.onRequest,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: isGranted ? AppColors.verifiedLight : AppColors.unknownLight,
                shape: BoxShape.circle,
              ),
              child: Icon(
                isGranted ? Icons.check : icon,
                color: isGranted ? AppColors.verified : AppColors.unknown,
                size: 24,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    description,
                    style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            if (!isGranted)
              TextButton(
                onPressed: onRequest,
                child: const Text('Permitir'),
              )
            else
              Semantics(
                label: 'Permissão concedida',
                child: const Icon(Icons.check_circle, color: AppColors.verified),
              ),
          ],
        ),
      ),
    );
  }
}
