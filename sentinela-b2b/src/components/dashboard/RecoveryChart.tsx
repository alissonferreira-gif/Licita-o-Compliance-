"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartDataPoint {
  month: string;
  recuperado: number;
  contratos: number;
}

interface RecoveryChartProps {
  data: ChartDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: Record<string, unknown>) => {
  if (!active || !payload || !(payload as unknown[]).length) return null;

  return (
    <div className="bg-surface border border-border rounded-xl p-3 shadow-xl text-sm">
      <p className="text-muted font-medium mb-2">{label as string}</p>
      {(payload as Array<{ name: string; value: number; color: string }>).map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-subtle">{p.name}:</span>
          <span className="text-foreground font-medium">
            R$ {p.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
      ))}
    </div>
  );
};

export function RecoveryChart({ data }: RecoveryChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-6">
        <h2 className="text-base font-semibold text-foreground mb-2">
          Dinheiro Recuperável vs Oportunidades de Contrato
        </h2>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted text-sm">Nenhuma análise realizada ainda</p>
            <p className="text-muted/60 text-xs mt-1">
              Faça upload de NFes ou Editais para ver os dados aqui
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <h2 className="text-base font-semibold text-foreground mb-6">
        Dinheiro Recuperável vs Oportunidades de Contrato
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#71717a"
            tick={{ fontSize: 11, fill: "#71717a" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            stroke="#22c55e"
            tick={{ fontSize: 11, fill: "#71717a" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) =>
              v >= 1000 ? `R$${(v / 1000).toFixed(0)}k` : `R$${v}`
            }
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#f59e0b"
            tick={{ fontSize: 11, fill: "#71717a" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) =>
              v >= 1000000
                ? `R$${(v / 1000000).toFixed(1)}M`
                : v >= 1000
                ? `R$${(v / 1000).toFixed(0)}k`
                : `R$${v}`
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "#71717a", paddingTop: 16 }}
          />
          <Bar
            yAxisId="left"
            dataKey="recuperado"
            name="PIS/COFINS Recuperável"
            fill="#22c55e"
            fillOpacity={0.8}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="contratos"
            name="Contratos Disponíveis"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: "#f59e0b", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
