"use client";

import { Bell, CircleUser } from "lucide-react";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  return (
    <header className="h-14 border-b border-border bg-surface/50 flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-xs text-muted">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-muted hover:text-foreground hover:border-border/80 transition-colors">
          <Bell className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-muted hover:text-foreground transition-colors">
          <CircleUser className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
