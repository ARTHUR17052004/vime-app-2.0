export default function Input({
  label,
  error,
  helperText,
  required = false,
  leftIcon,
  className = "",
  ...props
}) {
  return (
    <div className="space-y-2">

      {label && (
        <label className="block text-sm font-medium text-gray-700">

          {label}

          {required && (
            <span className="text-red-500 ml-1">*</span>
          )}

        </label>
      )}

      <div className="relative">

        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}

        <input
          {...props}
          className={`
            w-full
            rounded-xl
            border
            px-4
            py-3
            outline-none
            transition-all
            duration-200

            ${leftIcon ? "pl-10" : ""}

            ${
              error
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-green-600 focus:border-green-600"
            }

            ${props.disabled ? "bg-gray-100 cursor-not-allowed" : ""}

            ${className}
          `}
        />

      </div>

      {helperText && !error && (
        <p className="text-sm text-gray-500">
          {helperText}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

    </div>
  );
}