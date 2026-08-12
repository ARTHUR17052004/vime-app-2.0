"use client";

import { Search } from "lucide-react";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Pesquisar...",
  className = "",
}) {
  return (
    <div className={`relative w-full ${className}`}>
      <Search
        size={18}
        className="
          absolute
          left-4
          top-1/2
          -translate-y-1/2
          text-gray-400
        "
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full
          pl-11
          pr-4
          py-3
          rounded-2xl
          border
          border-white/10
          bg-white/5
          text-white
          outline-none
          transition-all
          focus:border-emerald-500/50
          focus:ring-2
          focus:ring-emerald-500/20
        "
      />
    </div>
  );
}