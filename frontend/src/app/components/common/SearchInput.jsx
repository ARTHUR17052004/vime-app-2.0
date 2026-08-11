"use client";

import { Search, X } from "lucide-react";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  className = "",
  autoFocus = false,
  disabled = false,
  onClear,
}) {
  const limpar = () => {
    if (onClear) {
      onClear();
      return;
    }

    if (onChange) {
      onChange({
        target: {
          value: "",
        },
      });
    }
  };

  return (
    <div
      className={`
        group

        w-full
        h-14

        rounded-2xl

        bg-gradient-to-br
        from-[#202a36]/95
        via-[#1b2430]/96
        to-[#151c25]/96
        backdrop-blur-xl

        border
        border-white/[0.07]

        px-5

        flex
        items-center
        gap-3

        transition-all
        duration-300

        hover:border-white/20

        focus-within:border-emerald-500/50
        focus-within:ring-2
        focus-within:ring-emerald-500/20

        ${disabled ? "opacity-60" : ""}

        ${className}
      `}
    >
      <Search
        size={18}
        className="
          text-gray-400
          transition-colors
          duration-300

          group-focus-within:text-emerald-400
        "
      />

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        className="
          flex-1

          bg-transparent

          outline-none

          text-white

          placeholder:text-gray-500

          disabled:cursor-not-allowed
        "
      />

      {value && !disabled && (
        <button
          type="button"
          onClick={limpar}
          className="
            flex
            items-center
            justify-center

            w-8
            h-8

            rounded-full

            text-gray-500

            transition-all

            hover:bg-white/10
            hover:text-white
          "
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}