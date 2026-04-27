"use client";

import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Eye, EyeOff, CheckCircle, AlertCircle, Key, Building2, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function ConfiguracoesPage() {
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [geminiKey, setGeminiKey] = useState("");
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // In production: save to .env or Supabase company record
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col min-h-full">
      <TopBar title="Configurações" subtitle="Empresa, API keys e preferências" />

      <div className="flex-1 p-8 max-w-2xl mx-auto w-full space-y-8">
        {/* Company info */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted" />
            <h2 className="text-sm font-semibold text-foreground">Dados da Empresa</h2>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-muted block mb-1.5">
                Razão Social
              </label>
              <input
                type="text"
                placeholder="Ex: Distribuidora Central Ltda"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-profit/50 transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted block mb-1.5">CNPJ</label>
                <input
                  type="text"
                  placeholder="00.000.000/0001-00"
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-profit/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted block mb-1.5">
                  Regime Tributário
                </label>
                <select className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-profit/50 transition-colors">
                  <option value="lucro_real">Lucro Real</option>
                  <option value="lucro_presumido">Lucro Presumido</option>
                  <option value="simples">Simples Nacional</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* API Keys */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-muted" />
            <h2 className="text-sm font-semibold text-foreground">Chaves de API</h2>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5 space-y-5">
            {/* Gemini */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-muted">
                  Google Gemini API Key
                </label>
                <span className="text-[10px] text-risk font-medium bg-risk/10 px-2 py-0.5 rounded-full">
                  Módulo Licitações
                </span>
              </div>
              <div className="relative">
                <input
                  type={showGeminiKey ? "text" : "password"}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIza..."
                  className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-profit/50 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                >
                  {showGeminiKey ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted/60 mt-1">
                Obtenha gratuitamente em{" "}
                <span className="text-profit font-medium">aistudio.google.com</span>
              </p>
            </div>

            <div className="border-t border-border/50" />

            {/* Supabase */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted">
                  Supabase (banco de dados)
                </label>
                <span className="text-[10px] text-subtle font-medium bg-background border border-border px-2 py-0.5 rounded-full">
                  Opcional
                </span>
              </div>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://seuprojetoid.supabase.co"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-profit/50 transition-colors"
              />
              <input
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJ... (anon key)"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-profit/50 transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Plan */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-profit" />
            <h2 className="text-sm font-semibold text-foreground">Plano Atual</h2>
          </div>
          <div className="bg-surface border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-bold text-foreground">Gratuito</p>
                <p className="text-xs text-muted mt-0.5">
                  Diagnóstico ilimitado · Primeiros 1 relatório desbloqueado grátis
                </p>
              </div>
              <span className="text-xs font-bold text-profit bg-profit/10 border border-profit/20 px-3 py-1 rounded-full">
                FREE
              </span>
            </div>
            <div className="mt-4 pt-4 border-t border-border space-y-2">
              {[
                "Upload ilimitado de XMLs e PDFs",
                "Análise PIS/COFINS monofásico completa",
                "Score de oportunidade em licitações",
                "1ª impugnação desbloqueada gratuitamente",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-profit shrink-0" />
                  <p className="text-xs text-subtle">{feature}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 bg-profit hover:bg-profit-dim text-background font-semibold text-sm py-2.5 rounded-xl transition-colors">
              Upgrade para PRO — R$ 97/mês
            </button>
          </div>
        </section>

        {/* Save button */}
        <div className="flex items-center justify-end gap-3">
          {saved && (
            <div className="flex items-center gap-2 text-xs text-profit">
              <CheckCircle className="w-3.5 h-3.5" />
              Configurações salvas
            </div>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-foreground text-background text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
