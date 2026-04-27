"use client";

import { useState, useCallback } from "react";
import { Shield, RotateCcw, Download, Info } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { SmartDropzone } from "@/components/dropzone/SmartDropzone";
import { CreditSummary } from "@/components/fiscal/CreditSummary";
import { NFeResultTable } from "@/components/fiscal/NFeResultTable";
import { useNFeProcessor } from "@/hooks/useWasm";
import { formatCNPJ, formatDate } from "@/lib/utils/formatters";
import type { NFeAnalysisResult, BatchNFeResult } from "@/lib/wasm/types";

export default function AuditoriaFiscalPage() {
  const { state, progress, error, processFile, processFiles, reset } =
    useNFeProcessor();
  const [singleResult, setSingleResult] = useState<NFeAnalysisResult | null>(null);
  const [batchResult, setBatchResult] = useState<BatchNFeResult | null>(null);

  const handleFiles = useCallback(
    async (files: File[]) => {
      setSingleResult(null);
      setBatchResult(null);

      if (files.length === 1) {
        const r = await processFile(files[0]);
        if (r) setSingleResult(r);
      } else {
        const r = await processFiles(files);
        if (r) setBatchResult(r);
      }
    },
    [processFile, processFiles]
  );

  const handleReset = useCallback(() => {
    reset();
    setSingleResult(null);
    setBatchResult(null);
  }, [reset]);

  const hasResult = !!singleResult || !!batchResult;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Auditoria Fiscal"
        subtitle="Recuperação de créditos PIS/COFINS — regime monofásico"
      />

      <div className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-8">
        {/* How it works banner */}
        {!hasResult && state === "idle" && (
          <div className="bg-surface border border-border rounded-2xl p-5 flex items-start gap-4">
            <div className="w-9 h-9 bg-profit/10 rounded-xl flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-profit" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Como funciona a recuperação monofásica?
              </p>
              <p className="text-xs text-muted leading-relaxed">
                Nas Leis 10.485/02 (autopeças/pneus) e 10.833/03 (bebidas), o PIS e
                a COFINS são concentrados no fabricante/importador. Distribuidores e
                varejistas que pagaram esses impostos novamente têm direito a
                restituição via{" "}
                <span className="text-profit font-medium">PER/DCOMP</span>.
                Sobe sua(s) NFe(s) XML e o sistema identifica em segundos.
              </p>
            </div>
          </div>
        )}

        {/* Dropzone */}
        {!hasResult && (
          <SmartDropzone
            mode="fiscal"
            onFiles={handleFiles}
            processing={state === "reading" || state === "processing"}
            progress={progress}
          />
        )}

        {/* Error state */}
        {state === "error" && error && (
          <div className="bg-danger/10 border border-danger/30 rounded-2xl p-5 flex items-start gap-3">
            <Shield className="w-5 h-5 text-danger shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-danger">Erro ao processar</p>
              <p className="text-xs text-muted mt-1">{error}</p>
            </div>
            <button
              onClick={handleReset}
              className="ml-auto text-xs text-muted hover:text-foreground flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Tentar novamente
            </button>
          </div>
        )}

        {/* Results */}
        {hasResult && (
          <div className="space-y-6 animate-float-up">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Resultado da Análise
                </h2>
                {singleResult && (
                  <p className="text-xs text-muted mt-0.5">
                    NFe {singleResult.numero_nfe || "s/n"}
                    {singleResult.cnpj_emitente
                      ? ` · Emitente: ${formatCNPJ(singleResult.cnpj_emitente)}`
                      : ""}
                    {singleResult.data_emissao
                      ? ` · ${formatDate(singleResult.data_emissao)}`
                      : ""}
                  </p>
                )}
                {batchResult && (
                  <p className="text-xs text-muted mt-0.5">
                    {batchResult.total_nfes} NFes analisadas ·{" "}
                    {batchResult.nfes_com_monofasico} com itens monofásicos
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-xs text-muted hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Nova análise
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-profit/10 border border-profit/30 text-profit text-xs font-medium hover:bg-profit/20 transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  Exportar Relatório
                </button>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CreditSummary
                result={singleResult || batchResult!}
                isBatch={!!batchResult}
              />

              {/* Batch: list of NF summaries */}
              {batchResult && (
                <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-border">
                    <h3 className="text-sm font-semibold">NFes com Crédito</h3>
                  </div>
                  <div className="overflow-y-auto max-h-80">
                    {batchResult.analyses
                      .filter((a) => a.total_recuperavel > 0)
                      .sort((a, b) => b.total_recuperavel - a.total_recuperavel)
                      .map((a, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between px-5 py-3 border-b border-border/30 hover:bg-white/2"
                        >
                          <div>
                            <p className="text-xs font-mono text-subtle">
                              {a.numero_nfe || a.chave_acesso.substring(0, 16) + "…"}
                            </p>
                            <p className="text-xs text-muted">
                              {a.itens_monofasicos} itens monofásicos
                            </p>
                          </div>
                          <p className="text-sm font-bold text-profit">
                            R$ {a.total_recuperavel.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    {batchResult.analyses.filter((a) => a.total_recuperavel > 0).length === 0 && (
                      <div className="px-5 py-8 text-center text-sm text-muted">
                        Nenhuma NFe com crédito monofásico
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Item table (single NFe only) */}
            {singleResult && singleResult.itens.length > 0 && (
              <NFeResultTable itens={singleResult.itens} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
