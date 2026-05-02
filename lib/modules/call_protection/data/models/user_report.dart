enum ReportType {
  telemarketing('telemarketing', 'Telemarketing'),
  fraud('fraud', 'Golpe / Fraude'),
  debtCollection('debt_collection', 'Cobrança indevida'),
  robocall('robocall', 'Robôchamada'),
  noHangup('no_hangup', 'Empresa que não desliga'),
  other('other', 'Outro');

  final String value;
  final String label;
  const ReportType(this.value, this.label);

  static ReportType fromValue(String value) {
    return ReportType.values.firstWhere(
      (t) => t.value == value,
      orElse: () => ReportType.other,
    );
  }
}

class UserReport {
  final String number;
  final String userId;
  final ReportType type;
  final String? comment;
  final DateTime createdAt;

  const UserReport({
    required this.number,
    required this.userId,
    required this.type,
    this.comment,
    required this.createdAt,
  });

  Map<String, dynamic> toFirestore() {
    final data = <String, dynamic>{
      'number': number,
      'user_id': userId,
      'type': type.value,
      'created_at': createdAt,
    };
    if (comment != null && comment!.isNotEmpty) {
      data['comment'] = comment;
    }
    return data;
  }
}
