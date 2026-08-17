"use client";

import { Search } from "lucide-react";

export default function SidebarSearch({ collapsed }) {

  if (collapsed) return null;

  return (

    <div className="px-5 py-5">

      <div
        className="
          h-12
          rounded-2xl
          border
          border-[var(--border-token)]
          bg-[var(--surface-2)]

          flex
          items-center

          px-4

          gap-3
        "
      >

        <Search
          size={18}
          className="text-[var(--text-subtle)]"
        />

        <input
          placeholder="Pesquisar..."
          className="
            flex-1
            bg-transparent
            outline-none
            text-[var(--text)]
            placeholder:text-[var(--text-faint)]
          "
        />

      </div>

    </div>

  );

}