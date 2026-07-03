"use client";

import dashboard from "../../config/dashboard";

export default function DashboardCard({
  children,
  className = "",
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`
        relative

        overflow-hidden

        ${dashboard.card.radius}

        ${dashboard.card.background}

        ${dashboard.card.border}

        ${dashboard.card.shadow}

        ${dashboard.card.blur}

       ${dashboard.card.padding}

        ${dashboard.card.hover}

        ${onClick ? "cursor-pointer" : ""}

        ${className}
      `}
    >
      <div
        className="
          absolute
          inset-0

          bg-linear-to-br
          from-white/1.5
          via-transparent
          to-transparent

          pointer-events-none
        "
      />

      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}