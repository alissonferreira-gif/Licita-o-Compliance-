"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Copy, Check, Scale, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Objection {
  titulo: string;
  fundamento_legal: string;
  texto_impugnacao: string;
  probabilidade_sucesso: "alta" | "media" | "baixa";
  prazo_impugnacao?: string;
}

interface ObjectionCardProps {
  objection: Objection;
  index: number;
  locked?: boolean;
}

const successConfig = {
  alta: { label: "Alta probabilidade", color: "text-profit", bg: "bg-profit/10" },
  media: { label: "Média probabilidade", color: "text-risk", bg: "bg-risk/10" },
  baixa: { label: "Baixa probabilidade", color: "text-muted", bg: "bg-muted/10" },
};

export function ObjectionCard({ objection, index, locked = false }: ObjectionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const successCfg = successConfig[objection.probabilidade_sucesso] || successConfig.media;

  const handleCopy = async () => {
    if (locked) return;
    await navigator.clipboard.writeText(objection.texto_impugnacao);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-xl overflow-hidden transition-all duration-200",
        expanded && "border-profit/30"
      )}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 px-5 py-4 text-left hover:bg-white/2 transition-colors"
      >
        <div className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-xs font-bold text-muted">{index + 1}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-foreground leading-snug">
              {objection.titulo}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <div
                className={cn(
                  "text-[10px] font-medium px-2 py-0.5 rounded-full",
                  successCfg.bg,
                  successCfg.color
                )}
              >
                {successCfg.label}
              </div>
              {expanded ? (
                <ChevronUp className="w-4 h-4 text-muted" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted" />
              )}
            </div>
          </div>
          <p className="text-xs text-muted mt-1">{objection.fundamento_legal}</p>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-border/50">
          {objection.prazo_impugnacao && (
            <div className="flex items-center gap-2 pt-3">
              <Scale className="w-3.5 h-3.5 text-risk shrink-0" />
              <p className="text-xs text-risk">{objection.prazo_impugnacao}</p>
            </div>
          )}

          <div className="bg-background rounded-xl p-4 relative">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-muted uppercase tracking-wider">
                Texto da Impugnação
              </p>
              <button
                onClick={handleCopy}
                className={cn(
                  "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-all",
                  locked
                    ? "text-muted cursor-not-allowed opacity-50"
                    : "text-profit bg-profit/10 hover:bg-profit/20"
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copiar
                  </>
                )}
              </button>
            </div>

            {locked ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-3 bg-border rounded",
                      i === 3 && "w-2/3"
                    )}
                  />
                ))}
                <div className="absolute inset-0 flex items-center justify-center bg-surface/60 rounded-xl">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">
                      🔒 Desbloqueie o relatório
                    </p>
                    <p className="text-xs text-muted mt-1">
                      para copiar o texto jurídico completo
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-subtle leading-relaxed whitespace-pre-wrap">
                {objection.texto_impugnacao}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
