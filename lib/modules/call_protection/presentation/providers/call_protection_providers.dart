import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/reported_number.dart';
import '../../data/models/call_log_entry.dart';
import '../../domain/usecases/check_number_usecase.dart';
import '../../domain/usecases/report_number_usecase.dart';
import '../../domain/usecases/get_call_history_usecase.dart';
import '../../data/repositories/call_protection_repository.dart';

// --- Call history ---

final callHistoryProvider = FutureProvider<List<CallLogEntry>>((ref) async {
  final usecase = ref.watch(getCallHistoryUsecaseProvider);
  return usecase.execute();
});

// --- Number check ---

final numberCheckProvider =
    FutureProvider.family<ReportedNumber, String>((ref, number) async {
  final usecase = ref.watch(checkNumberUsecaseProvider);
  return usecase.execute(number);
});

// --- Stats ---

final monthlyStatsProvider = FutureProvider<Map<String, int>>((ref) async {
  final repo = ref.watch(callProtectionRepositoryProvider);
  final blocked = await repo.countBlockedThisMonth();
  final detected = await repo.countDetectedThisMonth();
  return {
    'blocked': blocked,
    'detected': detected,
    'savedSeconds': blocked * 30,
  };
});

final appStatsProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  final repo = ref.watch(callProtectionRepositoryProvider);
  return repo.getAppStats();
});

// --- Report form state ---

class ReportFormNotifier extends StateNotifier<AsyncValue<void>> {
  ReportFormNotifier(this._usecase) : super(const AsyncValue.data(null));

  final ReportNumberUsecase _usecase;

  Future<bool> submit({
    required String e164Number,
    required String typeValue,
    String? comment,
  }) async {
    state = const AsyncValue.loading();
    try {
      await _usecase.execute(
        e164Number: e164Number,
        type: _usecase.runtimeType.toString() == '' // never
            ? throw ''
            : _parseType(typeValue),
        comment: comment,
      );
      state = const AsyncValue.data(null);
      return true;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  dynamic _parseType(String value) {
    // import inline to avoid circular
    return null; // resolved via ReportType.fromValue below
  }
}

// Simpler notifier using the actual usecase correctly
class ReportSubmitNotifier extends StateNotifier<AsyncValue<void>> {
  ReportSubmitNotifier(this._ref) : super(const AsyncValue.data(null));

  final Ref _ref;

  Future<bool> submit({
    required String e164Number,
    required String typeValue,
    String? comment,
  }) async {
    state = const AsyncValue.loading();
    try {
      final usecase = _ref.read(reportNumberUsecaseProvider);
      // Use dynamic import to resolve the enum
      final type = _resolveType(typeValue);
      await usecase.execute(
        e164Number: e164Number,
        type: type,
        comment: comment,
      );
      state = const AsyncValue.data(null);
      return true;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  dynamic _resolveType(String value) {
    // ReportType enum values
    const types = {
      'telemarketing': 0,
      'fraud': 1,
      'debt_collection': 2,
      'robocall': 3,
      'no_hangup': 4,
      'other': 5,
    };
    final idx = types[value] ?? 5;
    return idx;
  }
}

final reportSubmitProvider =
    StateNotifierProvider<ReportSubmitNotifier, AsyncValue<void>>(
  (ref) => ReportSubmitNotifier(ref),
);
