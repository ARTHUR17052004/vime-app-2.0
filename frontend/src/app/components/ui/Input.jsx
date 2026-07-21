"use client";

export default function Input({
  label,
  error,
  helperText,

  required = false,

  leftIcon,
  rightIcon,

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

      <div className="relative">

        {leftIcon && (

          <div
            className="
              absolute

              left-4
              top-1/2

              -translate-y-1/2

              text-gray-500
            "
          >
            {leftIcon}
          </div>

        )}

        <input
          {...props}
          className={`

            w-full

            h-12

            rounded-xl

            border

            bg-white/[0.04]

            backdrop-blur-xl

            text-white

            placeholder:text-gray-500

            transition-all
            duration-300

            outline-none

            ${
              leftIcon
                ? "pl-11"
                : "pl-4"
            }

            ${
              rightIcon
                ? "pr-11"
                : "pr-4"
            }

            py-3

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

        {rightIcon && (

          <div
            className="
              absolute

              right-4
              top-1/2

              -translate-y-1/2

              text-gray-500
            "
          >
            {rightIcon}
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