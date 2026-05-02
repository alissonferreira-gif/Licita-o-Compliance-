import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../datasources/call_protection_firestore_source.dart';
import '../datasources/call_protection_local_source.dart';
import '../models/reported_number.dart';
import '../models/user_report.dart';
import '../models/call_log_entry.dart';

class CallProtectionRepository {
  final CallProtectionFirestoreSource _remote;
  final CallProtectionLocalSource _local;

  CallProtectionRepository(this._remote, this._local);

  Future<ReportedNumber> getNumber(String e164Number) async {
    // Cache-first: verifica local antes do Firestore
    final cached = await _local.getCachedNumber(e164Number);
    if (cached != null) return cached;

    final remote = await _remote.getNumber(e164Number);
    if (remote == null) return ReportedNumber.empty(e164Number);

    await _local.cacheNumber(remote);
    return remote;
  }

  Future<void> submitReport(UserReport report) async {
    await _remote.submitReport(report);
  }

  Future<List<CallLogEntry>> getCallLog({int limit = 20}) =>
      _local.getCallLog(limit: limit);

  Future<void> logCall(CallLogEntry entry) =>
      _local.insertCallLog(entry);

  Future<int> countBlockedThisMonth() => _local.countBlockedThisMonth();

  Future<int> countDetectedThisMonth() => _local.countDetectedThisMonth();

  Future<Map<String, dynamic>?> getAppStats() => _remote.getAppStats();
}

final callProtectionRepositoryProvider =
    Provider<CallProtectionRepository>((ref) {
  return CallProtectionRepository(
    ref.watch(callProtectionFirestoreSourceProvider),
    ref.watch(callProtectionLocalSourceProvider),
  );
});
