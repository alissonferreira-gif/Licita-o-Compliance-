import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

// ─── processReport ────────────────────────────────────────────────────────────
// Substitui aggregateReports + rateLimitReports (elimina race condition e corrige
// o bug de recencyWeight que usava data.created_at em vez de last_report_at anterior).
// Trigger: onCreate em user_reports/{reportId}
export const processReport = functions
  .region("southamerica-east1")
  .firestore.document("user_reports/{reportId}")
  .onCreate(async (snap, _context) => {
    const data = snap.data();
    const number: string = data.number;
    const userId: string = data.user_id;
    const type: string = data.type;

    const oneDayAgo = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    // 1) Rate limit: máximo 10 reportes por usuário em 24h
    const recentCountSnap = await db
      .collection("user_reports")
      .where("user_id", "==", userId)
      .where("created_at", ">", oneDayAgo)
      .count()
      .get();

    const recentCount = recentCountSnap.data().count;
    if (recentCount > 10) {
      await snap.ref.delete();
      await db
        .collection("users_meta")
        .doc(userId)
        .set(
          {
            suspicious: true,
            flagged_at: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );
      functions.logger.warn(
        `Rate limit atingido: userId=${userId} (${recentCount} reportes/24h)`
      );
      return;
    }

    // 2) Anti-fraude: mesmo usuário não pode reportar o mesmo número em < 24h
    const dupSnap = await db
      .collection("user_reports")
      .where("user_id", "==", userId)
      .where("number", "==", number)
      .where("created_at", ">", oneDayAgo)
      .get();

    // dupSnap.size > 1 porque inclui o próprio documento recém-criado
    if (dupSnap.size > 1) {
      await snap.ref.delete();
      functions.logger.warn(
        `Reporte duplicado bloqueado: userId=${userId}, number=${number}`
      );
      return;
    }

    // 3) Agregação com recencyWeight CORRIGIDO:
    //    Usa last_report_at do documento EXISTENTE (reporte anterior),
    //    não data.created_at do reporte atual (que seria sempre ~0 dias).
    const docId = number.replace("+", "");
    const ref = db.collection("reported_numbers").doc(docId);

    let finalTotalReports = 0;

    await db.runTransaction(async (tx) => {
      const doc = await tx.get(ref);
      const existing = doc.data() ?? {};
      const totalReports = ((existing.total_reports as number) ?? 0) + 1;
      finalTotalReports = totalReports;

      const typeCount = (existing.type_count as Record<string, number>) ?? {};
      typeCount[type] = (typeCount[type] ?? 0) + 1;

      // Compara com o last_report_at do documento, não do reporte atual
      const previousLastReport = existing.last_report_at as
        | admin.firestore.Timestamp
        | undefined;
      const daysSinceLast = previousLastReport
        ? (Date.now() - previousLastReport.toMillis()) / (1000 * 60 * 60 * 24)
        : 0;

      let recencyWeight = 1.0;
      if (daysSinceLast > 90) recencyWeight = 0.4;
      else if (daysSinceLast > 30) recencyWeight = 0.7;

      const score = Math.min(
        10,
        Math.log10(totalReports + 1) * 3 * recencyWeight
      );

      tx.set(
        ref,
        {
          number,
          total_reports: totalReports,
          type_count: typeCount,
          blocked_score: Math.round(score * 10) / 10,
          last_report_at: data.created_at,
          first_reported_at: existing.first_reported_at ?? data.created_at,
          is_verified_business: existing.is_verified_business ?? false,
        },
        { merge: true }
      );
    });

    functions.logger.info(
      `Reporte processado: ${number} → totalReports=${finalTotalReports}`
    );
  });

// ─── updateAppStats ──────────────────────────────────────────────────────────
// Schedule: a cada 1 hora
export const updateAppStats = functions
  .region("southamerica-east1")
  .pubsub.schedule("every 60 minutes")
  .onRun(async () => {
    const oneWeekAgo = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    );

    const [numbersSnap, usersSnap, weekBlocksSnap] = await Promise.all([
      db.collection("reported_numbers").count().get(),
      db.collection("users_meta").count().get(),
      db
        .collection("user_reports")
        .where("created_at", ">", oneWeekAgo)
        .count()
        .get(),
    ]);

    await db.collection("app_stats").doc("global").set({
      total_numbers_reported: numbersSnap.data().count,
      total_users: usersSnap.data().count,
      blocks_this_week: weekBlocksSnap.data().count,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info("app_stats/global atualizado");
  });

// ─── seedKnownSpam ───────────────────────────────────────────────────────────
export { seedKnownSpam } from "./seed";
