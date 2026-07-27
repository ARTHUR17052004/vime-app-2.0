"use client";

import DashboardCard from "./DashboardCard";

export default function DashboardStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  onClick,
}) {
  return (
    <DashboardCard
      onClick={onClick}
      className="
        min-h-[138px]
        px-7
        py-6

        transition-all
        duration-300

        hover:-translate-y-1
      "
    >
      <div className="flex h-full items-center justify-between">

        {/* ESQUERDA */}

        <div className="flex flex-col justify-center">

          <span
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.18em]
              text-gray-400
            "
          >
            {title}
          </span>

          <span
            className="
              mt-3
              text-5xl
              leading-none
              font-black
              tracking-tight
              text-white
            "
          >
            {value}
          </span>

          {subtitle && (
            <span
              className="
                mt-3
                text-sm
                text-gray-500
              "
            >
              {subtitle}
            </span>
          )}

        </div>

        {/* DIREITA */}

        <div
          className="
            relative

            flex
            items-center
            justify-center

            w-16
            h-16

            rounded-2xl

            border
            border-emerald-500/20

            bg-emerald-500/10

            shadow-lg
            shadow-emerald-900/20
          "
        >
          {Icon && (
            <Icon
              size={32}
              strokeWidth={2}
              className="text-emerald-400"
            />
          )}
        </div>

      </div>
    </DashboardCard>
  );
}