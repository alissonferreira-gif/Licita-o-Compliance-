"use client";

import { useState, useCallback } from "react";
import {
  RotateCcw,
  Download,
  Crosshair,
  TrendingUp,
  Building2,
  Calendar,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { SmartDropzone } from "@/components/dropzone/SmartDropzone";
import { RiskBadge } from "@/components/licitacao/RiskBadge";
import { ObjectionCard } from "@/components/licitacao/ObjectionCard";
import { formatBRL, formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

interface EditalAnalysis {
  objeto: string;
  modalidade: string;
  orgao: string;
  valor_estimado: number;
  data_abertura: string | null;
  numero_edital: string;
  risk_level: "low" | "medium" | "high" | "critical";
  risk_score: number;
  oportunidade_score: number;
  clauses: Array<{
    numero: string;
    texto: string;
    tipo: string;
    severidade: string;
    problema: string;
    fundamentacao: string;
  }>;
  objections: Array<{
    titulo: string;
    fundamento_legal: string;
    texto_impugnacao: string;
    probabilidade_sucesso: "alta" | "media" | "baixa";
    prazo_impugnacao?: string;
  }>;
  pontos_favoraveis: string[];
  recomendacoes: string[];
  resumo_executivo: string;
  error?: string;
}

export default function LicitacoesPage() {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<EditalAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setProcessing(true);
    setProgress(10);
    setAnalysis(null);
    setError(null);

    // Simulate progress while waiting for Gemini
    const ticker = setInterval(() => {
      setProgress((p) => Math.min(p + 3, 88));
    }, 600);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("mode", "licitacao");

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

      const data: EditalAnalysis = await res.json();
      setAnalysis(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao analisar edital");
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

  const severityColor = {
    low: "text-profit",
    medium: "text-risk",
    high: "text-orange-400",
    critical: "text-danger",
  } as Record<string, string>;

  const isLocked = analysis && analysis.objections.length > 1;

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Licitações"
        subtitle="Análise de editais com IA — Lei 14.133/2021"
      />

      <div className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-8">
        {/* Upload zone */}
        {!analysis && (
          <>
            <SmartDropzone
              mode="licitacao"
              onFiles={handleFiles}
              processing={processing}
              progress={progress}
            />

            {error && (
              <div className="bg-danger/10 border border-danger/30 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-danger">
                    Erro na análise
                  </p>
                  <p className="text-xs text-muted mt-1">{error}</p>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-muted hover:text-foreground flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Tentar novamente
                </button>
              </div>
            )}

            {/* Tips */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  icon: Crosshair,
                  title: "Cláusulas Restritivas",
                  desc: "A IA identifica exigências ilegais que limitam a concorrência (Art. 9º)",
                },
                {
                  icon: TrendingUp,
                  title: "Score de Oportunidade",
                  desc: "Avalia se vale a pena participar ou se é mais estratégico impugnar",
                },
                {
                  icon: Building2,
                  title: "Texto Jurídico Pronto",
                  desc: "Gera a petição de impugnação fundamentada na Lei 14.133/2021",
                },
              ].map((tip, i) => (
                <div
                  key={i}
                  className="bg-surface border border-border rounded-xl p-4"
                >
                  <div className="w-8 h-8 bg-background rounded-lg flex items-center justify-center mb-3">
                    <tip.icon className="w-4 h-4 text-muted" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {tip.title}
                  </p>
                  <p className="text-xs text-muted mt-1">{tip.desc}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Results */}
        {analysis && (
          <div className="space-y-6 animate-float-up">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Análise do Edital
                </h2>
                {analysis.numero_edital && (
                  <p className="text-xs text-muted mt-0.5">
                    {analysis.numero_edital}
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
                  Exportar PDF
                </button>
              </div>
            </div>

            {/* Overview card */}
            <div className="bg-surface border border-border rounded-2xl p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-lg font-semibold text-foreground leading-snug">
                    {analysis.objeto}
                  </p>
                  <p className="text-sm text-muted mt-1">{analysis.orgao}</p>
                </div>
                <RiskBadge
                  level={analysis.risk_level}
                  score={analysis.risk_score}
                  size="lg"
                />
              </div>

              {/* Meta row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-background rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-profit" />
                    <p className="text-xs text-muted">Valor Estimado</p>
                  </div>
                  <p className="text-sm font-bold text-profit">
                    {analysis.valor_estimado
                      ? formatBRL(analysis.valor_estimado)
                      : "Não informado"}
                  </p>
                </div>
                <div className="bg-background rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-muted" />
                    <p className="text-xs text-muted">Modalidade</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {analysis.modalidade || "—"}
                  </p>
                </div>
                <div className="bg-background rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-muted" />
                    <p className="text-xs text-muted">Abertura</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {analysis.data_abertura
                      ? formatDate(analysis.data_abertura)
                      : "—"}
                  </p>
                </div>
                <div className="bg-background rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-muted" />
                    <p className="text-xs text-muted">Score Oportunidade</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "text-sm font-bold",
                        analysis.oportunidade_score >= 70
                          ? "text-profit"
                          : analysis.oportunidade_score >= 40
                          ? "text-risk"
                          : "text-danger"
                      )}
                    >
                      {analysis.oportunidade_score}/100
                    </p>
                  </div>
                </div>
              </div>

              {/* Resumo */}
              {analysis.resumo_executivo && (
                <div className="bg-background rounded-xl p-4 border-l-2 border-profit/50">
                  <p className="text-xs font-medium text-muted mb-1">
                    Resumo Executivo
                  </p>
                  <p className="text-sm text-subtle leading-relaxed">
                    {analysis.resumo_executivo}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Restrictive clauses */}
              {analysis.clauses.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground">
                    Cláusulas Identificadas
                    <span className="ml-2 text-xs text-muted font-normal">
                      ({analysis.clauses.length})
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {analysis.clauses.map((clause, i) => (
                      <div
                        key={i}
                        className="bg-surface border border-border rounded-xl p-4 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-mono text-muted">
                            Item {clause.numero}
                          </p>
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase",
                              clause.tipo === "illegal"
                                ? "text-danger"
                                : clause.tipo === "restrictive"
                                ? "text-risk"
                                : "text-muted"
                            )}
                          >
                            {clause.tipo === "illegal"
                              ? "ILEGAL"
                              : clause.tipo === "restrictive"
                              ? "RESTRITIVA"
                              : clause.tipo === "ambiguous"
                              ? "AMBÍGUA"
                              : "FAVORÁVEL"}
                          </span>
                        </div>
                        <p className="text-xs text-subtle italic leading-relaxed line-clamp-3">
                          "{clause.texto}"
                        </p>
                        <p className="text-xs text-foreground">
                          {clause.problema}
                        </p>
                        <p className="text-xs text-muted">
                          Base: {clause.fundamentacao}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Favorable points */}
              {analysis.pontos_favoraveis.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-foreground">
                    Pontos Favoráveis
                  </h3>
                  <div className="bg-surface border border-border rounded-xl p-4 space-y-2">
                    {analysis.pontos_favoraveis.map((p, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-profit mt-1.5 shrink-0" />
                        <p className="text-sm text-subtle">{p}</p>
                      </div>
                    ))}
                  </div>

                  {analysis.recomendacoes.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-foreground">
                        Recomendações
                      </h4>
                      {analysis.recomendacoes.map((r, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 bg-surface border border-border rounded-lg px-3 py-2"
                        >
                          <span className="text-xs font-bold text-muted shrink-0 mt-0.5">
                            {i + 1}.
                          </span>
                          <p className="text-xs text-subtle">{r}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Objections */}
            {analysis.objections.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-foreground">
                    Impugnações Sugeridas
                    <span className="ml-2 text-xs text-muted font-normal">
                      ({analysis.objections.length})
                    </span>
                  </h3>
                  {isLocked && (
                    <div className="flex items-center gap-2 text-xs text-muted bg-surface border border-border px-3 py-1.5 rounded-full">
                      🔒 Desbloqueie para copiar os textos jurídicos
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {analysis.objections.map((obj, i) => (
                    <ObjectionCard
                      key={i}
                      objection={obj}
                      index={i}
                      locked={isLocked ? i > 0 : false}
                    />
                  ))}
                </div>

                {isLocked && (
                  <div className="bg-profit/5 border border-profit/30 rounded-2xl p-5 text-center">
                    <p className="text-base font-semibold text-foreground">
                      Desbloqueie o relatório completo
                    </p>
                    <p className="text-sm text-muted mt-1">
                      Inclui todos os textos jurídicos prontos para copiar e
                      protocolar
                    </p>
                    <button className="mt-4 bg-profit hover:bg-profit-dim text-background font-semibold text-sm px-8 py-2.5 rounded-xl transition-colors">
                      Desbloquear por R$ 97,00
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
