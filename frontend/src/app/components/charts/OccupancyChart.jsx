"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const data = [
  {
    name: "Ocupadas",
    value: 24,
    color: "#10b981",
  },
  {
    name: "Vagas",
    value: 8,
    color: "#f59e0b",
  },
  {
    name: "Manutenção",
    value: 2,
    color: "#ef4444",
  },
];

export default function OccupancyChart() {
  return (
    <div className="w-44 h-44">

      <ResponsiveContainer>

        <PieChart>

          <Pie
            data={data}
            innerRadius={48}
            outerRadius={68}
            paddingAngle={4}
            dataKey="value"
            stroke="none"
            animationDuration={900}
          >

            {data.map((item) => (
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