"use client";

import Card from "../ui/Card";

export default function StatsCard({
  title,
  value,
  color = "text-green-700",
  subtitle,
}) {
  return (
    <Card>

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <h2 className={`text-4xl font-bold mt-3 ${color}`}>
        {value}
      </h2>

      {subtitle && (
        <p className="mt-2 text-sm text-gray-400">
          {subtitle}
        </p>
      )}

    </Card>
  );
}