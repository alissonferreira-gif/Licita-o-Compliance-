import 'package:flutter/material.dart';
import '../../../core/theme/colors.dart';

// Tela de tutorial opcional — acessível via configurações
class TutorialPage extends StatelessWidget {
  const TutorialPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Como funciona')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          _TutorialStep(
            emoji: '📞',
            title: '1. Você recebe uma chamada',
            description:
                'O SemSpam detecta automaticamente o número que está ligando para você.',
          ),
          _TutorialStep(
            emoji: '🔍',
            title: '2. Consulta instantânea',
            description:
                'Em menos de 1,5 segundos, verificamos o número no nosso banco de dados colaborativo.',
          ),
          _TutorialStep(
            emoji: '🚨',
            title: '3. Alerta ou bloqueio',
            description:
                'Se o número tiver muitas denúncias, você é avisado ou a chamada é bloqueada automaticamente.',
          ),
          _TutorialStep(
            emoji: '📝',
            title: '4. Denuncie também',
            description:
                'Recebeu uma ligação chata? Denuncie em segundos e ajude a comunidade.',
          ),
          _TutorialStep(
            emoji: '🔒',
            title: 'Sua privacidade está segura',
            description:
                'Nunca coletamos seu nome, contatos ou localização. Apenas o número que ligou, de forma anônima.',
          ),
        ],
      ),
    );
  }
}

class _TutorialStep extends StatelessWidget {
  final String emoji;
  final String title;
  final String description;

  const _TutorialStep({
    required this.emoji,
    required this.title,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(emoji, style: const TextStyle(fontSize: 32), semanticsLabel: ''),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
