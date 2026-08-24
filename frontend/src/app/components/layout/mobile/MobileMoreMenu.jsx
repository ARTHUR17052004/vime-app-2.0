/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { X, User, Settings, LogOut } from "lucide-react";

import menuConfig from "../../../config/menuConfig";
import { useAuth } from "../../../../context/AuthContext";
import { useTheme } from "../../../../context/ThemeContext";

export default function MobileMoreMenu({ aberto, onFechar }) {
  const { usuario, logout } = useAuth();
  const { textoRodape } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [aberto]);

  useEffect(() => {
    onFechar?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!aberto) return null;

  const ehAdministrador = usuario?.perfil === "ADMINISTRADOR";
  const permissoesUsuario = usuario?.permissoes || [];

  function podeVer(item) {
    if (ehAdministrador) return true;
    if (!item.permissao && !item.permissoes) return true;

    if (item.permissoes) {
      return item.permissoes.some((p) => permissoesUsuario.includes(p));
    }

    return permissoesUsuario.includes(item.permissao);
  }

  const menuVisivel = menuConfig
    .map((section) => ({
      ...section,
      items: section.items.filter(podeVer),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div
        onClick={onFechar}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <div
        className="
          relative
          mt-auto

          max-h-[88vh]

          rounded-t-3xl

          border-t
          border-[var(--border-token)]

          bg-[var(--surface)]

          flex
          flex-col

          overflow-hidden

          shadow-[0_-20px_60px_rgba(0,0,0,.35)]
        "
      >
        <div
          className="
            flex
            items-center
            justify-between

            px-5
            pt-4
            pb-3

            border-b
            border-[var(--border-token)]
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
                  className="w-full h-full object-cover"
                />
              ) : (
                (usuario?.nome || "?").charAt(0).toUpperCase()
              )}
            </div>

            <div className="leading-tight">
              <p className="text-sm font-semibold text-[var(--text)]">
                {usuario?.nome || "Visitante"}
              </p>
              <p className="text-xs text-emerald-400">
                {usuario?.perfil || "SEM PERFIL"}
              </p>
            </div>
          </div>

          <button
            onClick={onFechar}
            className="
              w-10
              h-10

              rounded-full

              bg-[var(--surface-2)]

              flex
              items-center
              justify-center
            "
          >
            <X size={18} className="text-[var(--text)]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {menuVisivel.map((section) => (
            <div key={section.title}>
              <p
                className="
                  mb-2
                  px-2

                  text-[12px]
                  font-bold
                  uppercase
                  tracking-[0.12em]

                  text-emerald-400
                "
              >
                {section.title}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const ativo = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        flex
                        items-center
                        gap-4

                        h-14

                        rounded-2xl

                        px-4

                        transition

                        ${
                          ativo
                            ? "bg-emerald-700/30 border border-emerald-500/25"
                            : "hover:bg-[var(--surface-2)]"
                        }
                      `}
                    >
                      <Icon
                        size={22}
                        className={ativo ? "text-emerald-300" : "text-[var(--text-subtle)]"}
                      />

                      <span
                        className={`
                          text-[16px]
                          font-medium

                          ${ativo ? "text-[var(--text)]" : "text-[var(--text-muted)]"}
                        `}
                      >
                        {item.label}
                      </span>

                      {item.badge && (
                        <span
                          className="
                            ml-auto

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

        <div className="border-t border-[var(--border-token)] px-4 py-4 space-y-1">
          <Link
            href="/perfil"
            className="
              flex
              items-center
              gap-4

              h-14

              rounded-2xl
              px-4

              hover:bg-[var(--surface-2)]
            "
          >
            <User size={22} className="text-[var(--text-subtle)]" />
            <span className="text-[16px] font-medium text-[var(--text-muted)]">
              Perfil
            </span>
          </Link>

          <Link
            href="/configuracoes"
            className="
              flex
              items-center
              gap-4

              h-14

              rounded-2xl
              px-4

              hover:bg-[var(--surface-2)]
            "
          >
            <Settings size={22} className="text-[var(--text-subtle)]" />
            <span className="text-[16px] font-medium text-[var(--text-muted)]">
              Configurações
            </span>
          </Link>

          <button
            onClick={logout}
            className="
              w-full

              flex
              items-center
              gap-4

              h-14

              rounded-2xl
              px-4

              hover:bg-red-500/10
            "
          >
            <LogOut size={22} className="text-red-400" />
            <span className="text-[16px] font-medium text-red-400">
              Sair
            </span>
          </button>

          <p className="pt-2 text-center text-[10px] text-[var(--text-faint)]">
            {textoRodape || "VIME 2.0.0"}
          </p>
        </div>
      </div>
    </div>
  );
}
