"use client";

import { dashboard } from "@/theme/dashboardTheme";

export default function Card({
  children,

  className = "",

  hover = true,

  border = true,

  padding = "md",

  variant = "default",

  onClick,
}) {
  const paddings = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const variants = {
    default: dashboard.card.background,

    glass: `
      bg-white/[0.04]
      backdrop-blur-xl
    `,

    solid: `
      bg-[#1d2833]
    `,
  };

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: `${dashboard.card.radius}px`,
        boxShadow: dashboard.card.shadow,
      }}
      className={`
        relative
        overflow-hidden

        transition-all
        duration-300

        ${variants[variant]}

        ${paddings[padding]}

        ${
          border
            ? dashboard.card.border
            : ""
        }

        ${
          hover
            ? `
              hover:-translate-y-1
              hover:scale-[1.01]
              hover:shadow-2xl
            `
            : ""
        }

        ${
          onClick
            ? "cursor-pointer"
            : ""
        }

        ${className}
      `}
    >
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