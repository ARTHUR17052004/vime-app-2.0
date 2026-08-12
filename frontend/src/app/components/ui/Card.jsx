"use client";

import layout from "./layout";
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
    none: "",

    sm: layout.card.paddingSm || "p-6",

    md: layout.card.padding || "p-8",

    lg: layout.card.paddingLg || "p-10",
  };

  const variants = {

    default: `
      bg-gradient-to-br
      from-[#202a36]/95
      via-[#1b2430]/96
      to-[#151c25]/96

      backdrop-blur-[24px]
    `,

    glass: `
      bg-gradient-to-br
      from-[#202a36]/92
      via-[#1b2430]/94
      to-[#151c25]/95

      backdrop-blur-[24px]
    `,

    solid: `
      bg-[#1b2430]
    `,
  };

  return (

    <div

      onClick={onClick}

      style={{
        borderRadius: dashboard.card.radius,
        boxShadow: "0 18px 45px rgba(0,0,0,.45)",
      }}

      className={`

        relative

        overflow-hidden

        ${variants[variant]}

        ${
          border
            ? "border border-white/[0.07]"
            : ""
        }

        ${
          hover
            ? `
              transition-all
              duration-300

              hover:border-emerald-400/20
              hover:-translate-y-1
              hover:shadow-[0_24px_55px_rgba(0,0,0,.55)]
            `
            : ""
        }

        ${onClick ? "cursor-pointer" : ""}

        ${className}

      `}
    >

      {/* brilho */}

      <div

        className="
          absolute
          inset-x-0
          top-0
          h-px

          bg-gradient-to-r

          from-transparent
          via-white/12
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

          from-white/[0.03]
          via-transparent
          to-black/25

          pointer-events-none
        "

      />

      {/* conteúdo */}

      <div

        className={`

          relative

          z-10

          flex
          flex-col

          h-full
          w-full

          ${paddings[padding]}

        `}

      >

        {children}

      </div>

    </div>

  );

}