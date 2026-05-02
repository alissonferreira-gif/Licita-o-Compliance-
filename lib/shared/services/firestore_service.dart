import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants.dart';

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  CollectionReference get reportedNumbers =>
      _db.collection(AppConstants.collectionReportedNumbers);

  CollectionReference get userReports =>
      _db.collection(AppConstants.collectionUserReports);

  DocumentReference get appStats =>
      _db.collection(AppConstants.collectionAppStats).doc(AppConstants.docGlobalStats);

  Future<DocumentSnapshot> getNumber(String e164Number) async {
    final docId = e164Number.replaceAll('+', '');
    return reportedNumbers.doc(docId).get();
  }

  Future<void> submitReport(Map<String, dynamic> data) async {
    await userReports.add(data);
  }

  Future<Map<String, dynamic>?> getAppStats() async {
    final snap = await appStats.get();
    if (!snap.exists) return null;
    return snap.data() as Map<String, dynamic>?;
  }

  Stream<DocumentSnapshot> watchAppStats() {
    return appStats.snapshots();
  }
}

final firestoreServiceProvider = Provider<FirestoreService>((ref) => FirestoreService());
