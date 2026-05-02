import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

// ─── aggregateReports ────────────────────────────────────────────────────────
// Trigger: onCreate em user_reports/{reportId}
// Atualiza reported_numbers com contagem e score, aplica anti-fraude
export const aggregateReports = functions
  .region("southamerica-east1")
  .firestore.document("user_reports/{reportId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    const number: string = data.number;
    const userId: string = data.user_id;
    const type: string = data.type;

    // Anti-fraude: mesmo usuário não pode reportar o mesmo número em < 24h
    const oneDayAgo = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    const recentReports = await db
      .collection("user_reports")
      .where("user_id", "==", userId)
      .where("number", "==", number)
      .where("created_at", ">", oneDayAgo)
      .get();

    // Exclui o próprio documento recém-criado (1 resultado = só o atual)
    if (recentReports.size > 1) {
      await snap.ref.delete();
      functions.logger.warn(
        `Reporte duplicado bloqueado: userId=${userId}, number=${number}`
      );
      return;
    }

    const docId = number.replace("+", "");
    const ref = db.collection("reported_numbers").doc(docId);

    await db.runTransaction(async (tx) => {
      const doc = await tx.get(ref);
      const existing = doc.data() ?? {};
      const totalReports = ((existing.total_reports as number) ?? 0) + 1;
      const typeCount = (existing.type_count as Record<string, number>) ?? {};
      typeCount[type] = (typeCount[type] ?? 0) + 1;

      const lastReportAt = data.created_at as admin.firestore.Timestamp;
      const daysSinceLast = lastReportAt
        ? (Date.now() - lastReportAt.toMillis()) / (1000 * 60 * 60 * 24)
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
          last_report_at: lastReportAt,
          first_reported_at: existing.first_reported_at ?? lastReportAt,
          is_verified_business: existing.is_verified_business ?? false,
        },
        { merge: true }
      );
    });

    functions.logger.info(`Reporte agregado: ${number} → totalReports++`);
  });

// ─── rateLimitReports ────────────────────────────────────────────────────────
// Trigger: onCreate em user_reports/{reportId}
// Limita 10 reportes por usuário por 24h
export const rateLimitReports = functions
  .region("southamerica-east1")
  .firestore.document("user_reports/{reportId}")
  .onCreate(async (snap) => {
    const data = snap.data();
    const userId: string = data.user_id;

    const oneDayAgo = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    const recentCount = await db
      .collection("user_reports")
      .where("user_id", "==", userId)
      .where("created_at", ">", oneDayAgo)
      .count()
      .get();

    const count = recentCount.data().count;

    if (count > 10) {
      await snap.ref.delete();
      // Marca usuário como suspeito
      await db.collection("users_meta").doc(userId).set(
        { suspicious: true, flagged_at: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );
      functions.logger.warn(
        `Rate limit atingido: userId=${userId} (${count} reportes/24h)`
      );
    }
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
      db.collection("user_reports")
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

export { seedKnownSpam } from "./seed";
