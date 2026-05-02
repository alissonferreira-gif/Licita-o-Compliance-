class CallLogEntry {
  final int? id;
  final String e164Number;
  final double blockedScore;
  final String? classification;
  final DateTime timestamp;
  final bool wasBlocked;

  const CallLogEntry({
    this.id,
    required this.e164Number,
    required this.blockedScore,
    this.classification,
    required this.timestamp,
    required this.wasBlocked,
  });

  factory CallLogEntry.fromLocal(Map<String, dynamic> row) {
    return CallLogEntry(
      id: row['id'] as int?,
      e164Number: row['e164_number'] as String,
      blockedScore: row['blocked_score'] as double,
      classification: row['classification'] as String?,
      timestamp: DateTime.fromMillisecondsSinceEpoch(row['timestamp'] as int),
      wasBlocked: (row['was_blocked'] as int) == 1,
    );
  }

  Map<String, dynamic> toLocal() {
    return {
      if (id != null) 'id': id,
      'e164_number': e164Number,
      'blocked_score': blockedScore,
      'classification': classification,
      'timestamp': timestamp.millisecondsSinceEpoch,
      'was_blocked': wasBlocked ? 1 : 0,
    };
  }

  CallLogEntry copyWith({bool? wasBlocked, String? classification}) {
    return CallLogEntry(
      id: id,
      e164Number: e164Number,
      blockedScore: blockedScore,
      classification: classification ?? this.classification,
      timestamp: timestamp,
      wasBlocked: wasBlocked ?? this.wasBlocked,
    );
  }
}
