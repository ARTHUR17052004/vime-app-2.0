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
          border-white/10
          bg-white/5

          flex
          items-center

          px-4

          gap-3
        "
      >

        <Search
          size={18}
          className="text-gray-400"
        />

        <input
          placeholder="Pesquisar..."
          className="
            flex-1
            bg-transparent
            outline-none
            text-white
            placeholder:text-gray-500
          "
        />

      </div>

    </div>

  );

}