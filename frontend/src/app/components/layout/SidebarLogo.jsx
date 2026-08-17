"use client";

import { useTheme } from "../../../context/ThemeContext";

export default function SidebarLogo({ collapsed }) {
  const { nomeSistema, nomeEmpresa } = useTheme();

  return (
    <div
      className="
        h-20
        px-6
        flex
        items-center
        justify-between
        border-b
        border-[var(--border-token)]
      "
    >
      {!collapsed && (
        <div>

          <h1
            className="
              text-3xl
              font-black
              tracking-wide
              text-[var(--text)]
            "
          >
            {nomeSistema || "VIME"}
          </h1>

          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.35em]
              text-emerald-400
              mt-1
            "
          >
            {nomeEmpresa || "PROPERTY MANAGEMENT"}
          </p>

        </div>
      )}
    </div>
  );
}