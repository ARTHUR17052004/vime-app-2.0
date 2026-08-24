"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Wallet,
  Menu,
} from "lucide-react";

const ITENS = [
  { label: "Início", href: "/", icon: LayoutDashboard },
  { label: "Contratos", href: "/contratos", icon: FileText },
  { label: "Inquilinos", href: "/inquilinos", icon: Users },
  { label: "Financeiro", href: "/financeiro", icon: Wallet },
];

export default function MobileBottomNav({ onAbrirMais, maisAberto }) {
  const pathname = usePathname();

  return (
    <nav
      className="
        fixed
        bottom-0
        left-0
        right-0
        z-40

        h-[68px]

        pb-[env(safe-area-inset-bottom)]

        border-t
        border-[var(--border-token)]

        bg-[var(--surface)]

        backdrop-blur-2xl

        shadow-[0_-8px_30px_rgba(0,0,0,.18)]

        flex
        items-stretch
        justify-around
      "
    >
      {ITENS.map((item) => {
        const Icon = item.icon;
        const ativo = !maisAberto && pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="
              relative

              flex
              flex-col
              items-center
              justify-center
              gap-1

              flex-1

              min-w-0
            "
          >
            {ativo && (
              <span
                className="
                  absolute
                  top-0
                  left-1/2
                  -translate-x-1/2

                  w-8
                  h-0.75

                  rounded-full

                  bg-emerald-400
                "
              />
            )}

            <Icon
              size={24}
              strokeWidth={2}
              className={ativo ? "text-emerald-400" : "text-[var(--text-subtle)]"}
            />

            <span
              className={`
                text-[10px]
                font-medium
                truncate
                max-w-full
                px-1

                ${ativo ? "text-emerald-400" : "text-[var(--text-subtle)]"}
              `}
            >
              {item.label}
            </span>
          </Link>
        );
      })}

      <button
        onClick={onAbrirMais}
        className="
          flex
          flex-col
          items-center
          justify-center
          gap-1

          flex-1

          min-w-0
        "
      >
        <Menu
          size={24}
          strokeWidth={2}
          className={maisAberto ? "text-emerald-400" : "text-[var(--text-subtle)]"}
        />

        <span
          className={`
            text-[10px]
            font-medium

            ${maisAberto ? "text-emerald-400" : "text-[var(--text-subtle)]"}
          `}
        >
          Mais
        </span>
      </button>
    </nav>
  );
}
