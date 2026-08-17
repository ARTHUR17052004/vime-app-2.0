"use client";

import { Building2 } from "lucide-react";

export default function LocadorHeader({
  total = 0,
}) {
  return (
    <div className="flex items-center justify-between">

      <div>

        <div className="flex items-center gap-3">

          <div
            className="
              w-14
              h-14

              rounded-2xl

              bg-emerald-500/15

              flex
              items-center
              justify-center
            "
          >
            <Building2
              className="text-emerald-400"
              size={28}
            />
          </div>

          <div>

            <h1
              className="
                text-5xl
                font-black
                text-[var(--text)]
              "
            >
              Locadores
            </h1>

            <p
              className="
                text-[var(--text-subtle)]
                text-lg
              "
            >
              Gerencie todos os proprietários cadastrados.
            </p>

            <span
              className="
                text-sm
                font-semibold
                text-emerald-400
              "
            >
              {total} locador(es) cadastrado(s)
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}