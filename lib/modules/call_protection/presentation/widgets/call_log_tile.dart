import 'package:flutter/material.dart';
import '../../data/models/call_log_entry.dart';
import '../../../../core/utils/phone_formatter.dart';
import '../../../../core/utils/result_classifier.dart';
import '../../../../core/widgets/classification_badge.dart';
import '../../../../core/theme/colors.dart';

class CallLogTile extends StatelessWidget {
  final CallLogEntry entry;
  final VoidCallback? onReport;

  const CallLogTile({
    super.key,
    required this.entry,
    this.onReport,
  });

  @override
  Widget build(BuildContext context) {
    final classification = ResultClassifier.classify(
      entry.blockedScore,
      0,
      false,
    );
    final timeAgo = ResultClassifier.formatRelativeTime(entry.timestamp);
    final displayNumber = PhoneFormatter.toDisplay(entry.e164Number);

    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      leading: _buildLeadingIcon(classification),
      title: Text(
        displayNumber,
        style: const TextStyle(
          fontWeight: FontWeight.w600,
          fontSize: 15,
          letterSpacing: 0.3,
        ),
        semanticsLabel: 'Número: $displayNumber',
      ),
      subtitle: Padding(
        padding: const EdgeInsets.only(top: 4),
        child: Row(
          children: [
            ClassificationBadge(result: classification),
            const SizedBox(width: 8),
            Text(
              timeAgo,
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
      trailing: entry.wasBlocked
          ? Semantics(
              label: 'Chamada bloqueada',
              child: const Icon(Icons.block, color: AppColors.spam, size: 20),
            )
          : (onReport != null
              ? TextButton(
                  onPressed: onReport,
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    minimumSize: const Size(60, 36),
                  ),
                  child: const Text('Reportar'),
                )
              : null),
    );
  }

  Widget _buildLeadingIcon(ClassificationResult classification) {
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: classification.backgroundColor,
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Text(
          classification.emoji,
          style: const TextStyle(fontSize: 20),
          semanticsLabel: '',
        ),
      ),
    );
  }
}
