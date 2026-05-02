import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/reported_number.dart';
import '../../data/repositories/call_protection_repository.dart';
import '../../../../core/utils/phone_formatter.dart';

class CheckNumberUsecase {
  final CallProtectionRepository _repository;

  CheckNumberUsecase(this._repository);

  Future<ReportedNumber> execute(String rawNumber) async {
    final e164 = PhoneFormatter.toE164(rawNumber);
    if (!PhoneFormatter.isValidBR(e164)) {
      throw ArgumentError('Número inválido: $rawNumber');
    }
    return _repository.getNumber(e164);
  }
}

final checkNumberUsecaseProvider = Provider<CheckNumberUsecase>((ref) {
  return CheckNumberUsecase(ref.watch(callProtectionRepositoryProvider));
});
