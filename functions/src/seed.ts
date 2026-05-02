import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

/**
 * Padrões conhecidos de spam telefônico no Brasil.
 * Adicionar mais conforme dados públicos do Procon e denúncias da Anatel.
 */
const KNOWN_SPAM_PATTERNS: Array<{
  number: string;
  reports: number;
  type: string;
}> = [
  // Prefixos 0303 (telemarketing — identificação obrigatória Anatel)
  { number: "+551130303030", reports: 50, type: "telemarketing" },
  { number: "+551140404040", reports: 50, type: "telemarketing" },
  // Cobrança massiva conhecida
  { number: "+551140044040", reports: 80, type: "debt_collection" },
  // Robôchamada típica
  { number: "+551155555555", reports: 30, type: "robocall" },
];

/**
 * Seed inicial: popula reported_numbers com padrões conhecidos.
 * Chamar manualmente via HTTP com header x-admin-key após o primeiro deploy.
 *
 * Exemplo:
 *   curl -X POST \
 *     -H "x-admin-key: SUA_CHAVE" \
 *     https://southamerica-east1-SEU-PROJETO.cloudfunctions.net/seedKnownSpam
 */
export const seedKnownSpam = functions
  .region("southamerica-east1")
  .https.onRequest(async (req, res) => {
    // Proteção: só admin via header secreto configurado nas env vars
    const adminKey = req.header("x-admin-key");
    const expectedKey = process.env.ADMIN_SEED_KEY;

    if (!expectedKey || adminKey !== expectedKey) {
      res.status(403).send("Forbidden");
      return;
    }

    const batch = db.batch();
    for (const pattern of KNOWN_SPAM_PATTERNS) {
      const docId = pattern.number.replace("+", "");
      const ref = db.collection("reported_numbers").doc(docId);
      const score = Math.min(10, Math.log10(pattern.reports + 1) * 3);
      batch.set(
        ref,
        {
          number: pattern.number,
          total_reports: pattern.reports,
          type_count: { [pattern.type]: pattern.reports },
          blocked_score: Math.round(score * 10) / 10,
          first_reported_at: admin.firestore.FieldValue.serverTimestamp(),
          last_report_at: admin.firestore.FieldValue.serverTimestamp(),
          is_verified_business: false,
          is_seeded: true,
        },
        { merge: true }
      );
    }

    await batch.commit();
    res
      .status(200)
      .send(`Seed concluído: ${KNOWN_SPAM_PATTERNS.length} números inseridos`);
  });
