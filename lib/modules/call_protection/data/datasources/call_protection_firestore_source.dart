import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../shared/services/firestore_service.dart';
import '../models/reported_number.dart';
import '../models/user_report.dart';

class CallProtectionFirestoreSource {
  final FirestoreService _firestore;

  CallProtectionFirestoreSource(this._firestore);

  Future<ReportedNumber?> getNumber(String e164Number) async {
    try {
      final doc = await _firestore.getNumber(e164Number)
          .timeout(const Duration(milliseconds: 1500));
      if (!doc.exists) return null;
      return ReportedNumber.fromFirestore(doc);
    } catch (_) {
      return null;
    }
  }

  Future<void> submitReport(UserReport report) async {
    await _firestore.submitReport(report.toFirestore());
  }

  Future<Map<String, dynamic>?> getAppStats() async {
    return _firestore.getAppStats();
  }
}

final callProtectionFirestoreSourceProvider =
    Provider<CallProtectionFirestoreSource>((ref) {
  return CallProtectionFirestoreSource(ref.watch(firestoreServiceProvider));
});
