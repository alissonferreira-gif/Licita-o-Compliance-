"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Crosshair,
  Shield,
  BarChart3,
  Settings,
  Zap,
  Building2,
  BanknoteIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navGroups = [
  {
    items: [
      {
        label: "Dashboard",
        href: "/",
        icon: BarChart3,
        module: null,
        desc: "Painel de impacto",
      },
    ],
  },
  {
    group: "MÓDULO ATAQUE",
    items: [
      {
        label: "Licitações",
        href: "/licitacoes",
        icon: Crosshair,
        module: "ATAQUE",
        moduleColor: "text-profit",
        desc: "Editais e oportunidades",
      },
    ],
  },
  {
    group: "MÓDULO DEFESA",
    items: [
      {
        label: "Auditoria Fiscal",
        href: "/auditoria-fiscal",
        icon: Shield,
        module: "DEFESA",
        moduleColor: "text-risk",
        desc: "Recuperar PIS/COFINS",
      },
      {
        label: "Revisão Bancária",
        href: "/revisao-contrato",
        icon: BanknoteIcon,
        module: "DEFESA",
        moduleColor: "text-risk",
        desc: "Juros abusivos + venda casada",
        badge: "NOVO",
      },
      {
        label: "Auditoria Bancária",
        href: "/auditoria-bancaria",
        icon: Building2,
        module: "DEFESA",
        moduleColor: "text-risk",
        desc: "Tarifas indevidas",
      },
    ],
  },
  {
    items: [
      {
        label: "Configurações",
        href: "/configuracoes",
        icon: Settings,
        module: null,
        desc: "Empresa e API keys",
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-surface border-r border-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-profit/10 border border-profit/30 flex items-center justify-center">
            <Zap className="w-4 h-4 text-profit" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground font-mono">
            SENTINELA OMNI
          </span>
        </div>
        <p className="text-[11px] text-muted mt-1 ml-10">
          Capital Recovery Ecosystem
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.group && (
              <p className="text-[10px] font-bold tracking-widest text-muted px-3 mb-1">
                {group.group}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group",
                      isActive
                        ? "bg-profit/10 text-profit"
                        : "text-muted hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        isActive ? "text-profit" : "text-muted group-hover:text-subtle"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {item.label}
                        </span>
                        {"badge" in item && item.badge && (
                          <span className="text-[9px] font-bold bg-profit text-background px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        {item.module && !("badge" in item && item.badge) && (
                          <span
                            className={cn(
                              "text-[9px] font-bold tracking-widest opacity-70",
                              item.moduleColor
                            )}
                          >
                            {item.module}
                          </span>
                        )}
                      </div>
                      {item.desc && (
                        <p className="text-[11px] text-muted truncate">
                          {item.desc}
                        </p>
                      )}
                    </div>
                    {isActive && (
                      <div className="w-1 h-1 rounded-full bg-profit shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Plan Badge */}
      <div className="px-4 py-4 border-t border-border">
        <div className="bg-background rounded-xl border border-border p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted">Plano Atual</p>
            <span className="text-[10px] font-bold text-profit bg-profit/10 px-2 py-0.5 rounded-full">
              FREE
            </span>
          </div>
          <p className="text-xs text-subtle mb-2">
            Diagnóstico gratuito ilimitado
          </p>
          <button className="w-full text-xs font-semibold bg-profit/10 hover:bg-profit/20 text-profit py-2 rounded-lg transition-colors border border-profit/20">
            Fazer Upgrade →
          </button>
        </div>
      </div>
    </aside>
  );
}
