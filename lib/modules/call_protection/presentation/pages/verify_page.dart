import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/reported_number.dart';
import '../providers/call_protection_providers.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/utils/phone_formatter.dart';
import '../../../../core/utils/result_classifier.dart';
import '../../../../core/utils/analytics_helper.dart';
import '../../../../core/widgets/classification_badge.dart';
import '../../../../shared/services/ads_service.dart';
import 'report_page.dart';

class VerifyPage extends ConsumerStatefulWidget {
  final String? initialNumber;

  const VerifyPage({super.key, this.initialNumber});

  @override
  ConsumerState<VerifyPage> createState() => _VerifyPageState();
}

class _VerifyPageState extends ConsumerState<VerifyPage> {
  final _controller = TextEditingController();
  String? _currentQuery;
  bool _isValid = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialNumber != null) {
      _controller.text = PhoneFormatter.toDisplay(widget.initialNumber!);
      _isValid = true;
    }
    _controller.addListener(_onChanged);
  }

  void _onChanged() {
    final raw = _controller.text;
    final e164 = PhoneFormatter.toE164(raw);
    setState(() => _isValid = PhoneFormatter.isValidBR(e164));
  }

  void _verify() async {
    if (!_isValid) return;
    final e164 = PhoneFormatter.toE164(_controller.text);
    setState(() => _currentQuery = e164);
    await AnalyticsHelper.logVerifyDone('requested');
    await AdsService.showInterstitialIfAllowed();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verificar número')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            TextField(
              controller: _controller,
              keyboardType: TextInputType.phone,
              autofocus: widget.initialNumber == null,
              decoration: InputDecoration(
                labelText: 'Número de telefone',
                hintText: '+55 (62) 99988-7766',
                prefixIcon: const Icon(Icons.phone_outlined),
                errorText: _controller.text.isNotEmpty && !_isValid
                    ? 'Número inválido'
                    : null,
                suffixIcon: _controller.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _controller.clear();
                          setState(() {
                            _isValid = false;
                            _currentQuery = null;
                          });
                        },
                      )
                    : null,
              ),
            ),
            const SizedBox(height: 16),
            FilledButton.icon(
              onPressed: _isValid ? _verify : null,
              icon: const Icon(Icons.search),
              label: const Text('Verificar'),
            ),
            const SizedBox(height: 24),
            if (_currentQuery != null) _VerifyResult(number: _currentQuery!),
          ],
        ),
      ),
    );
  }
}

class _VerifyResult extends ConsumerWidget {
  final String number;

  const _VerifyResult({required this.number});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final result = ref.watch(numberCheckProvider(number));

    return result.when(
      data: (reportedNumber) => _ResultCard(number: reportedNumber),
      loading: () => const Center(
        child: Padding(
          padding: EdgeInsets.all(32),
          child: CircularProgressIndicator(),
        ),
      ),
      error: (e, _) => Card(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Text(
            'Não foi possível verificar. Tente novamente.',
            style: const TextStyle(color: AppColors.textSecondary),
          ),
        ),
      ),
    );
  }
}

class _ResultCard extends StatelessWidget {
  final ReportedNumber number;

  const _ResultCard({required this.number});

  @override
  Widget build(BuildContext context) {
    final classification = ResultClassifier.classify(
      number.blockedScore,
      number.totalReports,
      number.isVerifiedBusiness,
    );

    final dominantType = _typeLabel(number.dominantType);
    final lastReport = number.lastReportAt != null
        ? ResultClassifier.formatRelativeTime(number.lastReportAt!)
        : null;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: ClassificationBadge(result: classification, large: true),
            ),
            const SizedBox(height: 16),
            Center(
              child: Text(
                PhoneFormatter.toDisplay(number.number),
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 0.5,
                ),
              ),
            ),
            const SizedBox(height: 16),
            _InfoRow(
              icon: Icons.flag_outlined,
              label: 'Denúncias',
              value: '${ResultClassifier.formatCount(number.totalReports)} pessoas reportaram',
            ),
            if (dominantType != null) ...[
              const SizedBox(height: 8),
              _InfoRow(
                icon: Icons.category_outlined,
                label: 'Tipo mais comum',
                value: dominantType,
              ),
            ],
            if (lastReport != null) ...[
              const SizedBox(height: 8),
              _InfoRow(
                icon: Icons.access_time,
                label: 'Última denúncia',
                value: lastReport,
              ),
            ],
            const SizedBox(height: 20),
            OutlinedButton.icon(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => ReportPage(initialNumber: number.number),
                ),
              ),
              icon: const Icon(Icons.report_outlined),
              label: const Text('Reportar também'),
            ),
          ],
        ),
      ),
    );
  }

  String? _typeLabel(String? type) {
    const labels = {
      'telemarketing': 'Telemarketing',
      'fraud': 'Golpe / Fraude',
      'debt_collection': 'Cobrança indevida',
      'robocall': 'Robôchamada',
      'no_hangup': 'Empresa que não desliga',
      'other': 'Outro',
    };
    return type != null ? labels[type] : null;
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.textSecondary),
        const SizedBox(width: 8),
        Text(
          '$label: ',
          style: const TextStyle(fontSize: 14, color: AppColors.textSecondary),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
          ),
        ),
      ],
    );
  }
}
