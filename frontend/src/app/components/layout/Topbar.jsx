"use client";
import { useAuth } from "../../../context/AuthContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronDown,
  Menu,
  User,
  LogOut,
  Settings,
} from "lucide-react";
import NotificationBell from "../notificacoes/NotificationBell";

export default function Topbar() {
  const { usuario, logout } = useAuth();
  const router = useRouter();

  const nome = usuario?.nome || "Visitante";
  const perfil = usuario?.perfil || "SEM PERFIL";
  const inicial = nome.charAt(0).toUpperCase();
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
        border-[var(--border-token)]

        bg-[var(--surface)]

        backdrop-blur-3xl

        shadow-[0_12px_40px_rgba(0,0,0,.22)]

        px-3
        md:px-7

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
          onClick={() =>
            window.dispatchEvent(new Event("toggle-sidebar"))
          }
          title="Expandir/recolher menu"
          className="
            w-11
            h-11

            rounded-2xl

            bg-[var(--surface-2)]

            flex
            items-center
            justify-center

            hover:bg-[var(--surface-3)]

            transition
          "
        >
          <Menu size={20} className="text-[var(--text)]" />
        </button>

        <div className="ml-3 md:ml-5">
          <p
            className="
              hidden
              sm:block

              text-[10px]

              uppercase

              tracking-[0.38em]

              text-[var(--text-subtle)]
            "
          >
            Dashboard
          </p>

          <h1
            className="
              mt-0.5

              text-[18px]

              font-bold

              text-[var(--text)]
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
        <button
          onClick={() =>
            window.dispatchEvent(new Event("abrir-busca-universal"))
          }
          className="
            w-90
            h-11

            rounded-xl

            border
            border-[var(--border-token)]

            bg-[var(--surface-2)]

            px-4

            flex
            items-center
            gap-3

            transition

            hover:bg-[var(--surface-3)]
            hover:border-[var(--border-strong)]
          "
        >
          <Search size={17} className="text-[var(--text-subtle)] shrink-0" />

          <span
            className="
              flex-1

              text-left

              text-sm

              text-[var(--text-faint)]
            "
          >
            Buscar...
          </span>

          <kbd
            className="
              shrink-0

              rounded-md

              border
              border-[var(--border-token)]

              bg-[var(--surface-2)]

              px-1.5
              py-0.5

              text-[10px]

              text-[var(--text-faint)]
            "
          >
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* ========================= */}
      {/* DIREITA */}
      {/* ========================= */}

      <div className="flex items-center gap-2 sm:gap-5">
        <NotificationBell />

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
            text-[var(--text)]

            shadow-lg
            shadow-emerald-900/30

            overflow-hidden
          "
        >
          {usuario?.foto ? (
            <img
              src={usuario.foto}
              alt={nome}
              className="w-full h-full object-cover"
            />
          ) : (
            inicial
          )}
        </div>

        <div className="leading-tight hidden sm:block">
          <p
            className="
              text-[14px]
              font-semibold
              text-[var(--text)]
            "
          >
            {nome}
          </p>

          <p
            className="
              text-[11px]
              text-[var(--text-subtle)]
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
              hover:bg-[var(--surface-2)]
              transition
            "
          >
            <ChevronDown size={15} className="text-[var(--text-subtle)]" />
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
                border-[var(--border-token)]

                bg-[var(--surface)]

                backdrop-blur-xl

                shadow-2xl

                overflow-hidden
              "
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/perfil");
                }}
                className="
                  w-full
                  flex
                  items-center
                  gap-3

                  px-5
                  py-4

                  text-[var(--text)]

                  hover:bg-[var(--surface-2)]
                "
              >
                <User size={17} />
                Perfil
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  router.push("/configuracoes");
                }}
                className="
                  w-full
                  flex
                  items-center
                  gap-3

                  px-5
                  py-4

                  text-[var(--text)]

                  hover:bg-[var(--surface-2)]
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