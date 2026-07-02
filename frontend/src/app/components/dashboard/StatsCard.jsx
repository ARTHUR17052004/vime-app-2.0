"use client";

import Card from "../ui/Card";

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color = "text-green-700",
  trend,
  trendType = "positive",
  onClick,
}) {
  return (
    <Card
      onClick={onClick}
      className="flex flex-col justify-between h-full"
    >
      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h2 className={`text-4xl font-bold mt-3 ${color}`}>
            {value}
          </h2>

        </div>

        {icon && (
          <div className="text-3xl">
            {icon}
          </div>
        )}

      </div>

      {(subtitle || trend) && (

        <div className="mt-5 flex items-center justify-between">

          {subtitle && (
            <p className="text-sm text-gray-400">
              {subtitle}
            </p>
          )}

          {trend && (

            <span
              className={`
                text-sm
                font-semibold

                ${
                  trendType === "positive"
                    ? "text-green-600"
                    : "text-red-600"
                }
              `}
            >
              {trend}
            </span>

          )}

        </div>

      )}

    </Card>
  );
}