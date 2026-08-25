"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { useIsMobile } from "@/hooks/useIsMobile";

const mockData = [
  { mes: "Jan", receita: 18000 },
  { mes: "Fev", receita: 26000 },
  { mes: "Mar", receita: 24000 },
  { mes: "Abr", receita: 31000 },
  { mes: "Mai", receita: 42000 },
  { mes: "Jun", receita: 51000 },
];

function formatarValor(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  });
}

export default function RevenueChart({ data = mockData }) {
  const isMobile = useIsMobile();

  return (
    <div
      className="
        w-full

        h-[220px]
        sm:h-[280px]

        px-2
        sm:px-6
        pt-4
        pb-6
      "
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 25,
            right: isMobile ? 4 : 20,
            left: isMobile ? -12 : 10,
            bottom: 15,
          }}
        >
          <defs>
            <linearGradient
              id="receitaGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#22c55e"
                stopOpacity={0.45}
              />

              <stop
                offset="100%"
                stopColor="#22c55e"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="rgba(255,255,255,.05)"
            vertical={false}
            strokeDasharray="3 6"
          />

          <XAxis
            dataKey="mes"
            tickLine={false}
            axisLine={false}
            interval={isMobile ? 1 : 0}
            tick={{
              fill: "#94a3b8",
              fontSize: isMobile ? 11 : 13,
            }}
          />

          <YAxis hide />

          <Tooltip
            cursor={{
              stroke: "#22c55e",
              strokeOpacity: 0.35,
            }}
            formatter={(value) => formatarValor(value)}
            contentStyle={{
              background: "#111827",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: 16,
              color: "#fff",
            }}
          />

          <Area
            type="monotone"
            dataKey="receita"
            stroke="#22c55e"
            strokeWidth={3}
            fill="url(#receitaGradient)"
            dot={{
              r: 4,
              fill: "#22c55e",
              stroke: "#0f172a",
              strokeWidth: 2,
            }}
            activeDot={{
              r: 6,
              fill: "#22c55e",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}