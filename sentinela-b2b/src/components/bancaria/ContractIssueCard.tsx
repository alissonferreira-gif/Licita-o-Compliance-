"use client";

import { AlertTriangle, Scale, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Issue {
  tipo: string;
  descricao: string;
  trecho_contrato?: string;
  impacto_estimado?: number;
  base_legal: string;
  severidade: "low" | "medium" | "high" | "critical";
}

const TIPO_LABELS: Record<string, string> = {
  anatocismo: "Anatocismo",
  juros_abusivos: "Juros Abusivos",
  venda_casada: "Venda Casada",
  tac_tec_ilegal: "TAC/TEC Ilegal",
  cet_divergente: "CET Divergente",
  clausula_abusiva: "Cláusula Abusiva",
};

const SEV_STYLES: Record<string, { border: string; bg: string; badge: string; text: string }> = {
  critical: {
    border: "border-danger/40",
    bg: "bg-danger/5",
    badge: "bg-danger/20 text-danger",
    text: "text-danger",
  },
  high: {
    border: "border-risk/40",
    bg: "bg-risk/5",
    badge: "bg-risk/20 text-risk",
    text: "text-risk",
  },
  medium: {
    border: "border-border",
    bg: "bg-surface",
    badge: "bg-border text-subtle",
    text: "text-subtle",
  },
  low: {
    border: "border-border",
    bg: "bg-surface",
    badge: "bg-border text-muted",
    text: "text-muted",
  },
};

export function ContractIssueCard({ issue }: { issue: Issue }) {
  const sev = SEV_STYLES[issue.severidade] ?? SEV_STYLES.medium;

  return (
    <div className={cn("border rounded-2xl p-5 space-y-3", sev.border, sev.bg)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className={cn("w-4 h-4 shrink-0", sev.text)} />
          <span className="text-sm font-semibold text-foreground">
            {TIPO_LABELS[issue.tipo] ?? issue.tipo}
          </span>
        </div>
        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", sev.badge)}>
          {issue.severidade}
        </span>
      </div>

      <p className="text-xs text-muted leading-relaxed">{issue.descricao}</p>

      {issue.trecho_contrato && (
        <blockquote className="border-l-2 border-border pl-3 text-[11px] text-muted/70 italic leading-relaxed">
          "{issue.trecho_contrato}"
        </blockquote>
      )}

      <div className="flex items-start justify-between gap-3 pt-1 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-muted shrink-0" />
          <span className="text-[11px] text-muted">{issue.base_legal}</span>
        </div>
        {issue.impacto_estimado !== undefined && issue.impacto_estimado > 0 && (
          <span className={cn("text-xs font-bold", sev.text)}>
            {issue.impacto_estimado.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        )}
      </div>
    </div>
  );
}

export function ContractIssueList({
  issues,
  totalContestavel,
}: {
  issues: Issue[];
  totalContestavel: number;
}) {
  if (issues.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          {issues.length} irregularidade{issues.length > 1 ? "s" : ""} encontrada
          {issues.length > 1 ? "s" : ""}
        </h3>
        {totalContestavel > 0 && (
          <span className="text-sm font-bold text-danger">
            {totalContestavel.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}{" "}
            contestável
          </span>
        )}
      </div>

      {issues.map((issue, i) => (
        <ContractIssueCard key={i} issue={issue} />
      ))}
    </div>
  );
}
