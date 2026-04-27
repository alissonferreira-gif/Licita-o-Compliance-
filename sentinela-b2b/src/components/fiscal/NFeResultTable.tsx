"use client";

import { CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { formatBRL } from "@/lib/utils/formatters";
import type { NFeItemResult } from "@/lib/wasm/types";

interface NFeResultTableProps {
  itens: NFeItemResult[];
  showAll?: boolean;
}

export function NFeResultTable({ itens, showAll = false }: NFeResultTableProps) {
  const [expanded, setExpanded] = useState(showAll);
  const monofasicos = itens.filter((i) => i.is_monofasico);
  const others = itens.filter((i) => !i.is_monofasico);

  const displayed = expanded ? itens : itens.slice(0, 8);

  if (itens.length === 0) return null;

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Itens da NFe</h3>
        <div className="flex items-center gap-3">
          {monofasicos.length > 0 && (
            <span className="text-xs bg-profit/10 text-profit border border-profit/20 rounded-full px-2.5 py-0.5 font-medium">
              {monofasicos.length} monofásicos
            </span>
          )}
          <span className="text-xs text-muted">{itens.length} itens total</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left px-5 py-2.5 text-xs text-muted font-medium">Produto</th>
              <th className="text-left px-3 py-2.5 text-xs text-muted font-medium">NCM</th>
              <th className="text-right px-3 py-2.5 text-xs text-muted font-medium">Valor Prod.</th>
              <th className="text-right px-3 py-2.5 text-xs text-muted font-medium">PIS Cobrado</th>
              <th className="text-right px-3 py-2.5 text-xs text-muted font-medium">COFINS Cobrado</th>
              <th className="text-right px-3 py-2.5 text-xs text-muted font-medium">Recuperável</th>
              <th className="text-center px-3 py-2.5 text-xs text-muted font-medium">Regime</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((item, idx) => (
              <tr
                key={idx}
                className={cn(
                  "border-b border-border/30 transition-colors",
                  item.is_monofasico
                    ? "bg-profit/3 hover:bg-profit/5"
                    : "hover:bg-white/2"
                )}
              >
                <td className="px-5 py-2.5">
                  <div className="max-w-48 truncate text-foreground" title={item.descricao}>
                    {item.descricao || "—"}
                  </div>
                  {item.categoria && (
                    <div className="text-xs text-muted truncate">{item.categoria}</div>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  <span className="font-mono text-xs text-subtle bg-background px-1.5 py-0.5 rounded">
                    {item.ncm}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right text-subtle text-xs">
                  {formatBRL(item.valor_produto)}
                </td>
                <td className="px-3 py-2.5 text-right text-xs">
                  <span className={item.is_monofasico ? "text-profit" : "text-subtle"}>
                    {formatBRL(item.pis_cobrado)}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right text-xs">
                  <span className={item.is_monofasico ? "text-profit" : "text-subtle"}>
                    {formatBRL(item.cofins_cobrado)}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right">
                  {item.is_monofasico ? (
                    <span className="text-profit font-semibold text-xs">
                      {formatBRL(item.recuperavel_pis + item.recuperavel_cofins)}
                    </span>
                  ) : (
                    <span className="text-muted text-xs">R$ 0,00</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-center">
                  {item.is_monofasico ? (
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-profit" />
                      <span className="text-[10px] text-profit font-medium">MONO</span>
                    </div>
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-muted mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {itens.length > 8 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-3 flex items-center justify-center gap-2 text-xs text-muted hover:text-foreground border-t border-border transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              Mostrar menos
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              Ver todos os {itens.length} itens
            </>
          )}
        </button>
      )}
    </div>
  );
}
