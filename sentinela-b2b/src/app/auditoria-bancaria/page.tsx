"use client";

import { useState, useCallback } from "react";
import {
  RotateCcw,
  Download,
  Building2,
  DollarSign,
  AlertTriangle,
  Info,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { SmartDropzone } from "@/components/dropzone/SmartDropzone";
import { formatBRL, formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

interface Irregularidade {
  data: string;
  descricao: string;
  valor_cobrado: number;
  valor_maximo_permitido: number;
  valor_indevido: number;
  motivo: string;
  base_legal: string;
}

interface BankingAnalysis {
  banco: string;
  agencia: string;
  conta: string;
  periodo_inicio: string;
  periodo_fim: string;
  total_tarifas_cobradas: number;
  total_recuperavel: number;
  irregularidades: Irregularidade[];
  recomendacoes: string[];
  resumo: string;
  error?: string;
}

export default function AuditoriaBancariaPage() {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<BankingAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setProcessing(true);
    setProgress(10);
    setAnalysis(null);
    setError(null);

    const ticker = setInterval(() => {
      setProgress((p) => Math.min(p + 4, 88));
    }, 500);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", "bancaria");

      const res = await fetch("/api/gemini", {
        method: "POST",
        body: formData,
      });

      clearInterval(ticker);
      setProgress(100);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Erro ${res.status}`);
      }

      const data: BankingAnalysis = await res.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao analisar extrato");
    } finally {
      clearInterval(ticker);
      setProcessing(false);
    }
  }, []);

  const handleReset = () => {
    setAnalysis(null);
    setError(null);
    setProgress(0);
    setProcessing(false);
  };

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Auditoria Bancária"
        subtitle="Detecção de tarifas indevidas — Res. CMN 3.919/2010"
      />

      <div className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-8">
        {!analysis && (
          <>
            <div className="bg-surface border border-border rounded-2xl p-5 flex items-start gap-4">
              <div className="w-9 h-9 bg-risk/10 rounded-xl flex items-center justify-center shrink-0">
                <Info className="w-4 h-4 text-risk" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  Quais tarifas podem ser recuperadas?
                </p>
                <p className="text-xs text-muted leading-relaxed">
                  A Resolução CMN 3.919/2010 limita as tarifas que os bancos podem cobrar. Cobranças
                  acima dos limites, serviços não contratados, tarifas duplicadas ou cobradas após
                  cancelamento são passíveis de{" "}
                  <span className="text-risk font-medium">restituição via SAC ou Banco Central</span>.
                  Faça upload do extrato em PDF ou CSV.
                </p>
              </div>
            </div>

            <SmartDropzone
              mode="bancaria"
              onFiles={handleFiles}
              processing={processing}
              progress={progress}
            />

            {error && (
              <div className="bg-danger/10 border border-danger/30 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-danger">Erro na análise</p>
                  <p className="text-xs text-muted mt-1">{error}</p>
                </div>
                <button onClick={handleReset} className="text-xs text-muted hover:text-foreground flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Tentar novamente
                </button>
              </div>
            )}
          </>
        )}

        {analysis && (
          <div className="space-y-6 animate-float-up">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Resultado da Auditoria Bancária
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  {analysis.banco}
                  {analysis.periodo_inicio && analysis.periodo_fim
                    ? ` · ${formatDate(analysis.periodo_inicio)} a ${formatDate(analysis.periodo_fim)}`
                    : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleReset} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-xs text-muted hover:text-foreground hover:bg-white/5 transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Nova análise
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-profit/10 border border-profit/30 text-profit text-xs font-medium hover:bg-profit/20 transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  Exportar
                </button>
              </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className={cn("rounded-2xl border p-5", analysis.total_recuperavel > 0 ? "bg-profit/5 border-profit/30" : "bg-surface border-border")}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className={cn("w-4 h-4", analysis.total_recuperavel > 0 ? "text-profit" : "text-muted")} />
                  <p className="text-xs text-muted">Total Recuperável</p>
                </div>
                <p className={cn("text-3xl font-bold", analysis.total_recuperavel > 0 ? "text-profit profit-glow" : "text-foreground")}>
                  {formatBRL(analysis.total_recuperavel || 0)}
                </p>
              </div>
              <div className="bg-surface border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-muted" />
                  <p className="text-xs text-muted">Tarifas Cobradas</p>
                </div>
                <p className="text-3xl font-bold text-foreground">
                  {formatBRL(analysis.total_tarifas_cobradas || 0)}
                </p>
              </div>
              <div className="bg-surface border border-border rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-risk" />
                  <p className="text-xs text-muted">Irregularidades</p>
                </div>
                <p className="text-3xl font-bold text-risk">
                  {analysis.irregularidades?.length || 0}
                </p>
              </div>
            </div>

            {/* Resumo */}
            {analysis.resumo && (
              <div className="bg-surface border border-border rounded-2xl p-5 border-l-2 border-l-risk/50">
                <p className="text-xs font-medium text-muted mb-2">Resumo</p>
                <p className="text-sm text-subtle leading-relaxed">{analysis.resumo}</p>
              </div>
            )}

            {/* Irregularidades */}
            {analysis.irregularidades?.length > 0 && (
              <div className="bg-surface border border-border rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border">
                  <h3 className="text-sm font-semibold">Cobranças Indevidas Detectadas</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left px-5 py-2.5 text-xs text-muted font-medium">Data</th>
                        <th className="text-left px-3 py-2.5 text-xs text-muted font-medium">Descrição</th>
                        <th className="text-right px-3 py-2.5 text-xs text-muted font-medium">Cobrado</th>
                        <th className="text-right px-3 py-2.5 text-xs text-muted font-medium">Máx. Permitido</th>
                        <th className="text-right px-3 py-2.5 text-xs text-muted font-medium">Indevido</th>
                        <th className="text-left px-3 py-2.5 text-xs text-muted font-medium">Base Legal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.irregularidades.map((irr, i) => (
                        <tr key={i} className="border-b border-border/30 hover:bg-white/2">
                          <td className="px-5 py-2.5 text-xs text-subtle">{formatDate(irr.data)}</td>
                          <td className="px-3 py-2.5">
                            <p className="text-xs text-foreground">{irr.descricao}</p>
                            <p className="text-xs text-muted">{irr.motivo}</p>
                          </td>
                          <td className="px-3 py-2.5 text-right text-xs text-subtle">{formatBRL(irr.valor_cobrado)}</td>
                          <td className="px-3 py-2.5 text-right text-xs text-subtle">{formatBRL(irr.valor_maximo_permitido)}</td>
                          <td className="px-3 py-2.5 text-right text-xs font-bold text-profit">{formatBRL(irr.valor_indevido)}</td>
                          <td className="px-3 py-2.5 text-xs text-muted">{irr.base_legal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recomendações */}
            {analysis.recomendacoes?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Próximos Passos</h3>
                {analysis.recomendacoes.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 bg-surface border border-border rounded-xl px-4 py-3">
                    <span className="text-xs font-bold text-profit shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-sm text-subtle">{r}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
