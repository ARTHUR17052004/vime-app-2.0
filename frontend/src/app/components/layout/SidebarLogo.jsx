"use client";

export default function SidebarLogo({ collapsed }) {
  return (
    <div
      className="
        h-20
        px-6
        flex
        items-center
        justify-between
        border-b
        border-white/10
      "
    >
      {!collapsed && (
        <div>

          <h1
            className="
              text-3xl
              font-black
              tracking-wide
              text-white
            "
          >
            VIME
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
            PROPERTY MANAGEMENT
          </p>

        </div>
      )}
    </div>
  );
}