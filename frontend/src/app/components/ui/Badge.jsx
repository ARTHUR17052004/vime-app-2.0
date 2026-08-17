"use client";

export default function Badge({
  children,
  variant = "emerald",
  size = "md",
  className = "",
}) {

  const variants = {

    emerald: `
      bg-emerald-500/10
      text-emerald-400
      border border-emerald-500/20
    `,

    blue: `
      bg-sky-500/10
      text-sky-400
      border border-sky-500/20
    `,

    yellow: `
      bg-yellow-500/10
      text-yellow-300
      border border-yellow-500/20
    `,

    red: `
      bg-red-500/10
      text-red-400
      border border-red-500/20
    `,

    gray: `
      bg-[var(--surface-2)]
      text-[var(--text-muted)]
      border border-[var(--border-token)]
    `,
  };

  const sizes = {

    sm: `
      h-6
      px-2.5
      text-[11px]
    `,

    md: `
      h-7
      px-3
      text-xs
    `,

    lg: `
      h-8
      px-4
      text-sm
    `,
  };

  return (

    <span
      className={`
        inline-flex
        items-center
        justify-center

        rounded-full

        font-semibold

        whitespace-nowrap

        transition-all
        duration-300

        ${variants[variant]}
        ${sizes[size]}

        ${className}
      `}
    >

      {children}

    </span>

  );

}