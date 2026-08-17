"use client";

export default function Textarea({
  label,

  error,

  helperText,

  required = false,

  rows = 5,

  variant = "default",

  fullWidth = true,

  className = "",

  ...props
}) {
  const variants = {
    default: `
      bg-[var(--surface-2)]
      backdrop-blur-xl
      border-[var(--border-token)]
    `,

    glass: `
      bg-[var(--surface-2)]
      backdrop-blur-2xl
      border-[var(--border-token)]
    `,
  };

  return (
    <div
      className={`
        space-y-2
        ${fullWidth ? "w-full" : ""}
      `}
    >
      {label && (
        <label
          className="
            flex
            items-center
            gap-1

            text-sm
            font-semibold

            text-[var(--text-muted)]
          "
        >
          {label}

          {required && (
            <span className="text-red-400">*</span>
          )}
        </label>
      )}

      <textarea
        rows={rows}
        {...props}
        className={`
          ${fullWidth ? "w-full" : ""}

          rounded-xl

          border

          ${variants[variant]}

          text-[var(--text)]

          placeholder:text-[var(--text-faint)]

          px-4
          py-3

          resize-none

          outline-none

          transition-all
          duration-300

          ${
            error
              ? `
                border-red-500/40
                focus:border-red-400
                focus:ring-2
                focus:ring-red-500/20
              `
              : `
                hover:border-emerald-500/20
                focus:border-emerald-500/40
                focus:ring-2
                focus:ring-emerald-500/20
              `
          }

          ${
            props.disabled
              ? `
                opacity-50
                cursor-not-allowed
              `
              : ""
          }

          ${className}
        `}
      />

      {helperText && !error && (
        <p className="text-xs text-[var(--text-faint)]">
          {helperText}
        </p>
      )}

      {error && (
        <p className="text-xs font-medium text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}