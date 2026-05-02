import 'package:flutter/material.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../core/constants.dart';
import '../../../core/theme/colors.dart';
import '../../../core/utils/analytics_helper.dart';
import 'permissions_page.dart';

class OnboardingPage extends StatefulWidget {
  const OnboardingPage({super.key});

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage> {
  final _controller = PageController();
  int _currentPage = 0;

  final List<_OnboardingStep> _steps = [
    const _OnboardingStep(
      emoji: '🛡️',
      title: 'Bloqueie ligações chatas',
      bullets: [
        'Detecta spam automaticamente em tempo real',
        'Banco colaborativo com milhares de números denunciados',
        'Funciona em segundo plano, sem consumir bateria',
      ],
    ),
    const _OnboardingStep(
      emoji: '👥',
      title: 'Comunidade de proteção',
      bullets: [
        'Cada denúncia protege todos os brasileiros',
        'Quanto mais usuários, mais inteligente fica',
        'Seus dados são anônimos e nunca são vendidos',
      ],
    ),
  ];

  void _nextPage() {
    if (_currentPage < _steps.length - 1) {
      _controller.nextPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
      );
    } else {
      _goToPermissions();
    }
  }

  void _goToPermissions() {
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (_) => const PermissionsPage()),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: PageView.builder(
                controller: _controller,
                onPageChanged: (page) => setState(() => _currentPage = page),
                itemCount: _steps.length,
                itemBuilder: (_, index) => _StepView(step: _steps[index]),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
              child: Column(
                children: [
                  SmoothPageIndicator(
                    controller: _controller,
                    count: _steps.length,
                    effect: ExpandingDotsEffect(
                      activeDotColor: AppColors.primary,
                      dotColor: AppColors.border,
                      dotHeight: 8,
                      dotWidth: 8,
                      expansionFactor: 3,
                    ),
                  ),
                  const SizedBox(height: 24),
                  FilledButton(
                    onPressed: _nextPage,
                    child: Text(
                      _currentPage < _steps.length - 1 ? 'Próximo' : 'Configurar permissões',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                    ),
                  ),
                  if (_currentPage > 0) ...[
                    const SizedBox(height: 8),
                    TextButton(
                      onPressed: () => _controller.previousPage(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                      ),
                      child: const Text('Voltar'),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OnboardingStep {
  final String emoji;
  final String title;
  final List<String> bullets;

  const _OnboardingStep({
    required this.emoji,
    required this.title,
    required this.bullets,
  });
}

class _StepView extends StatelessWidget {
  final _OnboardingStep step;

  const _StepView({required this.step});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            step.emoji,
            style: const TextStyle(fontSize: 72),
            semanticsLabel: '',
          ),
          const SizedBox(height: 32),
          Text(
            step.title,
            style: const TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ...step.bullets.map((bullet) => _BulletItem(text: bullet)),
        ],
      ),
    );
  }
}

class _BulletItem extends StatelessWidget {
  final String text;
  const _BulletItem({required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.check_circle, color: AppColors.verified, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 15, color: AppColors.textSecondary),
            ),
          ),
        ],
      ),
    );
  }
}
