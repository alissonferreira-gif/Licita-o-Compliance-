import 'package:flutter/material.dart';
import '../utils/result_classifier.dart';

class ClassificationBadge extends StatelessWidget {
  final ClassificationResult result;
  final bool large;

  const ClassificationBadge({
    super.key,
    required this.result,
    this.large = false,
  });

  @override
  Widget build(BuildContext context) {
    final padding = large
        ? const EdgeInsets.symmetric(horizontal: 16, vertical: 10)
        : const EdgeInsets.symmetric(horizontal: 10, vertical: 5);
    final fontSize = large ? 16.0 : 12.0;
    final emojiSize = large ? 24.0 : 14.0;

    return Semantics(
      label: '${result.emoji} ${result.label}',
      child: Container(
        padding: padding,
        decoration: BoxDecoration(
          color: result.backgroundColor,
          borderRadius: BorderRadius.circular(large ? 12 : 20),
          border: Border.all(color: result.color.withOpacity(0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              result.emoji,
              style: TextStyle(fontSize: emojiSize),
              semanticsLabel: '',
            ),
            const SizedBox(width: 6),
            Text(
              result.label,
              style: TextStyle(
                fontSize: fontSize,
                fontWeight: FontWeight.w600,
                color: result.color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
