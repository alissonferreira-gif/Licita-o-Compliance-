import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/call_protection_providers.dart';
import '../widgets/call_log_tile.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/utils/result_classifier.dart';
import '../../../../core/widgets/ad_banner_widget.dart';
import 'verify_page.dart';
import 'report_page.dart';
import 'settings_page.dart';
import 'stats_page.dart';

class HomePage extends ConsumerWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final callHistory = ref.watch(callHistoryProvider);
    final monthlyStats = ref.watch(monthlyStatsProvider);
    final appStats = ref.watch(appStatsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: const BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
              ),
              child: const Center(
                child: Text(
                  '🛡️',
                  style: TextStyle(fontSize: 18),
                  semanticsLabel: '',
                ),
              ),
            ),
            const SizedBox(width: 10),
            const Text(
              'SemSpam',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.bar_chart_outlined),
            tooltip: 'Estatísticas',
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const StatsPage()),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.settings_outlined),
            tooltip: 'Configurações',
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const SettingsPage()),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: RefreshIndicator(
              onRefresh: () async {
                ref.invalidate(callHistoryProvider);
                ref.invalidate(monthlyStatsProvider);
                ref.invalidate(appStatsProvider);
              },
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Card proteção do mês
                  _ProtectionCard(
                    monthlyStats: monthlyStats,
                    appStats: appStats,
                  ),
                  const SizedBox(height: 16),
                  // Botão verificar número
                  FilledButton.icon(
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const VerifyPage()),
                    ),
                    icon: const Icon(Icons.search),
                    label: const Text('🔍  Verificar um número'),
                    style: FilledButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      textStyle: const TextStyle(fontSize: 17, fontWeight: FontWeight.w600),
                    ),
                  ),
                  const SizedBox(height: 24),
                  // Lista de chamadas recentes
                  const Text(
                    'Chamadas recentes',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  callHistory.when(
                    data: (entries) {
                      if (entries.isEmpty) {
                        return const _EmptyCallLog();
                      }
                      return Column(
                        children: entries.map((entry) {
                          return Card(
                            margin: const EdgeInsets.only(bottom: 8),
                            child: CallLogTile(
                              entry: entry,
                              onReport: () => Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (_) => ReportPage(
                                    initialNumber: entry.e164Number,
                                  ),
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      );
                    },
                    loading: () => const _CallLogSkeleton(),
                    error: (_, __) => const _CallLogError(),
                  ),
                  const SizedBox(height: 80),
                ],
              ),
            ),
          ),
          const AdBannerWidget(),
        ],
      ),
    );
  }
}

class _ProtectionCard extends StatelessWidget {
  final AsyncValue<Map<String, int>> monthlyStats;
  final AsyncValue<Map<String, dynamic>?> appStats;

  const _ProtectionCard({required this.monthlyStats, required this.appStats});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            monthlyStats.when(
              data: (stats) => Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Text('🛡️', style: TextStyle(fontSize: 24)),
                      const SizedBox(width: 10),
                      Expanded(
                        child: RichText(
                          text: TextSpan(
                            style: const TextStyle(
                              fontSize: 18,
                              color: AppColors.textPrimary,
                            ),
                            children: [
                              const TextSpan(text: 'Você foi protegido de '),
                              TextSpan(
                                text: '${stats['blocked']}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: AppColors.primary,
                                  fontSize: 22,
                                ),
                              ),
                              const TextSpan(text: ' ligações esse mês'),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${ResultClassifier.formatCount(stats['detected']!)} suspeitas detectadas • ${(stats['savedSeconds']! / 60).toStringAsFixed(0)}min economizados',
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
              loading: () => const _StatsSkeleton(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            const Divider(height: 24),
            appStats.when(
              data: (stats) => Text(
                'Junte-se a ${ResultClassifier.formatCount((stats?['total_users'] as num?)?.toInt() ?? 0)} brasileiros protegidos',
                style: const TextStyle(
                  fontSize: 14,
                  color: AppColors.textSecondary,
                ),
              ),
              loading: () => Container(
                width: 200,
                height: 14,
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              error: (_, __) => const SizedBox.shrink(),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatsSkeleton extends StatelessWidget {
  const _StatsSkeleton();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(width: 200, height: 22, color: AppColors.border),
        const SizedBox(height: 8),
        Container(width: 150, height: 13, color: AppColors.border),
      ],
    );
  }
}

class _EmptyCallLog extends StatelessWidget {
  const _EmptyCallLog();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 32),
      child: Column(
        children: [
          const Text('📞', style: TextStyle(fontSize: 48), semanticsLabel: ''),
          const SizedBox(height: 12),
          const Text(
            'Nenhuma chamada registrada ainda',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 15),
          ),
          const SizedBox(height: 4),
          Text(
            'O histórico aparecerá aqui conforme você receber chamadas',
            style: TextStyle(color: AppColors.textSecondary.withOpacity(0.7), fontSize: 13),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _CallLogSkeleton extends StatelessWidget {
  const _CallLogSkeleton();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(5, (_) {
        return Card(
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: Container(
              width: 44,
              height: 44,
              decoration: const BoxDecoration(
                color: AppColors.border,
                shape: BoxShape.circle,
              ),
            ),
            title: Container(width: 120, height: 14, color: AppColors.border),
            subtitle: Container(width: 80, height: 12, color: AppColors.border),
          ),
        );
      }),
    );
  }
}

class _CallLogError extends StatelessWidget {
  const _CallLogError();

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.all(16),
      child: Text(
        'Não foi possível carregar o histórico. Puxe para atualizar.',
        style: TextStyle(color: AppColors.textSecondary),
        textAlign: TextAlign.center,
      ),
    );
  }
}
