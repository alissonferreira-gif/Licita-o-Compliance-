import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../shared/services/local_db_service.dart';
import '../models/reported_number.dart';
import '../models/call_log_entry.dart';

class CallProtectionLocalSource {
  final LocalDbService _db;

  CallProtectionLocalSource(this._db);

  Future<ReportedNumber?> getCachedNumber(String e164Number) =>
      _db.getCachedNumber(e164Number);

  Future<void> cacheNumber(ReportedNumber number) =>
      _db.cacheNumber(number);

  Future<List<CallLogEntry>> getCallLog({int limit = 20}) =>
      _db.getCallLog(limit: limit);

  Future<void> insertCallLog(CallLogEntry entry) =>
      _db.insertCallLog(entry);

  Future<int> countBlockedThisMonth() => _db.countBlockedThisMonth();

  Future<int> countDetectedThisMonth() => _db.countDetectedThisMonth();
}

final callProtectionLocalSourceProvider =
    Provider<CallProtectionLocalSource>((ref) {
  return CallProtectionLocalSource(ref.watch(localDbServiceProvider));
});
