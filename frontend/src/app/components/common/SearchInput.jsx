"use client";

import { Search } from "lucide-react";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
}) {
  return (
    <div
      className="
        w-full
        h-14

        rounded-2xl

        bg-white/5
        backdrop-blur-xl

        border
        border-white/10

        px-5

        flex
        items-center
        gap-3

        transition-all

        focus-within:border-emerald-500/40
        focus-within:ring-2
        focus-within:ring-emerald-500/20
      "
    >
      <Search
        size={18}
        className="text-gray-400"
      />

      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          flex-1

          bg-transparent

          outline-none

          text-white

          placeholder:text-gray-500
        "
      />
    </div>
  );
}