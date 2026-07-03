/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";

import menuConfig from "../../config/menuConfig";

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("vime-sidebar");

    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(saved === "true");
    }
  }, []);

  function toggleSidebar() {
    const value = !collapsed;

    setCollapsed(value);

    localStorage.setItem(
      "vime-sidebar",
      value
    );
  }

  return (

    <aside
      className={`
        relative
        flex
        flex-col

        ${collapsed ? "w-20" : "w-62.5"}

        h-screen

        bg-linear-to-b
        from-[#07160d]
        via-[#06110b]
        to-[#050b08]

        border-r
        border-emerald-900/30

        text-white

        overflow-hidden

        transition-all
        duration-300
      `}
    >

     {/* ========================= */}
{/* LOGO */}
{/* ========================= */}

<div
  className="
    h-24
    px-5

    flex
    items-center
    justify-between

    border-b
    border-white/5
  "
>

  {!collapsed && (

     <div className="flex items-center gap-4">

  <img
    src="/images/logo-vime.jpeg"
    alt="VIME"
    className="
      w-12
      h-12
      object-contain
      shrink-0
    "
    draggable={false}
  />

  <div className="leading-none">

    <h1
      className="
        text-[34px]
        font-black
        text-white
        leading-none
      "
    >
      VIME
    </h1>

    <p
      className="
        mt-1.5
        text-[11px]
        uppercase
        tracking-[0.28em]
        font-semibold
        text-emerald-400
      "
    >
      Viver Melhor
    </p>

  </div>

</div>
  )}

  {collapsed && (

    <img
      src="/images/logo-vime.png"
      alt="VIME"
      className="
        w-11
        h-11
        object-contain
        mx-auto
      "
      draggable={false}
    />

  )}

  <button
    onClick={toggleSidebar}
    className="
      flex
      items-center
      justify-center

      w-9
      h-9

      rounded-xl

      bg-white/5

      hover:bg-white/10

      transition
    "
  >

    {collapsed ? (
      <ChevronRight size={50} />
    ) : (
      <ChevronLeft size={50} />
    )}

  </button>

</div>

      {/* ========================= */}
      {/* PESQUISA */}
      {/* ========================= */}

      {!collapsed && (

        <div className="px-5 pt-4 pb-3">

          <div
            className="
              flex
              items-center
              gap-3

              h-10

              rounded-xl

              border
              border-white/10

              bg-white/5

              px-3
            "
          >

            <Search
              size={16}
              className="text-gray-400"
            />

            <input
              placeholder="Pesquisar..."
              className="
                flex-1

                bg-transparent

                outline-none

                text-sm

                placeholder:text-gray-500
              "
            />

          </div>

        </div>

      )}

      {/* ========================= */}
      {/* MENU */}
      {/* ========================= */}

      <div
        className="
          flex-1

          overflow-y-auto

          scrollbar-thin
          scrollbar-thumb-white/10
          scrollbar-track-transparent

          px-50
          py-50

          space-y-80
        "
      >

        {menuConfig.map((section) => (

          <div key={section.title}>

            {!collapsed && (

              <p
                className="
                  mb-3

                  px-5

                  text-[16px]
                  font-semibold
                  uppercase

                  tracking-[0.45em]

                  text-gray-500
                "
              >
                {section.title}
              </p>

            )}
            
            <div className="space-y-1.5">

  {section.items.map((item) => {

    const Icon = item.icon;

    const active = pathname === item.href;

    return (

      <Link
        key={item.label}
        href={item.href}
        className={`
          relative

          flex
          items-center
          justify-between

          h-12

          rounded-2xl

          px-5

          transition-all
          duration-300

          ${
            active
              ? `
                bg-emerald-700/45
                border
                border-emerald-500/20
              `
              : `
                hover:bg-white/5
              `
          }
        `}
      >

        {active && (

          <div
            className="
              absolute
              left-0
              top-2
              bottom-2

              w-0.75

              rounded-r-full

              bg-emerald-400
            "
          />

        )}

        <div className="flex items-center gap-10">

          <Icon
            size={20}
            strokeWidth={2}
            className={`
              transition-colors

              ${
                active
                  ? "text-emerald-300"
                  : "text-gray-400"
              }
            `}
          />

          {!collapsed && (

            <span
              className={`
                text-[20px]
                font-medium

                ${
                  active
                    ? "text-white"
                    : "text-gray-300"
                }
              `}
            >
              {item.label}
            </span>

          )}

        </div>

        {!collapsed && item.badge && (

          <span
            className="
              rounded-full

              bg-emerald-500

              px-2.5
              py-1

              text-[10px]
              font-semibold
              text-white
            "
          >
            {item.badge}
          </span>

        )}

      </Link>

    );

  })}

</div>

</div>

))}

</div>

{/* ========================= */}
{/* FOOTER */}
{/* ========================= */}

<div className="border-t border-white/5 p-4">

  <div
    className="
      rounded-2xl

      bg-white/5

      border
      border-white/5

      p-3
    "
  >

    <div className="flex items-center gap-3">

      <img
        src="https://ui-avatars.com/api/?name=Arthur&background=16a34a&color=fff"
        alt="Arthur"
        draggable={false}
        loading="lazy"
        className="
          w-10
          h-10
          rounded-full
          border
          border-emerald-400
        "
      />

      {!collapsed && (

        <div className="leading-tight">

          <p className="text-sm font-semibold text-white">
            Arthur
          </p>

          <p className="text-xs text-emerald-400">
            Administrador
          </p>

        </div>

      )}

    </div>

    {!collapsed && (

      <div className="mt-3 border-t border-white/5 pt-2">

        <div className="flex items-center gap-2">

          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

          <span className="text-[11px] text-gray-400">
            Online
          </span>

        </div>

        <p className="mt-2 text-center text-[10px] text-gray-600">
          VIME 2.0.0
        </p>

      </div>

    )}

  </div>

</div>

</aside>

);

}