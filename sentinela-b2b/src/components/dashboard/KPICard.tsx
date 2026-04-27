import { cn } from "@/lib/utils/cn";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  variant?: "profit" | "risk" | "neutral" | "danger";
  icon?: React.ComponentType<{ className?: string }>;
}

const variantStyles = {
  profit: {
    value: "text-profit profit-glow",
    bg: "bg-profit/5 border-profit/20",
    icon: "text-profit bg-profit/10",
  },
  risk: {
    value: "text-risk risk-glow",
    bg: "bg-risk/5 border-risk/20",
    icon: "text-risk bg-risk/10",
  },
  neutral: {
    value: "text-foreground",
    bg: "bg-surface border-border",
    icon: "text-muted bg-background",
  },
  danger: {
    value: "text-danger",
    bg: "bg-danger/5 border-danger/20",
    icon: "text-danger bg-danger/10",
  },
};

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  trendUp,
  variant = "neutral",
  icon: Icon,
}: KPICardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 flex flex-col gap-3 transition-all duration-200",
        styles.bg
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted font-medium">{title}</p>
        {Icon && (
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", styles.icon)}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div>
        <p className={cn("text-3xl font-bold tracking-tight", styles.value)}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-muted mt-0.5">{subtitle}</p>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-1.5">
          {trendUp === true ? (
            <TrendingUp className="w-3.5 h-3.5 text-profit" />
          ) : trendUp === false ? (
            <TrendingDown className="w-3.5 h-3.5 text-danger" />
          ) : (
            <Minus className="w-3.5 h-3.5 text-muted" />
          )}
          <span
            className={cn(
              "text-xs",
              trendUp === true
                ? "text-profit"
                : trendUp === false
                ? "text-danger"
                : "text-muted"
            )}
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}
