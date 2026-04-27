"use client";

import { TrendingUp, DollarSign, FileCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatBRL } from "@/lib/utils/formatters";
import type { NFeAnalysisResult, BatchNFeResult } from "@/lib/wasm/types";

interface CreditSummaryProps {
  result: NFeAnalysisResult | BatchNFeResult;
  isBatch?: boolean;
}

function isBatchResult(r: NFeAnalysisResult | BatchNFeResult): r is BatchNFeResult {
  return "analyses" in r;
}

export function CreditSummary({ result, isBatch }: CreditSummaryProps) {
  const isBatch_ = isBatch || isBatchResult(result);

  const totalRecuperavel = result.total_recuperavel;
  const totalPis = result.total_recuperavel_pis;
  const totalCofins = result.total_recuperavel_cofins;

  let nfesAnalisadas = 1;
  let itensMonofasicos = 0;
  let totalItens = 0;

  if (isBatchResult(result)) {
    nfesAnalisadas = result.total_nfes;
    itensMonofasicos = result.analyses.reduce((s, a) => s + a.itens_monofasicos, 0);
    totalItens = result.analyses.reduce((s, a) => s + a.total_itens, 0);
  } else {
    itensMonofasicos = result.itens_monofasicos;
    totalItens = result.total_itens;
  }

  const hasCredit = totalRecuperavel > 0;

  return (
    <div className="space-y-4">
      {/* Main credit card */}
      <div
        className={cn(
          "rounded-2xl border p-6",
          hasCredit
            ? "bg-profit/5 border-profit/30 profit-glow-border"
            : "bg-surface border-border"
        )}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted font-medium">Total Recuperável</p>
            <p
              className={cn(
                "text-4xl font-bold mt-1 tracking-tight",
                hasCredit ? "text-profit profit-glow" : "text-foreground"
              )}
            >
              {formatBRL(totalRecuperavel)}
            </p>
            {hasCredit && (
              <p className="text-xs text-muted mt-2">
                PIS + COFINS cobrados indevidamente no regime monofásico
              </p>
            )}
          </div>
          <div
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              hasCredit ? "bg-profit/20" : "bg-surface"
            )}
          >
            <DollarSign
              className={cn("w-6 h-6", hasCredit ? "text-profit" : "text-muted")}
            />
          </div>
        </div>

        {hasCredit && (
          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-profit/20">
            <div className="bg-background/60 rounded-xl p-3">
              <p className="text-xs text-muted">PIS Recuperável</p>
              <p className="text-lg font-bold text-profit">{formatBRL(totalPis)}</p>
              <p className="text-xs text-muted">1,65% indevido</p>
            </div>
            <div className="bg-background/60 rounded-xl p-3">
              <p className="text-xs text-muted">COFINS Recuperável</p>
              <p className="text-lg font-bold text-profit">{formatBRL(totalCofins)}</p>
              <p className="text-xs text-muted">7,60% indevido</p>
            </div>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {isBatch_ && (
          <div className="bg-surface border border-border rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-foreground">{nfesAnalisadas}</p>
            <p className="text-xs text-muted mt-0.5">NFes analisadas</p>
          </div>
        )}
        <div className={cn("bg-surface border border-border rounded-xl p-3 text-center", !isBatch_ && "col-span-1")}>
          <p className={cn("text-2xl font-bold", itensMonofasicos > 0 ? "text-risk" : "text-foreground")}>
            {itensMonofasicos}
          </p>
          <p className="text-xs text-muted mt-0.5">Itens monofásicos</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-foreground">{totalItens}</p>
          <p className="text-xs text-muted mt-0.5">Total de itens</p>
        </div>
        {!isBatch_ && (
          <div className="bg-surface border border-border rounded-xl p-3 text-center">
            <p className={cn("text-2xl font-bold", hasCredit ? "text-profit" : "text-foreground")}>
              {totalItens > 0 ? Math.round((itensMonofasicos / totalItens) * 100) : 0}%
            </p>
            <p className="text-xs text-muted mt-0.5">Taxa monofásico</p>
          </div>
        )}
      </div>

      {/* No credit message */}
      {!hasCredit && (
        <div className="bg-surface border border-border rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-muted shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Nenhum crédito identificado
            </p>
            <p className="text-xs text-muted mt-1">
              Os NCMs desta nota não estão sujeitos ao regime monofásico de
              PIS/COFINS, ou os valores não foram destacados na nota.
            </p>
          </div>
        </div>
      )}

      {/* Legal disclaimer */}
      <div className="bg-surface/50 border border-border/50 rounded-xl p-3">
        <div className="flex items-start gap-2">
          <FileCheck className="w-4 h-4 text-muted shrink-0 mt-0.5" />
          <p className="text-xs text-muted/80 leading-relaxed">
            Análise baseada nas Leis 9.718/98, 10.147/00, 10.485/02 e 10.833/03.
            Valores sujeitos a confirmação por contador habilitado. Recomenda-se
            retificação via PER/DCOMP junto à Receita Federal.
          </p>
        </div>
      </div>
    </div>
  );
}
