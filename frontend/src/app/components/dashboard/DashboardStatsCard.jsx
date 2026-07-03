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
        h-[122px]
        px-7
      "
    >
      <div className="flex h-full items-center justify-between">

        {/* Informações */}

        <div className="flex flex-col justify-center">

          <span
            className="
              text-[13px]
              font-medium
              text-gray-400
            "
          >
            {title}
          </span>

          <span
            className="
              mt-2
              text-[40px]
              leading-none
              font-bold
              text-white
            "
          >
            {value}
          </span>

          <span
            className="
              mt-2
              text-[13px]
              text-gray-500
            "
          >
            {subtitle}
          </span>

        </div>

        {/* Ícone */}

        <div
          className="
            w-16
            h-16
            rounded-2xl

            flex
            items-center
            justify-center

            bg-emerald-500/10
            border
            border-emerald-500/20
          "
        >

          <Icon
            size={34}
            strokeWidth={1.8}
            className="text-emerald-400"
          />

        </div>

      </div>
    </DashboardCard>
  );
}