"use client";

import { useState, useCallback } from "react";
import { analyzeNFeXML, analyzeMultipleNFe } from "@/lib/wasm/loader";
import type { NFeAnalysisResult, BatchNFeResult } from "@/lib/wasm/types";

export type ProcessingState =
  | "idle"
  | "reading"
  | "processing"
  | "done"
  | "error";

export function useNFeProcessor() {
  const [state, setState] = useState<ProcessingState>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    async (file: File): Promise<NFeAnalysisResult | null> => {
      try {
        setState("reading");
        setProgress(10);
        setError(null);

        const text = await file.text();
        setProgress(40);

        setState("processing");
        const result = await analyzeNFeXML(text);
        setProgress(100);
        setState("done");
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao processar XML");
        setState("error");
        return null;
      }
    },
    []
  );

  const processFiles = useCallback(
    async (
      files: File[],
      onProgress?: (pct: number) => void
    ): Promise<BatchNFeResult | null> => {
      try {
        setState("reading");
        setProgress(5);
        setError(null);

        const xmlContents: string[] = [];
        for (let i = 0; i < files.length; i++) {
          xmlContents.push(await files[i].text());
          const readPct = Math.round(((i + 1) / files.length) * 40);
          setProgress(readPct);
          onProgress?.(readPct);
        }

        setState("processing");
        const result = await analyzeMultipleNFe(xmlContents);
        setProgress(100);
        onProgress?.(100);
        setState("done");
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao processar XMLs");
        setState("error");
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState("idle");
    setProgress(0);
    setError(null);
  }, []);

  return { state, progress, error, processFile, processFiles, reset };
}
