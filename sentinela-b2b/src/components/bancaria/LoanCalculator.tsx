"use client";

import { useState } from "react";
import { analyzeLoan, buildAmortizationTable, calcParcelaTabelaPrice } from "@/lib/wasm/loader";
import type { LoanAnalysisResult, AmortizationRow, TipoCredito } from "@/lib/wasm/types";
import { TIPO_CREDITO_LABELS } from "@/lib/wasm/types";
import { cn } from "@/lib/utils/cn";
import {
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtPct(n: number) {
  return n.toFixed(2).replace(".", ",") + "%";
}

interface Props {
  onResult?: (result: LoanAnalysisResult) => void;
}

export function LoanCalculator({ onResult }: Props) {
  const [principal, setPrincipal] = useState("");
  const [taxaMensal, setTaxaMensal] = useState("");
  const [prazo, setPrazo] = useState("");
  const [cet, setCet] = useState("");
  const [tipoCredito, setTipoCredito] = useState<TipoCredito>("capital_giro");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LoanAnalysisResult | null>(null);
  const [amort, setAmort] = useState<AmortizationRow[]>([]);
  const [showAmort, setShowAmort] = useState(false);

  async function handleCalculate() {
    const pv = parseFloat(principal.replace(/\./g, "").replace(",", "."));
    const r = parseFloat(taxaMensal.replace(",", "."));
    const n = parseInt(prazo);
    const cetVal = parseFloat(cet.replace(",", ".")) || 0;

    if (!pv || !r || !n) return;

    setLoading(true);
    try {
      const res = await analyzeLoan(pv, r, n, cetVal, tipoCredito);
      const rows = await buildAmortizationTable(pv, r, n, 12);
      setResult(res);
      setAmort(rows);
      onResult?.(res);
    } finally {
      setLoading(false);
    }
  }

  const hasIssues = result && (result.taxa_abusiva || result.has_anatocismo);

  return (
    <div className="space-y-6">
      {/* Input form */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-foreground mb-5 flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-risk/20 flex items-center justify-center">
            <TrendingDown className="w-3 h-3 text-risk" />
          </span>
          Dados do Contrato
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 md:col-span-1 space-y-1.5">
            <label className="text-xs text-muted font-medium">Valor do Empréstimo (R$)</label>
            <input
              type="text"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="Ex: 50.000,00"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-risk/50 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted font-medium">Taxa Mensal (%)</label>
            <input
              type="text"
              value={taxaMensal}
              onChange={(e) => setTaxaMensal(e.target.value)}
              placeholder="Ex: 2,49"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-risk/50 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted font-medium">Prazo (meses)</label>
            <input
              type="number"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              placeholder="Ex: 36"
              min={1}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-risk/50 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-muted font-medium flex items-center gap-1">
              CET Anual (%)
              <span className="text-muted/50 font-normal">— opcional</span>
            </label>
            <input
              type="text"
              value={cet}
              onChange={(e) => setCet(e.target.value)}
              placeholder="Ex: 38,50"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-risk/50 transition-colors"
            />
          </div>

          <div className="col-span-2 space-y-1.5">
            <label className="text-xs text-muted font-medium">Tipo de Crédito</label>
            <select
              value={tipoCredito}
              onChange={(e) => setTipoCredito(e.target.value as TipoCredito)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-risk/50 transition-colors"
            >
              {Object.entries(TIPO_CREDITO_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={loading || !principal || !taxaMensal || !prazo}
          className={cn(
            "mt-5 w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200",
            "border border-risk/30 bg-risk/10 text-risk",
            "hover:bg-risk/20 hover:border-risk/50",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
        >
          {loading ? "Calculando..." : "Analisar Contrato"}
        </button>
      </div>

      {/* Results */}
      {result && result.status === "OK" && (
        <>
          {/* Alert banner */}
          {hasIssues && (
            <div className="border border-danger/30 bg-danger/5 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-danger">
                  Irregularidades detectadas no contrato
                </p>
                <p className="text-xs text-muted mt-1">
                  {result.taxa_abusiva && "Taxa acima de 50% da média BACEN. "}
                  {result.has_anatocismo && "Indício de anatocismo (Súmula 121 STF). "}
                  Consulte um advogado para ação revisional.
                </p>
              </div>
            </div>
          )}

          {!hasIssues && (
            <div className="border border-profit/20 bg-profit/5 rounded-2xl p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-profit shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                Nenhuma irregularidade flagrante detectada nos parâmetros fornecidos.
              </p>
            </div>
          )}

          {/* Main metrics */}
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              label="Parcela Cobrada"
              value={fmt(result.parcela_cobrada)}
              sub={`${prazo} meses`}
              color="text-danger"
            />
            <MetricCard
              label="Parcela Justa (BACEN)"
              value={fmt(result.parcela_justa)}
              sub={`Taxa ref. ${fmtPct(result.taxa_bacen_referencia)} a.m.`}
              color="text-profit"
            />
            <MetricCard
              label="Excesso por Parcela"
              value={fmt(result.excesso_por_parcela)}
              sub="Diferença mensal"
              color={result.excesso_por_parcela > 0 ? "text-risk" : "text-muted"}
            />
            <MetricCard
              label="Total Contestável"
              value={fmt(result.excesso_total)}
              sub="Excesso acumulado"
              color={result.excesso_total > 0 ? "text-danger" : "text-muted"}
              highlight={result.excesso_total > 0}
            />
          </div>

          {/* Rate comparison */}
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">
              Comparativo de Taxas
            </h3>
            <RateBar
              label="Taxa do Contrato"
              monthly={result.taxa_mensal_contrato}
              annual={result.taxa_anual_contrato}
              isHigh={result.taxa_abusiva}
            />
            <RateBar
              label={`Taxa BACEN (${TIPO_CREDITO_LABELS[tipoCredito]})`}
              monthly={result.taxa_bacen_referencia}
              annual={result.taxa_bacen_anual}
              isHigh={false}
            />
            {result.taxa_cet_anual > 0 && (
              <RateBar
                label="CET Declarado"
                monthly={0}
                annual={result.taxa_cet_anual}
                isHigh={result.has_anatocismo}
                hideMonthly
              />
            )}

            {/* Flags */}
            <div className="pt-2 border-t border-border space-y-2">
              <Flag
                label="Taxa Abusiva (>50% acima BACEN)"
                active={result.taxa_abusiva}
                law="Súmula 296 STJ + BACEN médias mensais"
              />
              <Flag
                label="Anatocismo detectado (Súmula 121 STF)"
                active={result.has_anatocismo}
                law="Súmula 121 STF — Art. 4º da Lei 1.521/1951"
              />
            </div>
          </div>

          {/* Totals */}
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-2">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">
              Total do Contrato
            </h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Total pago (contrato)</span>
              <span className="text-danger font-semibold">{fmt(result.total_pago_contrato)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Total justo (BACEN)</span>
              <span className="text-profit font-semibold">{fmt(result.total_justo_contrato)}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-border pt-2 mt-2">
              <span className="text-foreground font-medium">Diferença contestável</span>
              <span className={cn(
                "font-bold",
                result.excesso_total > 0 ? "text-danger" : "text-muted"
              )}>
                {fmt(result.excesso_total)}
              </span>
            </div>
          </div>

          {/* Amortization table toggle */}
          {amort.length > 0 && (
            <div className="bg-surface border border-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowAmort((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-foreground hover:bg-white/5 transition-colors"
              >
                <span>Tabela de Amortização (Price) — primeiros {amort.length} meses</span>
                {showAmort ? (
                  <ChevronUp className="w-4 h-4 text-muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted" />
                )}
              </button>

              {showAmort && (
                <div className="overflow-x-auto border-t border-border">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-background">
                        {["Mês", "Parcela", "Juros", "Amortização", "Saldo"].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-muted font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {amort.map((row) => (
                        <tr
                          key={row.mes}
                          className="border-b border-border/50 hover:bg-white/2 transition-colors"
                        >
                          <td className="px-4 py-2 text-muted">{row.mes}</td>
                          <td className="px-4 py-2 text-foreground">{fmt(row.parcela)}</td>
                          <td className="px-4 py-2 text-risk">{fmt(row.juros)}</td>
                          <td className="px-4 py-2 text-profit">{fmt(row.amortizacao)}</td>
                          <td className="px-4 py-2 text-subtle">{fmt(row.saldo)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  color,
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-surface border rounded-xl p-4",
        highlight ? "border-danger/40 bg-danger/5" : "border-border"
      )}
    >
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className={cn("text-xl font-bold", color)}>{value}</p>
      <p className="text-[11px] text-muted/70 mt-0.5">{sub}</p>
    </div>
  );
}

function RateBar({
  label,
  monthly,
  annual,
  isHigh,
  hideMonthly,
}: {
  label: string;
  monthly: number;
  annual: number;
  isHigh: boolean;
  hideMonthly?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted text-xs">{label}</span>
      <div className="flex items-center gap-3">
        {!hideMonthly && (
          <span className="text-xs text-muted/70">{fmtPct(monthly)} a.m.</span>
        )}
        <span
          className={cn(
            "text-sm font-semibold",
            isHigh ? "text-danger" : "text-foreground"
          )}
        >
          {fmtPct(annual)} a.a.
        </span>
        {isHigh && <AlertTriangle className="w-3.5 h-3.5 text-danger" />}
      </div>
    </div>
  );
}

function Flag({ label, active, law }: { label: string; active: boolean; law: string }) {
  return (
    <div className="flex items-start gap-2">
      <div
        className={cn(
          "w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5",
          active ? "bg-danger/20" : "bg-border"
        )}
      >
        {active ? (
          <AlertTriangle className="w-2.5 h-2.5 text-danger" />
        ) : (
          <CheckCircle className="w-2.5 h-2.5 text-muted" />
        )}
      </div>
      <div>
        <p className={cn("text-xs font-medium", active ? "text-danger" : "text-muted")}>
          {label}
        </p>
        <p className="text-[11px] text-muted/60">{law}</p>
      </div>
    </div>
  );
}
