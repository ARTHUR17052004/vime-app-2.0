"use client";

import DashboardCard from "./DashboardCard";

// `compact` = versão menor pro dashboard, que tem 5 cards na mesma linha.
// Sem ele o card é exatamente o de sempre (usado nas outras telas).
export default function DashboardStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  onClick,
  compact = false,
}) {
  return (
    <DashboardCard
      onClick={onClick}
      className={`
        min-h-[96px]
        px-4
        py-3
        ${compact ? "md:min-h-[116px] md:px-5 md:py-4" : "md:min-h-[138px] md:px-7 md:py-6"}

        transition-all
        duration-300

        hover:-translate-y-1
      `}
    >
      <div className="flex h-full items-center justify-between gap-2">

        {/* ESQUERDA */}

        <div className="flex flex-col justify-center min-w-0">

          <span
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.18em]
              text-[var(--text-subtle)]
            "
          >
            {title}
          </span>

          <span
            className={`
              mt-2
              text-3xl
              ${compact ? "md:mt-2 md:text-4xl" : "md:mt-3 md:text-5xl"}
              leading-none
              font-black
              tracking-tight
              text-[var(--text)]
            `}
          >
            {value}
          </span>

          {subtitle && (
            <span
              className={`
                mt-2
                text-xs
                ${compact ? "md:mt-2" : "md:mt-3 md:text-sm"}
                text-[var(--text-faint)]
              `}
            >
              {subtitle}
            </span>
          )}

        </div>

        {/* DIREITA */}

        <div
          className={`
            relative
            shrink-0

            flex
            items-center
            justify-center

            w-12
            h-12
            ${compact ? "md:w-12 md:h-12" : "md:w-16 md:h-16"}

            rounded-2xl

            border
            border-emerald-500/20

            bg-emerald-500/10

            shadow-lg
            shadow-emerald-900/20
          `}
        >
          {Icon && (
            <Icon
              size={32}
              strokeWidth={2}
              className={`w-6 h-6 ${compact ? "md:w-6 md:h-6" : "md:w-8 md:h-8"} text-emerald-400`}
            />
          )}
        </div>

      </div>
    </DashboardCard>
  );
}
