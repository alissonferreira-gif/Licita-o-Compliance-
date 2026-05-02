import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:share_plus/share_plus.dart';
import 'package:screenshot/screenshot.dart';
import '../providers/call_protection_providers.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/utils/result_classifier.dart';
import '../../../../core/utils/analytics_helper.dart';

class StatsPage extends ConsumerWidget {
  const StatsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final monthlyStats = ref.watch(monthlyStatsProvider);
    final appStats = ref.watch(appStatsProvider);
    final screenshotController = ScreenshotController();

    return Scaffold(
      appBar: AppBar(title: const Text('Estatísticas')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Proteção pessoal
          Screenshot(
            controller: screenshotController,
            child: Card(
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Sua proteção esse mês',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 16),
                    monthlyStats.when(
                      data: (stats) => Column(
                        children: [
                          _StatRow(
                            emoji: '🛡️',
                            label: 'Chamadas bloqueadas',
                            value: '${stats['blocked']}',
                          ),
                          const SizedBox(height: 12),
                          _StatRow(
                            emoji: '🔍',
                            label: 'Suspeitas detectadas',
                            value: '${stats['detected']}',
                          ),
                          const SizedBox(height: 12),
                          _StatRow(
                            emoji: '⏱️',
                            label: 'Tempo economizado',
                            value: _formatSavedTime(stats['savedSeconds'] ?? 0),
                          ),
                        ],
                      ),
                      loading: () => const CircularProgressIndicator(),
                      error: (_, __) => const Text('Dados indisponíveis'),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),
          // Stats da comunidade
          Card(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Comunidade SemSpam',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 16),
                  appStats.when(
                    data: (stats) {
                      if (stats == null) {
                        return const Text(
                          'Dados da comunidade ainda sendo carregados...',
                          style: TextStyle(color: AppColors.textSecondary),
                        );
                      }
                      return Column(
                        children: [
                          _StatRow(
                            emoji: '👥',
                            label: 'Usuários ativos',
                            value: ResultClassifier.formatCount(
                              (stats['total_users'] as num?)?.toInt() ?? 0,
                            ),
                          ),
                          const SizedBox(height: 12),
                          _StatRow(
                            emoji: '📋',
                            label: 'Números reportados',
                            value: ResultClassifier.formatCount(
                              (stats['total_numbers_reported'] as num?)?.toInt() ?? 0,
                            ),
                          ),
                          const SizedBox(height: 12),
                          _StatRow(
                            emoji: '🚫',
                            label: 'Bloqueios essa semana',
                            value: ResultClassifier.formatCount(
                              (stats['blocks_this_week'] as num?)?.toInt() ?? 0,
                            ),
                          ),
                        ],
                      );
                    },
                    loading: () => const CircularProgressIndicator(),
                    error: (_, __) => const Text('Dados da comunidade indisponíveis'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          OutlinedButton.icon(
            onPressed: () async {
              final image = await screenshotController.capture();
              if (image == null) return;
              // TODO: implementar share via XFile quando screenshot gerar o arquivo
              await Share.share(
                'Esse mês o SemSpam me protegeu de várias ligações spam! Baixe agora: https://semspam.com.br',
              );
              await AnalyticsHelper.logShareApp();
            },
            icon: const Icon(Icons.share_outlined),
            label: const Text('Compartilhar minha proteção'),
          ),
        ],
      ),
    );
  }

  String _formatSavedTime(int seconds) {
    if (seconds < 60) return '${seconds}s';
    if (seconds < 3600) return '${(seconds / 60).toStringAsFixed(0)}min';
    return '${(seconds / 3600).toStringAsFixed(1)}h';
  }
}

class _StatRow extends StatelessWidget {
  final String emoji;
  final String label;
  final String value;

  const _StatRow({required this.emoji, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(emoji, style: const TextStyle(fontSize: 22), semanticsLabel: ''),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            label,
            style: const TextStyle(fontSize: 15, color: AppColors.textSecondary),
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppColors.primary,
          ),
        ),
      ],
    );
  }
}
