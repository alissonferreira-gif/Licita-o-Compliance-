import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';
import '../../data/models/user_report.dart';
import '../providers/call_protection_providers.dart';
import '../widgets/report_form.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/utils/phone_formatter.dart';
import '../../../../core/utils/result_classifier.dart';
import '../../../../core/utils/analytics_helper.dart';

class ReportPage extends ConsumerStatefulWidget {
  final String? initialNumber;

  const ReportPage({super.key, this.initialNumber});

  @override
  ConsumerState<ReportPage> createState() => _ReportPageState();
}

class _ReportPageState extends ConsumerState<ReportPage> {
  bool _submitted = false;
  String? _submittedNumber;

  void _handleSubmit(String e164, ReportType type, String? comment) async {
    final usecase = ref.read(reportNumberUsecaseProvider);
    try {
      await usecase.execute(
        e164Number: e164,
        type: type,
        comment: comment,
      );
      await AnalyticsHelper.logReportSent(type.value);
      if (mounted) {
        setState(() {
          _submitted = true;
          _submittedNumber = e164;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Erro ao enviar denúncia. Tente novamente.'),
            backgroundColor: AppColors.spam,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_submitted && _submittedNumber != null) {
      return _ThankYouScreen(
        number: _submittedNumber!,
        onBack: () => Navigator.pop(context),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Denunciar número')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              color: AppColors.spamLight,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    const Text('⚠️', style: TextStyle(fontSize: 24)),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Text(
                        'Sua denúncia ajuda a comunidade a se proteger. Reporte apenas números que realmente te perturbaram.',
                        style: TextStyle(fontSize: 14),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 20),
            ReportForm(
              initialNumber: widget.initialNumber,
              onSubmit: _handleSubmit,
            ),
          ],
        ),
      ),
    );
  }
}

class _ThankYouScreen extends ConsumerWidget {
  final String number;
  final VoidCallback onBack;

  const _ThankYouScreen({required this.number, required this.onBack});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final numberResult = ref.watch(numberCheckProvider(number));
    final totalReports = numberResult.asData?.value.totalReports ?? 0;

    return Scaffold(
      appBar: AppBar(title: const Text('Denúncia enviada')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const Text('🎉', style: TextStyle(fontSize: 64), semanticsLabel: ''),
            const SizedBox(height: 24),
            const Text(
              'Obrigado! Você ajudou a comunidade.',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            if (totalReports > 0) ...[
              Text(
                'Esse número agora tem ${ResultClassifier.formatCount(totalReports)} reportes.',
                style: const TextStyle(
                  fontSize: 16,
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
            ],
            Text(
              PhoneFormatter.toDisplay(number),
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 40),
            OutlinedButton.icon(
              onPressed: () async {
                await Share.share(
                  'Acabei de denunciar um número spam no SemSpam! Baixe e proteja-se também: https://semspam.com.br',
                  subject: 'Proteção contra spam no celular',
                );
                await AnalyticsHelper.logShareApp();
              },
              icon: const Icon(Icons.share_outlined),
              label: const Text('Compartilhar com amigos'),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: onBack,
              child: const Text('Voltar ao início'),
            ),
          ],
        ),
      ),
    );
  }
}
