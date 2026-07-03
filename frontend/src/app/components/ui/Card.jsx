"use client";

import { dashboard } from "@/theme/dashboardTheme";

export default function Card({
  children,
  className = "",
  hover = true,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: `${dashboard.card.radius}px`,
        padding: `${dashboard.card.padding}px`,
        background: dashboard.card.background,
        border: dashboard.card.border,
        backdropFilter: `blur(${dashboard.card.blur}px)`,
        WebkitBackdropFilter: `blur(${dashboard.card.blur}px)`,
        boxShadow: dashboard.card.shadow,
      }}
      className={`
        relative
        overflow-hidden
        transition-all
        duration-300
        ${hover ? "hover:-translate-y-1 hover:scale-[1.01]" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {/* brilho superior */}

      <div
        className="
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-white/20
          to-transparent
          pointer-events-none
        "
      />

      {/* iluminação */}

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-br
          from-white/[0.02]
          via-transparent
          to-transparent
          pointer-events-none
        "
      />

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}