"use client";
import { useAuth } from "../../../context/AuthContext";
import { useState } from "react";
import {
  Bell,
  Search,
  ChevronDown,
  Menu,
  User,
  LogOut,
  Settings,
} from "lucide-react";

export default function Topbar() {
  const { usuario, logout } = useAuth();

  const nome =
    usuario?.nome || "Visitante";

  const perfil =
    usuario?.perfil || "SEM PERFIL";

  const inicial =
    nome.charAt(0).toUpperCase();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header
      className="
        sticky
        top-4
        z-30

        h-16

        rounded-[26px]

        border
        border-white/10

        bg-slate-900/45

        backdrop-blur-3xl

        shadow-[0_12px_40px_rgba(0,0,0,.22)]

        px-7

        flex
        items-center
        justify-between
      "
    >
      {/* ========================= */}
      {/* ESQUERDA */}
      {/* ========================= */}

      <div className="flex items-center">

        <button
          className="
            w-11
            h-11

            rounded-2xl

            bg-white/5

            flex
            items-center
            justify-center

            hover:bg-white/10

            transition
          "
        >
          <Menu
            size={20}
            className="text-white"
          />
        </button>

        <div className="ml-5">

          <p
            className="
              text-[10px]

              uppercase

              tracking-[0.38em]

              text-gray-400
            "
          >
            Dashboard
          </p>

          <h1
            className="
              mt-0.5

              text-[18px]

              font-bold

              text-white
            "
          >
            VIME 2.0
          </h1>

        </div>

      </div>

      {/* ========================= */}
      {/* CENTRO */}
      {/* ========================= */}

      <div className="hidden xl:flex">

        <div
          className="
            w-90
            h-11

            rounded-xl

            border
            border-white/10

            bg-white/5

            px-4

            flex
            items-center
            gap-3
          "
        >

          <Search
            size={17}
            className="text-gray-400"
          />

          <input
            placeholder="Buscar..."
            className="
              flex-1

              bg-transparent

              outline-none

              text-sm

              text-white

              placeholder:text-gray-500
            "
          />

        </div>

      </div>

      {/* ========================= */}
      {/* DIREITA */}
      {/* ========================= */}

      <div className="flex items-center gap-5">

        <button
          className="
            relative

            w-10
            h-10

            rounded-full

            hover:bg-white/5

            flex
            items-center
            justify-center

            transition
          "
        >

          <Bell
            size={18}
            className="text-white"
          />
          <span
  className="
    absolute

    top-1.5
    right-1.5

    w-2
    h-2

    rounded-full

    bg-emerald-400

    border
    border-slate-900
  "
/>

</button>

<div
  className="
    w-10
    h-10

    rounded-full

    bg-linear-to-br
    from-emerald-500
    to-green-700

    flex
    items-center
    justify-center

    text-sm
    font-bold
    text-white

    shadow-lg
    shadow-emerald-900/30
  "
>
  {inicial}
</div>

<div className="leading-tight">

  <p
    className="
      text-[14px]
      font-semibold
      text-white
    "
  >
    {nome}
  </p>

  <p
    className="
      text-[11px]
      text-gray-400
    "
  >
    {perfil}
  </p>

</div>

<div className="relative">

  <button
    onClick={() => setMenuOpen(!menuOpen)}
    className="
      w-8
      h-8
      rounded-full
      flex
      items-center
      justify-center
      hover:bg-white/5
      transition
    "
  >
    <ChevronDown
      size={15}
      className="text-gray-400"
    />
  </button>

  {menuOpen && (

    <div
      className="
        absolute
        right-0
        mt-3
        w-56

        rounded-2xl

        border
        border-white/10

        bg-slate-900/95

        backdrop-blur-xl

        shadow-2xl

        overflow-hidden
      "
    >

      <button
        className="
          w-full
          flex
          items-center
          gap-3

          px-5
          py-4

          text-white

          hover:bg-white/5
        "
      >
        <User size={17} />
        Perfil
      </button>

      <button
        className="
          w-full
          flex
          items-center
          gap-3

          px-5
          py-4

          text-white

          hover:bg-white/5
        "
      >
        <Settings size={17} />
        Configurações
      </button>

      <button
        onClick={logout}
        className="
          w-full
          flex
          items-center
          gap-3

          px-5
          py-4

          text-red-400

          hover:bg-red-500/10
        "
      >
        <LogOut size={17} />
        Sair
      </button>

    </div>

  )}

</div>

</div>

</header>
);
}