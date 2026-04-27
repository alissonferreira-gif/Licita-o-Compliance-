import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getLicitacaoPrompt, getBankingAuditPrompt } from "@/lib/gemini/prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const MAX_INLINE_SIZE = 15 * 1024 * 1024; // 15MB — use inline base64

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY não configurada. Adicione ao .env.local." },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Request inválido" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const mode = (formData.get("mode") as string) || "licitacao";

  if (!file) {
    return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
  }

  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: "Arquivo muito grande (máx. 50MB)" }, { status: 413 });
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = mode === "bancaria" ? getBankingAuditPrompt() : getLicitacaoPrompt();

  try {
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: file.type || "application/pdf",
          data: base64,
        },
      },
      prompt,
    ]);

    const text = result.response.text();

    // Extract JSON — model sometimes wraps in markdown fences
    let jsonStr = text.trim();
    const fenceMatch = jsonStr.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
    if (fenceMatch) jsonStr = fenceMatch[1].trim();

    // Find the first { to last } as a fallback
    const firstBrace = jsonStr.indexOf("{");
    const lastBrace = jsonStr.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    }

    const analysis = JSON.parse(jsonStr);
    return NextResponse.json(analysis);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[Gemini API Error]", msg);
    return NextResponse.json(
      { error: `Falha na análise IA: ${msg}` },
      { status: 502 }
    );
  }
}
