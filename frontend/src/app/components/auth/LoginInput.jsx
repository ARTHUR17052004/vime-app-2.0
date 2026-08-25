"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function LoginInput({
  label,
  icon,
  type = "text",
  className = "",
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";

  return (
    <div className="space-y-2">

      {label && (
        <label
          className="
            block
            text-sm
            font-medium
            text-gray-300
          "
        >
          {label}
        </label>
      )}

      <div
        className="
          relative

          flex
          items-center

          h-14

          rounded-2xl

          border
          border-white/10

          bg-black/30

          backdrop-blur-xl

          transition-all
          duration-300

          focus-within:border-emerald-500/50
          focus-within:ring-2
          focus-within:ring-emerald-500/20
        "
      >

        {/* Ícone */}

        <div
          className="
            flex
            items-center
            justify-center

            w-14

            text-gray-400
          "
        >
          {icon}
        </div>

        {/* Campo */}

        <input
          {...props}
          type={
            isPassword
              ? showPassword
                ? "text"
                : "password"
              : type
          }
          className={`
            flex-1

            bg-transparent

            text-white

            placeholder:text-gray-500

            outline-none

            pr-14

            ${className}
          `}
        />

        {/* Mostrar senha */}

        {isPassword && (

          <button
            type="button"
            onClick={() =>
              setShowPassword(!showPassword)
            }
            className="
              absolute
              right-4

              text-gray-400

              hover:text-white

              transition
            "
          >

            {showPassword ? (
              <EyeOff size={20} />
            ) : (
              <Eye size={20} />
            )}

          </button>

        )}

      </div>

    </div>
  );
}
