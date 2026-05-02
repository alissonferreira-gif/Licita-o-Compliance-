import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/constants.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/utils/analytics_helper.dart';
import '../../../../modules/onboarding/services/call_screening_role_service.dart';
import '../../../../shared/services/consent_service.dart';

class SettingsPage extends ConsumerStatefulWidget {
  const SettingsPage({super.key});

  @override
  ConsumerState<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends ConsumerState<SettingsPage> {
  bool _showOverlay = true;
  bool _autoBlock = false;
  bool _notifyOnBlock = true;
  String _version = '';
  bool _screeningSupported = false;
  bool _screeningHeld = false;

  @override
  void initState() {
    super.initState();
    _loadPrefs();
    _loadVersion();
    _checkScreeningRole();
  }

  Future<void> _checkScreeningRole() async {
    final supported = await CallScreeningRoleService.isSupported();
    final held = supported ? await CallScreeningRoleService.isHeld() : false;
    if (mounted) setState(() {
      _screeningSupported = supported;
      _screeningHeld = held;
    });
  }

  Future<void> _requestScreeningRole() async {
    final granted = await CallScreeningRoleService.request();
    if (mounted) setState(() => _screeningHeld = granted);
    if (granted) {
      await AnalyticsHelper.logPermissionGranted('call_screening_role');
    }
  }

  Future<void> _loadPrefs() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _showOverlay = prefs.getBool(AppConstants.prefShowOverlay) ?? true;
      _autoBlock = prefs.getBool(AppConstants.prefAutoBlock) ?? false;
      _notifyOnBlock = prefs.getBool(AppConstants.prefNotifyOnBlock) ?? true;
    });
  }

  Future<void> _loadVersion() async {
    final info = await PackageInfo.fromPlatform();
    setState(() => _version = '${info.version} (${info.buildNumber})');
  }

  Future<void> _savePrefs() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(AppConstants.prefShowOverlay, _showOverlay);
    await prefs.setBool(AppConstants.prefAutoBlock, _autoBlock);
    await prefs.setBool(AppConstants.prefNotifyOnBlock, _notifyOnBlock);
  }

  Future<void> _openUrl(String url) async {
    final uri = Uri.parse(url);
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication)) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Não foi possível abrir o link')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final privacyUrl = dotenv.env['PRIVACY_POLICY_URL'] ?? '';
    final termsUrl = dotenv.env['TERMS_URL'] ?? '';
    final supportEmail = dotenv.env['SUPPORT_EMAIL'] ?? '';

    return Scaffold(
      appBar: AppBar(title: const Text('Configurações')),
      body: ListView(
        children: [
          if (_screeningSupported) ...[
            _SectionHeader(title: 'Status de proteção'),
            ListTile(
              leading: Icon(
                _screeningHeld ? Icons.shield : Icons.shield_outlined,
                color: _screeningHeld ? AppColors.verified : AppColors.suspicious,
              ),
              title: Text(
                _screeningHeld ? '✅ Proteção ativa' : '⚠️ Proteção desativada',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: _screeningHeld ? AppColors.verified : AppColors.suspicious,
                ),
              ),
              subtitle: _screeningHeld
                  ? const Text('SemSpam está bloqueando spam em tempo real')
                  : const Text('Toque em "Ativar agora" para habilitar o bloqueio automático'),
              trailing: _screeningHeld
                  ? null
                  : TextButton(
                      onPressed: _requestScreeningRole,
                      child: const Text('Ativar agora'),
                    ),
            ),
            const Divider(),
          ],
          _SectionHeader(title: 'Proteção'),
          SwitchListTile(
            title: const Text('Aviso visual em chamadas suspeitas'),
            subtitle: const Text('Mostra um overlay com o alerta durante a chamada'),
            value: _showOverlay,
            onChanged: (val) {
              setState(() => _showOverlay = val);
              _savePrefs();
            },
          ),
          SwitchListTile(
            title: const Text('Bloquear automaticamente'),
            subtitle: const Text('Bloqueia números com 5 ou mais denúncias'),
            value: _autoBlock,
            onChanged: (val) {
              setState(() => _autoBlock = val);
              _savePrefs();
            },
          ),
          SwitchListTile(
            title: const Text('Notificar ao bloquear'),
            subtitle: const Text('Notificação quando uma ligação for bloqueada'),
            value: _notifyOnBlock,
            onChanged: (val) {
              setState(() => _notifyOnBlock = val);
              _savePrefs();
            },
          ),
          const Divider(),
          _SectionHeader(title: 'Sobre'),
          ListTile(
            leading: const Icon(Icons.privacy_tip_outlined),
            title: const Text('Política de privacidade'),
            trailing: const Icon(Icons.open_in_new, size: 18),
            onTap: () => _openUrl(privacyUrl),
          ),
          ListTile(
            leading: const Icon(Icons.description_outlined),
            title: const Text('Termos de uso'),
            trailing: const Icon(Icons.open_in_new, size: 18),
            onTap: () => _openUrl(termsUrl),
          ),
          ListTile(
            leading: const Icon(Icons.shield_outlined),
            title: const Text('Configurações de privacidade'),
            subtitle: const Text('Gerenciar consentimento de anúncios'),
            onTap: () => ref.read(consentServiceProvider).showPrivacyOptionsForm(),
          ),
          const Divider(),
          _SectionHeader(title: 'Mais'),
          ListTile(
            leading: const Icon(Icons.star_outline, color: AppColors.suspicious),
            title: const Text('⭐  Avaliar SemSpam'),
            onTap: () => _openUrl('market://details?id=com.semspam.app'),
          ),
          ListTile(
            leading: const Icon(Icons.share_outlined),
            title: const Text('📤  Compartilhar SemSpam'),
            onTap: () async {
              await Share.share(
                'Proteja seu celular com o SemSpam! Bloqueie telemarketing e golpes automaticamente. https://semspam.com.br',
              );
              await AnalyticsHelper.logShareApp();
            },
          ),
          ListTile(
            leading: const Icon(Icons.email_outlined),
            title: const Text('✉️  Suporte'),
            onTap: () => _openUrl('mailto:$supportEmail'),
          ),
          const Divider(),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Text(
              'SemSpam v$_version\nFeito com ❤️ no Brasil',
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: AppColors.primary,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}
