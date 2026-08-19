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

        bg-[var(--surface)]
        backdrop-blur-xl

        border
        border-[var(--border-token)]

        px-5

        flex
        items-center
        gap-3

        transition-all
        duration-300

        hover:border-[var(--border-strong)]

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
          text-[var(--text-subtle)]
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
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        name="busca-vime"
        data-lpignore="true"
        data-1p-ignore
        className="
          flex-1

          bg-transparent

          outline-none

          text-[var(--text)]

          placeholder:text-[var(--text-faint)]

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

            text-[var(--text-faint)]

            transition-all

            hover:bg-[var(--surface-3)]
            hover:text-[var(--text)]
          "
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}