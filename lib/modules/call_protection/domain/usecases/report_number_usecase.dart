import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/user_report.dart';
import '../../data/repositories/call_protection_repository.dart';
import '../../../../shared/services/auth_service.dart';
import '../../../../core/utils/analytics_helper.dart';

class ReportNumberUsecase {
  final CallProtectionRepository _repository;
  final AuthService _auth;

  ReportNumberUsecase(this._repository, this._auth);

  Future<void> execute({
    required String e164Number,
    required ReportType type,
    String? comment,
  }) async {
    final uid = _auth.uid;
    if (uid == null) throw StateError('Usuário não autenticado');

    final report = UserReport(
      number: e164Number,
      userId: uid,
      type: type,
      comment: comment,
      createdAt: DateTime.now(),
    );
    await _repository.submitReport(report);
    await AnalyticsHelper.logReportSent(type.value);
  }
}

final reportNumberUsecaseProvider = Provider<ReportNumberUsecase>((ref) {
  return ReportNumberUsecase(
    ref.watch(callProtectionRepositoryProvider),
    ref.watch(authServiceProvider),
  );
});
