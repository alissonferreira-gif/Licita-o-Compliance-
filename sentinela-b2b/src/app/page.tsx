import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { KPICard } from "@/components/dashboard/KPICard";
import { RecoveryChart } from "@/components/dashboard/RecoveryChart";
import {
  Shield,
  Crosshair,
  DollarSign,
  TrendingUp,
  FileText,
  Building2,
  ArrowRight,
  Zap,
} from "lucide-react";

// Static demo data — replaced by Supabase queries once auth is configured
const demoChartData = [
  { month: "Jan", recuperado: 0, contratos: 0 },
  { month: "Fev", recuperado: 0, contratos: 0 },
  { month: "Mar", recuperado: 0, contratos: 0 },
  { month: "Abr", recuperado: 0, contratos: 0 },
];

const quickActions = [
  {
    href: "/auditoria-fiscal",
    icon: Shield,
    label: "Auditar NFe",
    desc: "Upload de XML para calcular créditos PIS/COFINS",
    accent: "border-profit/20 hover:border-profit/50 hover:bg-profit/5",
    iconBg: "bg-profit/10 text-profit",
    tag: "DEFESA",
    tagColor: "text-risk",
  },
  {
    href: "/licitacoes",
    icon: Crosshair,
    label: "Analisar Edital",
    desc: "Upload de PDF para análise de cláusulas restritivas",
    accent: "border-border hover:border-profit/40 hover:bg-white/2",
    iconBg: "bg-background text-muted",
    tag: "ATAQUE",
    tagColor: "text-profit",
  },
  {
    href: "/auditoria-bancaria",
    icon: Building2,
    label: "Auditar Extrato",
    desc: "Detecta tarifas bancárias cobradas indevidamente",
    accent: "border-border hover:border-profit/40 hover:bg-white/2",
    iconBg: "bg-background text-muted",
    tag: "DEFESA",
    tagColor: "text-risk",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Dashboard" subtitle="Visão geral do seu capital recuperável" />

      <div className="flex-1 p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-profit/10 via-profit/5 to-transparent border border-profit/20 rounded-2xl p-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-profit/20 rounded-xl flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-profit" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Bem-vindo ao SENTINELA B2B
              </h1>
              <p className="text-sm text-subtle mt-1 max-w-xl">
                <span className="text-profit font-semibold">
                  Nós encontramos o dinheiro que sua empresa esqueceu na mesa.
                </span>{" "}
                Seja no imposto pago a mais ou no contrato que você não venceu.
                Comece fazendo upload de uma NFe ou um edital.
              </p>
            </div>
          </div>
          <Link
            href="/configuracoes"
            className="shrink-0 text-xs text-muted hover:text-foreground flex items-center gap-1 transition-colors"
          >
            Configurar
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Recuperável"
            value="R$ 0,00"
            subtitle="PIS/COFINS monofásico"
            variant="profit"
            icon={DollarSign}
            trend="Faça sua primeira análise"
          />
          <KPICard
            title="Contratos em Vista"
            value="R$ 0,00"
            subtitle="Editais analisados"
            variant="neutral"
            icon={TrendingUp}
          />
          <KPICard
            title="NFes Analisadas"
            value="0"
            subtitle="Este mês"
            variant="neutral"
            icon={FileText}
          />
          <KPICard
            title="Editais de Risco"
            value="0"
            subtitle="Requerem impugnação"
            variant="risk"
            icon={Crosshair}
          />
        </div>

        {/* Chart */}
        <RecoveryChart data={demoChartData} />

        {/* Quick actions */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-4">
            Começar agora
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`group bg-surface border rounded-2xl p-5 transition-all duration-200 flex flex-col gap-4 ${action.accent}`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${action.iconBg}`}
                  >
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold tracking-widest ${action.tagColor}`}
                  >
                    {action.tag}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {action.label}
                  </p>
                  <p className="text-xs text-muted mt-1">{action.desc}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted group-hover:text-profit transition-colors">
                  Começar
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h2 className="text-base font-semibold text-foreground mb-5">
            Como o SENTINELA funciona
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Faça upload do arquivo",
                desc: "XML de NFe para auditoria fiscal ou PDF de edital para análise de licitação",
                color: "text-profit",
              },
              {
                step: "02",
                title: "Engine processa instantaneamente",
                desc: "C++/WASM analisa XMLs localmente (zero dados enviados). Gemini AI analisa PDFs via API segura",
                color: "text-risk",
              },
              {
                step: "03",
                title: "Receba o relatório",
                desc: "Valor recuperável detalhado por NCM, ou impugnações juridicamente fundamentadas prontas para protocolar",
                color: "text-profit",
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-4">
                <div className="shrink-0">
                  <span
                    className={`text-3xl font-black opacity-20 ${s.color}`}
                  >
                    {s.step}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {s.title}
                  </p>
                  <p className="text-xs text-muted mt-1 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
