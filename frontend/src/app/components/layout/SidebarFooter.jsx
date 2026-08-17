/* eslint-disable @next/next/no-img-element */
"use client";

export default function SidebarFooter({ collapsed }) {
  return (
    <div className="border-t border-[var(--border-token)] p-5">

      <div
        className="
          rounded-3xl
          border
          border-[var(--border-token)]
          bg-[var(--surface-2)]
          p-4
        "
      >

        <div className="flex items-center gap-3">

          <img
            src="https://ui-avatars.com/api/?name=Arthur&background=10b981&color=fff"
            alt="Arthur"
            className="
              w-11
              h-11
              rounded-full
              border-2
              border-emerald-500
            "
          />

          {!collapsed && (

            <div className="flex-1">

              <h3 className="font-semibold text-[var(--text)]">
                Arthur
              </h3>

              <p className="text-xs text-emerald-400">
                Administrador
              </p>

            </div>

          )}

        </div>

        {!collapsed && (

          <div className="mt-4 flex items-center gap-2">

            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

            <span className="text-xs text-[var(--text-subtle)]">
              Sistema Online
            </span>

          </div>

        )}

      </div>

    </div>
  );
}