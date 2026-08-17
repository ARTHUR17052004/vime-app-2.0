"use client";

import { Search, Plus } from "lucide-react";

import Button from "../ui/Button";

export default function LocadorFilters({
  pesquisa,
  setPesquisa,
  onNovo,
}) {
  return (
    <div
      className="
        flex
        flex-col
        lg:flex-row

        items-center
        justify-between

        gap-5
      "
    >
      <div
        className="
          flex
          items-center

          w-full
          lg:max-w-lg

          h-14

          rounded-2xl

          border
          border-[var(--border-token)]

          bg-[var(--surface-2)]

          px-5

          backdrop-blur-xl
        "
      >
        <Search
          size={20}
          className="text-[var(--text-subtle)]"
        />

        <input
          value={pesquisa}
          onChange={(e) =>
            setPesquisa(e.target.value)
          }
          placeholder="Pesquisar locador..."
          className="
            ml-4

            w-full

            bg-transparent

            outline-none

            text-[var(--text)]

            placeholder:text-[var(--text-faint)]
          "
        />
      </div>

      <Button
        onClick={onNovo}
        className="h-14 px-8"
      >
        <Plus
          size={20}
          className="mr-2"
        />

        Novo Locador
      </Button>
    </div>
  );
}