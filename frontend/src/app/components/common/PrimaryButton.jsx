"use client";

import { Plus } from "lucide-react";

export default function PrimaryButton({
  children,
  onClick,
  icon = true,
  className = "",
  disabled = false,
  type = "button",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2

        h-14

        px-7

        rounded-2xl

        bg-linear-to-r
        from-emerald-600
        to-emerald-500

        text-[var(--text)]
        font-semibold

        shadow-lg
        shadow-emerald-900/30

        transition-all
        duration-300

        hover:scale-[1.02]
        hover:shadow-xl
        hover:shadow-emerald-900/40

        active:scale-95

        disabled:opacity-50
        disabled:pointer-events-none

        ${className}
      `}
    >
      {icon && <Plus size={18} />}

      {children}
    </button>
  );
}