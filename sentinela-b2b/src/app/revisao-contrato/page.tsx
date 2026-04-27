"use client";

import { useState, useCallback } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { SmartDropzone } from "@/components/dropzone/SmartDropzone";
import { LoanCalculator } from "@/components/bancaria/LoanCalculator";
import { ContractIssueList } from "@/components/bancaria/ContractIssueCard";
import type { LoanAnalysisResult } from "@/lib/wasm/types";
import {
  BanknoteIcon,
  Calculator,
  FileText,
  AlertTriangle,
  Info,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Tab = "calculator" | "contract";

interface ContractAnalysis {
  banco?: string;
  tipo_produto?: string;
  valor_contrato?: number;
  irregularidades?: Array<{
    tipo: string;
    descricao: string;
    trecho_contrato?: string;
    impacto_estimado?: number;
    base_legal: string;
    severidade: "low" | "medium" | "high" | "critical";
  }>;
  valor_total_contestavel?: number;
  recomendacoes?: string[];
  fundamentacao_acao_judicial?: string;
  resumo?: string;
  error?: string;
}

export default function RevisaoContratoPage() {
  const [tab, setTab] = useState<Tab>("calculator");
  const [loanResult, setLoanResult] = useState<LoanAnalysisResult | null>(null);

  // Contract PDF upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [contractResult, setContractResult] = useState<ContractAnalysis | null>(null);
  const [contractError, setContractError] = useState<string | null>(null);

  const handleContractFiles = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(10);
    setContractResult(null);
    setContractError(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("mode", "contrato");

    setUploadProgress(30);

    try {
      const res = await fetch("/api/gemini", { method: "POST", body: fd });
      setUploadProgress(80);
      const data = await res.json();

      if (!res.ok || data.error) {
        setContractError(data.error ?? "Erro na análise do contrato.");
      } else {
        setContractResult(data);
      }
      setUploadProgress(100);
    } catch {
      setContractError("Falha na comunicação com a API. Verifique sua conexão.");
      setUploadProgress(0);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 800);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-full">
      <TopBar
        title="Revisão Bancária"
        subtitle="Scanner de juros abusivos, anatocismo e venda casada"
      />

      <div className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="border border-risk/20 bg-risk/5 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-risk/20 rounded-xl flex items-center justify-center shrink-0">
            <BanknoteIcon className="w-5 h-5 text-risk" />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-bold text-foreground">
              Scanner de Abusos Bancários
            </h1>
            <p className="text-sm text-muted mt-1 max-w-2xl">
              Compare as taxas do seu contrato com as médias do BACEN. Detecta{" "}
              <span className="text-risk font-medium">anatocismo</span> (Súmula 121 STF),{" "}
              <span className="text-risk font-medium">juros abusivos</span> e{" "}
              <span className="text-risk font-medium">venda casada</span> (Art. 39 CDC).
            </p>
          </div>
        </div>

        {/* Info boxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              icon: AlertTriangle,
              color: "text-danger",
              bg: "bg-danger/10",
              title: "Anatocismo",
              desc: "Juros sobre juros vedados pela Súmula 121 STF",
            },
            {
              icon: AlertTriangle,
              color: "text-risk",
              bg: "bg-risk/10",
              title: "Juros Abusivos",
              desc: "Taxa >50% acima da média BACEN para a modalidade",
            },
            {
              icon: AlertTriangle,
              color: "text-risk",
              bg: "bg-risk/10",
              title: "Venda Casada",
              desc: "Seguros e produtos compulsórios (Art. 39, I CDC)",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-surface border border-border rounded-xl p-4 flex items-start gap-3"
            >
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", item.bg)}>
                <item.icon className={cn("w-4 h-4", item.color)} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab("calculator")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              tab === "calculator"
                ? "bg-risk/10 text-risk border border-risk/20"
                : "text-muted hover:text-foreground"
            )}
          >
            <Calculator className="w-4 h-4" />
            Calculadora Manual
          </button>
          <button
            onClick={() => setTab("contract")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              tab === "contract"
                ? "bg-risk/10 text-risk border border-risk/20"
                : "text-muted hover:text-foreground"
            )}
          >
            <FileText className="w-4 h-4" />
            Analisar Contrato PDF
          </button>
        </div>

        {/* Tab content */}
        {tab === "calculator" && (
          <LoanCalculator onResult={setLoanResult} />
        )}

        {tab === "contract" && (
          <div className="space-y-6">
            <SmartDropzone
              mode="bancaria"
              onFiles={handleContractFiles}
              processing={uploading}
              progress={uploadProgress}
            />

            {contractError && (
              <div className="border border-danger/30 bg-danger/5 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                <p className="text-sm text-danger">{contractError}</p>
              </div>
            )}

            {contractResult && !contractResult.error && (
              <div className="space-y-4">
                {/* Contract summary */}
                <div className="bg-surface border border-border rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {contractResult.banco ?? "Contrato Bancário"}
                        {contractResult.tipo_produto && (
                          <span className="text-muted font-normal"> — {contractResult.tipo_produto}</span>
                        )}
                      </h3>
                      {contractResult.valor_contrato && (
                        <p className="text-xs text-muted mt-0.5">
                          Valor:{" "}
                          {contractResult.valor_contrato.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                      )}
                    </div>
                    {contractResult.valor_total_contestavel !== undefined &&
                      contractResult.valor_total_contestavel > 0 && (
                        <div className="text-right">
                          <p className="text-xs text-muted">Total contestável</p>
                          <p className="text-xl font-bold text-danger">
                            {contractResult.valor_total_contestavel.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </p>
                        </div>
                      )}
                  </div>

                  {contractResult.resumo && (
                    <p className="text-xs text-muted leading-relaxed border-t border-border pt-3">
                      {contractResult.resumo}
                    </p>
                  )}
                </div>

                {/* Issues */}
                {contractResult.irregularidades && (
                  <ContractIssueList
                    issues={contractResult.irregularidades}
                    totalContestavel={contractResult.valor_total_contestavel ?? 0}
                  />
                )}

                {/* Legal basis */}
                {contractResult.fundamentacao_acao_judicial && (
                  <div className="bg-surface border border-border rounded-2xl p-5 space-y-2">
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
                      Fundamentação para Ação Revisional
                    </h3>
                    <p className="text-sm text-foreground leading-relaxed">
                      {contractResult.fundamentacao_acao_judicial}
                    </p>
                  </div>
                )}

                {/* Recommendations */}
                {contractResult.recomendacoes && contractResult.recomendacoes.length > 0 && (
                  <div className="bg-surface border border-border rounded-2xl p-5 space-y-3">
                    <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
                      Próximos Passos
                    </h3>
                    <ul className="space-y-2">
                      {contractResult.recomendacoes.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="w-4 h-4 text-risk shrink-0 mt-0.5" />
                          <span className="text-subtle">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex items-start gap-2 text-xs text-muted/60">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <p>
                Análise gerada por IA (Gemini 1.5 Flash) com fins informativos. Não substitui
                consultoria jurídica especializada. Consulte um advogado para ação revisional.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
