"use client";

export default function Filters({
  value,
  onChange,
  options = [],
  className = "",
}) {
  return (
    <div
      className={`
        rounded-3xl
        border
        border-[var(--border-token)]
        bg-[var(--surface)]
        backdrop-blur-xl
        p-6
        shadow-xl
        mb-8
        flex
        flex-wrap
        gap-3
        ${className}
      `}
    >
      {options.map((option) => {
        const ativo = option === value;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`
              px-5
              py-3
              rounded-2xl
              border
              font-medium
              transition-all
              duration-200
              shadow-sm

              ${
                ativo
                  ? `
                    bg-emerald-600
                    border-emerald-600
                    text-[var(--text)]
                    shadow-lg
                  `
                  : `
                    bg-[var(--surface-2)]
                    border-[var(--border-token)]
                    text-[var(--text-muted)]
                    hover:bg-[var(--surface-3)]
                    hover:border-emerald-500/50
                    hover:text-emerald-400
                  `
              }
            `}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}