"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function OccupancyChart({ ocupadas = 0, vazias = 0 }) {
  const data = [
    { name: "Ocupadas", value: ocupadas, color: "#10b981" },
    { name: "Vagas", value: vazias, color: "#f59e0b" },
  ];

  const semDados = ocupadas === 0 && vazias === 0;

  return (
    <div className="w-44 h-44">

      <ResponsiveContainer>

        <PieChart>

          <Pie
            data={semDados ? [{ name: "Sem dados", value: 1, color: "#334155" }] : data}
            innerRadius={48}
            outerRadius={68}
            paddingAngle={semDados ? 0 : 4}
            dataKey="value"
            stroke="none"
            animationDuration={900}
          >

            {(semDados ? [{ name: "Sem dados", value: 1, color: "#334155" }] : data).map((item) => (
              <Cell
                key={item.name}
                fill={item.color}
              />
            ))}

          </Pie>

        </PieChart>

      </ResponsiveContainer>

    </div>
  );
}
