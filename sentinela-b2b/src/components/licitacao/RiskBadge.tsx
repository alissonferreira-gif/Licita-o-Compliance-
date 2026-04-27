import { cn } from "@/lib/utils/cn";
import { AlertTriangle, CheckCircle, XCircle, AlertCircle } from "lucide-react";

type RiskLevel = "low" | "medium" | "high" | "critical";

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: "sm" | "md" | "lg";
}

const riskConfig = {
  low: {
    label: "Baixo Risco",
    color: "text-profit",
    bg: "bg-profit/10",
    border: "border-profit/30",
    icon: CheckCircle,
  },
  medium: {
    label: "Risco Médio",
    color: "text-risk",
    bg: "bg-risk/10",
    border: "border-risk/30",
    icon: AlertTriangle,
  },
  high: {
    label: "Alto Risco",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/30",
    icon: AlertCircle,
  },
  critical: {
    label: "Risco Crítico",
    color: "text-danger",
    bg: "bg-danger/10",
    border: "border-danger/30",
    icon: XCircle,
  },
};

export function RiskBadge({ level, score, size = "md" }: RiskBadgeProps) {
  const cfg = riskConfig[level] || riskConfig.medium;
  const Icon = cfg.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        cfg.bg,
        cfg.border,
        cfg.color,
        size === "sm" && "text-[10px] px-2 py-0.5",
        size === "md" && "text-xs px-2.5 py-1",
        size === "lg" && "text-sm px-3 py-1.5"
      )}
    >
      <Icon
        className={cn(
          size === "sm" && "w-2.5 h-2.5",
          size === "md" && "w-3 h-3",
          size === "lg" && "w-4 h-4"
        )}
      />
      {cfg.label}
      {score !== undefined && (
        <span className="opacity-70 font-normal">({score}/100)</span>
      )}
    </div>
  );
}
