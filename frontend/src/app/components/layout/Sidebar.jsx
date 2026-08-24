/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import menuConfig from "../../config/menuConfig";
import { useTheme } from "../../../context/ThemeContext";
import { useAuth } from "../../../context/AuthContext";

export default function Sidebar() {

  const { usuario } = useAuth();
  const { textoRodape } = useTheme();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeLinkRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("vime-sidebar");

    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(saved === "true");
    }
  }, []);

  useEffect(() => {
    activeLinkRef.current?.scrollIntoView({
      block: "nearest",
      behavior: "auto",
    });

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  function toggleSidebar() {
    const value = !collapsed;

    setCollapsed(value);

    localStorage.setItem(
      "vime-sidebar",
      value
    );
  }

  useEffect(() => {
    function aoAlternar() {
      if (window.innerWidth < 768) {
        setMobileOpen((v) => !v);
      } else {
        toggleSidebar();
      }
    }

    window.addEventListener("toggle-sidebar", aoAlternar);

    return () =>
      window.removeEventListener("toggle-sidebar", aoAlternar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsed]);

  return (

    <>

    {mobileOpen && (

      <div
        onClick={() => setMobileOpen(false)}
        className="
          fixed
          inset-0
          z-30

          bg-black/20
          backdrop-blur-sm

          md:hidden
        "
      />

    )}

    <aside
      className={`
        fixed
        md:relative

        inset-y-0
        left-0
        z-40
        md:z-auto

        flex
        flex-col

        w-72
        ${collapsed ? "md:w-20" : "md:w-62.5"}

        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0

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
  className={`
    h-24

    flex
    items-center

    border-b
    border-white/10

    ${collapsed ? "flex-col justify-center gap-2 px-2" : "justify-between px-5"}
  `}
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
      src="/images/logo-vime.jpeg"
      alt="VIME"
      className="
        w-9
        h-9
        object-contain
        rounded-lg
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
      shrink-0

      w-9
      h-9

      rounded-xl

      bg-white/5

      hover:bg-white/10

      transition
    "
  >

    {collapsed ? (
      <ChevronRight size={18} />
    ) : (
      <ChevronLeft size={18} />
    )}

  </button>

</div>

      {/* ========================= */}
      {/* PESQUISA */}
      {/* ========================= */}

      {!collapsed && (

        <div className="px-5 pt-4 pb-3">

          <button
            onClick={() =>
              window.dispatchEvent(new Event("abrir-busca-universal"))
            }
            className="
              w-full

              flex
              items-center
              gap-3

              h-10

              rounded-xl

              border
              border-white/10

              bg-white/5

              px-3

              transition

              hover:bg-white/10
              hover:border-white/20
            "
          >

            <Search
              size={16}
              className="text-gray-400 shrink-0"
            />

            <span
              className="
                flex-1

                text-left

                text-sm

                text-gray-500
              "
            >
              Pesquisar...
            </span>

          </button>

        </div>

      )}

      {/* ========================= */}
      {/* MENU */}
      {/* ========================= */}

      <div
        className={`
          flex-1

          overflow-y-auto

          scrollbar-thin
          scrollbar-thumb-white/10
          scrollbar-track-transparent

          px-3
          py-4

          ${collapsed ? "space-y-2" : "space-y-10"}
        `}
      >

        {menuConfig.map((section) => (

          <div key={section.title}>

            {!collapsed && (

              <p
                className="
                  mb-4

                  px-5

                  text-[15px]
                  font-bold
                  uppercase

                  tracking-[0.1em]

                  text-emerald-400
                "
              >
                {"-> "}{section.title}
              </p>

            )}

            <div className="space-y-1.5">

  {section.items.map((item) => {

    const Icon = item.icon;

    const active = pathname === item.href;

    return (

      <Link
        key={item.label}
        ref={active ? activeLinkRef : null}
        href={item.href}
        className={`
          relative

          flex
          items-center

          h-12

          rounded-2xl

          transition-all
          duration-300

          ${collapsed ? "justify-center px-0" : "justify-between px-5"}

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

<div className="border-t border-white/10 p-4">

  <div
    className="
      rounded-2xl

      bg-white/5

      border
      border-white/10

      p-3
    "
  >

    <div className="flex items-center gap-3">

      <div
        className="
          w-10
          h-10
          rounded-full
          border
          border-emerald-400

          bg-linear-to-br
          from-emerald-500
          to-green-700

          flex
          items-center
          justify-center

          text-sm
          font-bold
          text-white

          overflow-hidden

          shrink-0
        "
      >
        {usuario?.foto ? (
          <img
            src={usuario.foto}
            alt={usuario?.nome || "Usuário"}
            draggable={false}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          (usuario?.nome || "?").charAt(0).toUpperCase()
        )}
      </div>

      {!collapsed && (

        <div className="leading-tight">

          <p className="text-sm font-semibold text-white">
            {usuario?.nome || "Visitante"}
          </p>

          <p className="text-xs text-emerald-400">
            {usuario?.perfil || "SEM PERFIL"}
          </p>

        </div>

      )}

    </div>

    {!collapsed && (

      <div className="mt-3 border-t border-white/10 pt-2">

        <div className="flex items-center gap-2">

          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

          <span className="text-[11px] text-gray-400">
            Online
          </span>

        </div>

        <p className="mt-2 text-center text-[10px] text-gray-600">
          {textoRodape || "VIME 2.0.0"}
        </p>

      </div>

    )}

  </div>

</div>

</aside>

</>

);

}
