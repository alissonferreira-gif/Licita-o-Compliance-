import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants.dart';
import '../../modules/call_protection/data/models/reported_number.dart';
import '../../modules/call_protection/data/models/call_log_entry.dart';

class LocalDbService {
  static Database? _database;

  Future<Database> get database async {
    _database ??= await _initDb();
    return _database!;
  }

  Future<Database> _initDb() async {
    final path = join(await getDatabasesPath(), 'semspam.db');
    return openDatabase(
      path,
      version: 1,
      onCreate: _onCreate,
    );
  }

  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE cached_numbers (
        e164_number TEXT PRIMARY KEY,
        total_reports INTEGER NOT NULL DEFAULT 0,
        blocked_score REAL NOT NULL DEFAULT 0,
        is_verified_business INTEGER NOT NULL DEFAULT 0,
        dominant_type TEXT,
        last_report_at INTEGER,
        cached_at INTEGER NOT NULL
      )
    ''');

    await db.execute('''
      CREATE TABLE call_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        e164_number TEXT NOT NULL,
        blocked_score REAL NOT NULL DEFAULT 0,
        classification TEXT,
        timestamp INTEGER NOT NULL,
        was_blocked INTEGER NOT NULL DEFAULT 0
      )
    ''');
  }

  // --- Cached numbers ---

  Future<ReportedNumber?> getCachedNumber(String e164Number) async {
    final db = await database;
    final results = await db.query(
      'cached_numbers',
      where: 'e164_number = ?',
      whereArgs: [e164Number],
    );
    if (results.isEmpty) return null;

    final row = results.first;
    final cachedAt = DateTime.fromMillisecondsSinceEpoch(row['cached_at'] as int);
    if (DateTime.now().difference(cachedAt) > AppConstants.cacheTtl) {
      await db.delete('cached_numbers', where: 'e164_number = ?', whereArgs: [e164Number]);
      return null;
    }

    return ReportedNumber.fromLocal(row);
  }

  Future<void> cacheNumber(ReportedNumber number) async {
    final db = await database;
    await db.insert(
      'cached_numbers',
      {
        ...number.toLocal(),
        'cached_at': DateTime.now().millisecondsSinceEpoch,
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  // --- Call log ---

  Future<List<CallLogEntry>> getCallLog({int limit = 20}) async {
    final db = await database;
    final results = await db.query(
      'call_log',
      orderBy: 'timestamp DESC',
      limit: limit,
    );
    return results.map(CallLogEntry.fromLocal).toList();
  }

  Future<void> insertCallLog(CallLogEntry entry) async {
    final db = await database;
    await db.insert('call_log', entry.toLocal(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<int> countBlockedThisMonth() async {
    final db = await database;
    final startOfMonth = DateTime(DateTime.now().year, DateTime.now().month, 1)
        .millisecondsSinceEpoch;
    final result = await db.rawQuery(
      'SELECT COUNT(*) as cnt FROM call_log WHERE was_blocked = 1 AND timestamp >= ?',
      [startOfMonth],
    );
    return (result.first['cnt'] as int?) ?? 0;
  }

  Future<int> countDetectedThisMonth() async {
    final db = await database;
    final startOfMonth = DateTime(DateTime.now().year, DateTime.now().month, 1)
        .millisecondsSinceEpoch;
    final result = await db.rawQuery(
      'SELECT COUNT(*) as cnt FROM call_log WHERE classification IN (\'spam\', \'suspicious\') AND timestamp >= ?',
      [startOfMonth],
    );
    return (result.first['cnt'] as int?) ?? 0;
  }
}

final localDbServiceProvider = Provider<LocalDbService>((ref) => LocalDbService());
