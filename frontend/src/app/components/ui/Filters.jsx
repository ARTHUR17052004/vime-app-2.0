"use client";

export default function Filters({
  value,
  onChange,
  options = [],
  className = "",
}) {
  return (
    <div className={`flex flex-wrap gap-3 mb-8 ${className}`}>
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
                    bg-white
                    border-gray-200
                    text-gray-700
                    hover:bg-gray-50
                    hover:border-emerald-500
                    hover:text-emerald-700
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