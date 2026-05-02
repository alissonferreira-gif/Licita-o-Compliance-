import 'package:cloud_firestore/cloud_firestore.dart';

class ReportedNumber {
  final String number;
  final int totalReports;
  final DateTime? lastReportAt;
  final DateTime? firstReportedAt;
  final Map<String, int> typeCount;
  final double blockedScore;
  final bool isVerifiedBusiness;

  const ReportedNumber({
    required this.number,
    required this.totalReports,
    this.lastReportAt,
    this.firstReportedAt,
    required this.typeCount,
    required this.blockedScore,
    required this.isVerifiedBusiness,
  });

  factory ReportedNumber.fromFirestore(DocumentSnapshot doc) {
    final data = doc.data() as Map<String, dynamic>;
    return ReportedNumber(
      number: data['number'] as String? ?? '',
      totalReports: (data['total_reports'] as num?)?.toInt() ?? 0,
      lastReportAt: (data['last_report_at'] as Timestamp?)?.toDate(),
      firstReportedAt: (data['first_reported_at'] as Timestamp?)?.toDate(),
      typeCount: Map<String, int>.from(
        (data['type_count'] as Map<String, dynamic>?)?.map(
              (k, v) => MapEntry(k, (v as num).toInt()),
            ) ??
            {},
      ),
      blockedScore: (data['blocked_score'] as num?)?.toDouble() ?? 0.0,
      isVerifiedBusiness: data['is_verified_business'] as bool? ?? false,
    );
  }

  factory ReportedNumber.fromLocal(Map<String, dynamic> row) {
    return ReportedNumber(
      number: row['e164_number'] as String,
      totalReports: row['total_reports'] as int,
      blockedScore: row['blocked_score'] as double,
      isVerifiedBusiness: (row['is_verified_business'] as int) == 1,
      typeCount: {},
      lastReportAt: row['last_report_at'] != null
          ? DateTime.fromMillisecondsSinceEpoch(row['last_report_at'] as int)
          : null,
      firstReportedAt: null,
    );
  }

  Map<String, dynamic> toLocal() {
    return {
      'e164_number': number,
      'total_reports': totalReports,
      'blocked_score': blockedScore,
      'is_verified_business': isVerifiedBusiness ? 1 : 0,
      'dominant_type': dominantType,
      'last_report_at': lastReportAt?.millisecondsSinceEpoch,
    };
  }

  String? get dominantType {
    if (typeCount.isEmpty) return null;
    return typeCount.entries
        .reduce((a, b) => a.value >= b.value ? a : b)
        .key;
  }

  static ReportedNumber empty(String number) => ReportedNumber(
        number: number,
        totalReports: 0,
        typeCount: {},
        blockedScore: 0,
        isVerifiedBusiness: false,
      );
}
