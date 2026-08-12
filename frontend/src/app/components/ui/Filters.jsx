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
        border-white/10
        bg-slate-900/80
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
                    text-white
                    shadow-lg
                  `
                  : `
                    bg-white/5
                    border-white/10
                    text-gray-300
                    hover:bg-white/10
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