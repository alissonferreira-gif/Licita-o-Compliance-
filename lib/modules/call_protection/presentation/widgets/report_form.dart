import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/user_report.dart';
import '../../../../core/constants.dart';
import '../../../../core/theme/colors.dart';
import '../../../../core/utils/phone_formatter.dart';

class ReportForm extends ConsumerStatefulWidget {
  final String? initialNumber;
  final void Function(String number, ReportType type, String? comment) onSubmit;

  const ReportForm({
    super.key,
    this.initialNumber,
    required this.onSubmit,
  });

  @override
  ConsumerState<ReportForm> createState() => _ReportFormState();
}

class _ReportFormState extends ConsumerState<ReportForm> {
  final _numberController = TextEditingController();
  final _commentController = TextEditingController();
  ReportType _selectedType = ReportType.telemarketing;
  bool _numberValid = true;
  int _commentLength = 0;

  @override
  void initState() {
    super.initState();
    if (widget.initialNumber != null) {
      _numberController.text = PhoneFormatter.toDisplay(widget.initialNumber!);
    }
    _commentController.addListener(() {
      setState(() => _commentLength = _commentController.text.length);
    });
  }

  @override
  void dispose() {
    _numberController.dispose();
    _commentController.dispose();
    super.dispose();
  }

  void _validateAndSubmit() {
    final raw = _numberController.text;
    final e164 = PhoneFormatter.toE164(raw);
    if (!PhoneFormatter.isValidBR(e164)) {
      setState(() => _numberValid = false);
      return;
    }
    setState(() => _numberValid = true);
    widget.onSubmit(e164, _selectedType, _commentController.text.trim().isEmpty ? null : _commentController.text.trim());
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextField(
          controller: _numberController,
          keyboardType: TextInputType.phone,
          decoration: InputDecoration(
            labelText: 'Número de telefone',
            hintText: '+55 (62) 99988-7766',
            errorText: _numberValid ? null : 'Número inválido. Use o formato (DDD) + número',
            prefixIcon: const Icon(Icons.phone),
          ),
          onChanged: (_) {
            if (!_numberValid) setState(() => _numberValid = true);
          },
        ),
        const SizedBox(height: 16),
        DropdownButtonFormField<ReportType>(
          value: _selectedType,
          decoration: const InputDecoration(
            labelText: 'Tipo de chamada',
            prefixIcon: Icon(Icons.category_outlined),
          ),
          items: ReportType.values.map((type) {
            return DropdownMenuItem(
              value: type,
              child: Text(type.label),
            );
          }).toList(),
          onChanged: (type) {
            if (type != null) setState(() => _selectedType = type);
          },
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _commentController,
          maxLines: 3,
          maxLength: AppConstants.maxCommentLength,
          decoration: InputDecoration(
            labelText: 'Comentário (opcional)',
            hintText: 'Descreva sua experiência com esse número...',
            alignLabelWithHint: true,
            counter: Text(
              '$_commentLength/${AppConstants.maxCommentLength}',
              style: TextStyle(
                fontSize: 12,
                color: _commentLength > AppConstants.maxCommentLength - 20
                    ? AppColors.suspicious
                    : AppColors.textSecondary,
              ),
            ),
          ),
        ),
        const SizedBox(height: 24),
        FilledButton.icon(
          onPressed: _validateAndSubmit,
          icon: const Icon(Icons.send_outlined),
          label: const Text('Enviar denúncia'),
        ),
      ],
    );
  }
}
