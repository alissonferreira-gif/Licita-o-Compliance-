import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/call_log_entry.dart';
import '../../data/repositories/call_protection_repository.dart';

class GetCallHistoryUsecase {
  final CallProtectionRepository _repository;

  GetCallHistoryUsecase(this._repository);

  Future<List<CallLogEntry>> execute({int limit = 20}) =>
      _repository.getCallLog(limit: limit);
}

final getCallHistoryUsecaseProvider = Provider<GetCallHistoryUsecase>((ref) {
  return GetCallHistoryUsecase(ref.watch(callProtectionRepositoryProvider));
});
