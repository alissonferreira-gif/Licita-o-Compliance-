import { DollarSign, Crosshair, BanknoteIcon, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface ImpactMetric {
  label: string;
  value: string;
  sub: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
}

const metrics: ImpactMetric[] = [
  {
    label: "Total Recuperável Fiscal",
    value: "R$ 0,00",
    sub: "PIS/COFINS monofásico — créditos identificados",
    href: "/auditoria-fiscal",
    icon: DollarSign,
    color: "text-profit",
    bg: "bg-profit/10",
    border: "border-profit/20",
  },
  {
    label: "Potencial em Licitações",
    value: "R$ 0,00",
    sub: "Contratos públicos com cláusulas impugnáveis",
    href: "/licitacoes",
    icon: Crosshair,
    color: "text-risk",
    bg: "bg-risk/10",
    border: "border-risk/20",
  },
  {
    label: "Economia Bancária",
    value: "R$ 0,00",
    sub: "Juros abusivos e tarifas indevidas contestáveis",
    href: "/revisao-contrato",
    icon: BanknoteIcon,
    color: "text-profit",
    bg: "bg-profit/10",
    border: "border-profit/20",
  },
];

export function ImpactPanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((m) => (
        <Link
          key={m.href}
          href={m.href}
          className={cn(
            "group bg-surface border rounded-2xl p-5 transition-all duration-200",
            "hover:scale-[1.01] flex flex-col gap-3",
            m.border,
            `hover:${m.bg}`
          )}
        >
          <div className="flex items-start justify-between">
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", m.bg)}>
              <m.icon className={cn("w-4 h-4", m.color)} />
            </div>
            <ArrowRight
              className={cn(
                "w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity",
                m.color
              )}
            />
          </div>
          <div>
            <p className="text-xs text-muted font-medium mb-1">{m.label}</p>
            <p className={cn("text-2xl font-bold", m.color)}>{m.value}</p>
            <p className="text-[11px] text-muted/70 mt-1 leading-snug">{m.sub}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
