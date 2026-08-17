"use client";

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  login = false,
  className = "",
}) {
  const variants = {
    primary: `
      bg-gradient-to-r
      from-emerald-600
      via-emerald-500
      to-green-500

      hover:from-emerald-500
      hover:via-emerald-400
      hover:to-green-400

      text-[var(--text)]

      border
      border-emerald-400/30

      shadow-lg
      shadow-emerald-950/40

      hover:shadow-xl
      hover:shadow-emerald-500/30
    `,

    secondary: `
      bg-[var(--surface-2)]
      hover:bg-[var(--surface-3)]

      border
      border-[var(--border-token)]

      text-[var(--text)]

      hover:border-[var(--border-strong)]
    `,

    danger: `
      bg-gradient-to-r
      from-red-600
      to-red-500

      hover:from-red-500
      hover:to-red-400

      border
      border-red-500/30

      text-[var(--text)]

      shadow-lg
      shadow-red-950/30

      hover:shadow-red-500/20
    `,

    warning: `
      bg-gradient-to-r
      from-yellow-500
      to-amber-400

      hover:from-yellow-400
      hover:to-amber-300

      border
      border-yellow-400/30

      text-black

      shadow-lg
      shadow-yellow-900/20
    `,

    info: `
      bg-gradient-to-r
      from-sky-600
      to-cyan-500

      hover:from-sky-500
      hover:to-cyan-400

      border
      border-sky-500/30

      text-[var(--text)]

      shadow-lg
      shadow-sky-950/30
    `,

    ghost: `
      bg-transparent

      hover:bg-[var(--surface-2)]

      border
      border-[var(--border-token)]

      hover:border-[var(--border-strong)]

      text-[var(--text-muted)]
    `,
  };

  const sizes = {
    sm: `
      h-10
      px-4
      text-sm
    `,

    md: `
      h-11
      px-5
      text-sm
    `,

    lg: `
      h-12
      px-6
      text-base
    `,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2

        font-semibold
        whitespace-nowrap

        cursor-pointer
        select-none

        transition-all
        duration-300
        ease-out

        hover:-translate-y-0.5
        hover:scale-[1.02]

        active:scale-[0.98]

        focus:outline-none
        focus:ring-2
        focus:ring-emerald-500/30
        focus:ring-offset-2
        focus:ring-offset-transparent

        ${
          login
            ? `
                h-14
                w-full

                rounded-2xl

                bg-gradient-to-r
                from-emerald-500
                via-emerald-400
                to-green-500

                hover:from-emerald-400
                hover:via-emerald-300
                hover:to-green-400

                text-[var(--text)]

                shadow-lg
                shadow-emerald-500/20

                hover:shadow-xl
                hover:shadow-emerald-500/40
              `
            : `
                rounded-xl

                ${variants[variant]}
                ${sizes[size]}
              `
        }

        ${fullWidth ? "w-full" : ""}

        ${
          disabled
            ? `
              opacity-50
              cursor-not-allowed

              hover:scale-100
              hover:translate-y-0
              hover:shadow-none
            `
            : ""
        }

        ${className}
      `}
    >
      {loading ? (
        <>
          <span className="animate-spin">
            ⏳
          </span>

          Carregando...
        </>
      ) : (
        <>
          {leftIcon}

          {children}

          {rightIcon}
        </>
      )}
    </button>
  );
}