"use client";

import type { NFeAnalysisResult, BatchNFeResult } from "./types";
import {
  analyzeNFeXML as fallbackAnalyze,
  isMonofasico,
  getNCMInfo,
  estimateCredit,
} from "./processor-fallback";

// Tries to load the WASM module; falls back to TypeScript implementation
// when the binary is not available (e.g. during development without Emscripten).
let wasmModule: Record<string, (...args: unknown[]) => unknown> | null = null;
let loadAttempted = false;

async function tryLoadWasm() {
  if (loadAttempted) return wasmModule;
  loadAttempted = true;

  try {
    // Dynamic import — only works when public/wasm/processor.js exists (compiled with Emscripten)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const mod = await import(/* webpackIgnore: true */ "/wasm/processor.js" as string);
    wasmModule = await mod.default({
      locateFile: (path: string) => `/wasm/${path}`,
    });
    console.info("[Sentinela] C++ WASM engine loaded");
  } catch {
    console.info("[Sentinela] WASM not available, using TypeScript engine");
    wasmModule = null;
  }
  return wasmModule;
}

export async function analyzeNFeXML(xml: string): Promise<NFeAnalysisResult> {
  const wasm = await tryLoadWasm();

  if (wasm) {
    const raw = wasm.analyzeNFeXML(xml) as string;
    return JSON.parse(raw) as NFeAnalysisResult;
  }

  return fallbackAnalyze(xml);
}

export async function analyzeMultipleNFe(
  xmlFiles: string[]
): Promise<BatchNFeResult> {
  const results: NFeAnalysisResult[] = [];

  // Process in batches of 50 for progress reporting
  const BATCH = 50;
  for (let i = 0; i < xmlFiles.length; i += BATCH) {
    const chunk = xmlFiles.slice(i, i + BATCH);
    const batchResults = await Promise.all(chunk.map((xml) => analyzeNFeXML(xml)));
    results.push(...batchResults);
  }

  const total_recuperavel = results.reduce((s, r) => s + r.total_recuperavel, 0);
  const total_recuperavel_pis = results.reduce((s, r) => s + r.total_recuperavel_pis, 0);
  const total_recuperavel_cofins = results.reduce((s, r) => s + r.total_recuperavel_cofins, 0);
  const nfes_com_monofasico = results.filter((r) => r.itens_monofasicos > 0).length;

  return {
    analyses: results,
    total_recuperavel,
    total_recuperavel_pis,
    total_recuperavel_cofins,
    total_nfes: results.length,
    nfes_com_monofasico,
  };
}

export { isMonofasico, getNCMInfo, estimateCredit };
