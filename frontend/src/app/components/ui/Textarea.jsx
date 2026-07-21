"use client";

export default function Textarea({
  label,
  error,
  helperText,
  required = false,
  rows = 5,
  className = "",
  ...props
}) {
  return (
    <div className="space-y-2">

      {label && (
        <label
          className="
            flex
            items-center
            gap-1

            text-sm
            font-semibold

            text-gray-300
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
          w-full

          rounded-xl

          border

          bg-white/[0.04]

          backdrop-blur-xl

          text-white

          placeholder:text-gray-500

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
                border-white/10
                hover:border-emerald-500/20
                focus:border-emerald-500/40
                focus:ring-2
                focus:ring-emerald-500/20
              `
          }

          ${className}
        `}
      />

      {helperText && !error && (
        <p className="text-xs text-gray-500">
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