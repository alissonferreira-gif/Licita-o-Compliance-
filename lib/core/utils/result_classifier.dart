import 'package:flutter/material.dart';
import '../theme/colors.dart';

enum ClassificationLevel {
  spam,       // 🚨 5+ reportes
  suspicious, // ⚠️ 3-4 reportes
  safe,       // ✅ 0-2 reportes e is_verified_business
  unknown,    // ❓ sem dados
}

class ClassificationResult {
  final ClassificationLevel level;
  final String emoji;
  final String label;
  final Color color;
  final Color backgroundColor;

  const ClassificationResult({
    required this.level,
    required this.emoji,
    required this.label,
    required this.color,
    required this.backgroundColor,
  });
}

class ResultClassifier {
  static ClassificationResult classify(double score, int totalReports, bool isVerifiedBusiness) {
    if (isVerifiedBusiness && score < 3) {
      return const ClassificationResult(
        level: ClassificationLevel.safe,
        emoji: '✅',
        label: 'Empresa verificada',
        color: AppColors.verified,
        backgroundColor: AppColors.verifiedLight,
      );
    }
    if (score >= 5 || totalReports >= 5) {
      return const ClassificationResult(
        level: ClassificationLevel.spam,
        emoji: '🚨',
        label: 'Spam confirmado',
        color: AppColors.spam,
        backgroundColor: AppColors.spamLight,
      );
    }
    if (score >= 3 || totalReports >= 3) {
      return const ClassificationResult(
        level: ClassificationLevel.suspicious,
        emoji: '⚠️',
        label: 'Suspeito',
        color: AppColors.suspicious,
        backgroundColor: AppColors.suspiciousLight,
      );
    }
    if (totalReports == 0) {
      return const ClassificationResult(
        level: ClassificationLevel.unknown,
        emoji: '❓',
        label: 'Sem registros',
        color: AppColors.unknown,
        backgroundColor: AppColors.unknownLight,
      );
    }
    return const ClassificationResult(
      level: ClassificationLevel.safe,
      emoji: '✅',
      label: 'Sem reclamações',
      color: AppColors.verified,
      backgroundColor: AppColors.verifiedLight,
    );
  }

  static String formatRelativeTime(DateTime dateTime) {
    final now = DateTime.now();
    final diff = now.difference(dateTime);

    if (diff.inMinutes < 1) return 'agora há pouco';
    if (diff.inMinutes < 60) return 'há ${diff.inMinutes}min';
    if (diff.inHours < 24) return 'há ${diff.inHours}h';
    if (diff.inDays == 1) return 'ontem';
    if (diff.inDays < 7) return 'há ${diff.inDays} dias';
    if (diff.inDays < 30) return 'há ${(diff.inDays / 7).floor()} semanas';
    if (diff.inDays < 365) return 'há ${(diff.inDays / 30).floor()} meses';
    return 'há mais de 1 ano';
  }

  static String formatCount(int count) {
    if (count >= 1000000) return '${(count / 1000000).toStringAsFixed(1)}M';
    if (count >= 1000) return '${(count / 1000).toStringAsFixed(1)}K';
    return count.toString();
  }
}
