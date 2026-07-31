"use client";

export default function Select({
  label,
  error,
  helperText,
  required = false,
  options = [],
  children,
  leftIcon,
  rightIcon,
  size = "md",
  variant = "default",
  fullWidth = true,
  className = "",
  ...props
}) {
  const sizes = {
    sm: "h-10 text-sm",
    md: "h-12 text-sm",
    lg: "h-14 text-base",
  };

  const variants = {
    default: `
      bg-white/[0.04]
      backdrop-blur-xl
      border-white/10
    `,
    glass: `
      bg-white/[0.06]
      backdrop-blur-2xl
      border-white/15
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
            text-gray-300
          "
        >
          {label}

          {required && (
            <span className="text-red-400">*</span>
          )}
        </label>
      )}

      <div className="relative">

        {leftIcon && (
          <div
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-gray-500
              pointer-events-none
              z-10
            "
          >
            {leftIcon}
          </div>
        )}

        <select
          {...props}
          className={`
            appearance-none

            ${fullWidth ? "w-full" : ""}

            ${sizes[size]}

            rounded-xl
            border

            ${variants[variant]}

            text-white

            outline-none

            transition-all
            duration-300

            ${
              leftIcon
                ? "pl-11"
                : "pl-4"
            }

            ${
              rightIcon
                ? "pr-11"
                : "pr-10"
            }

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
        >

          {children
            ? children
            : options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  style={{
                    backgroundColor: "#1d2833",
                    color: "#ffffff",
                  }}
                >
                  {option.label}
                </option>
              ))
          }
        </select>

        {rightIcon ? (
          <div
            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              text-gray-500
              pointer-events-none
            "
          >
            {rightIcon}
          </div>
        ) : (
          <div
            className="
              absolute
              right-4
              top-1/2
              -translate-y-1/2
              text-gray-500
              pointer-events-none
            "
          >
            ▼
          </div>
        )}

      </div>

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