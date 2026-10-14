"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House,
  FileText,
  Users,
  UserSquare2,
  Building2,
  ClipboardList,
  ShieldCheck,
  LifeBuoy,
  Wallet,
  Menu,
} from "lucide-react";

import { usePermissoes } from "../../../../hooks/usePermissao";

// Só os 3 primeiros com permissão entram na barra (o resto fica no "Mais",
// que já é filtrado por permissão -- ver MobileMoreMenu.jsx). Ordem é por
// frequência de uso real, não alfabética.
const CANDIDATOS = [
  { label: "Contratos", href: "/contratos", icon: FileText, permissao: "contratos.visualizar" },
  { label: "Inquilinos", href: "/inquilinos", icon: Users, permissao: "inquilinos.visualizar" },
  { label: "Financeiro", href: "/financeiro", icon: Wallet, permissao: "financeiro.visualizar" },
  { label: "Solicitações", href: "/solicitacoes", icon: ClipboardList, permissao: "solicitacoes.visualizar" },
  { label: "Vistorias", href: "/vistorias", icon: ShieldCheck, permissao: "vistorias.visualizar" },
  { label: "Locadores", href: "/locadores", icon: UserSquare2, permissao: "locadores.visualizar" },
  { label: "Unidades", href: "/unidades", icon: Building2, permissao: "unidades.visualizar" },
  { label: "Suporte", href: "/suporte", icon: LifeBuoy, permissao: "suporte.visualizar" },
];

export default function MobileBottomNav({ onAbrirMais, maisAberto }) {
  const pathname = usePathname();
  const { pode } = usePermissoes();

  const ITENS = [
    { label: "Início", href: "/", icon: House },
    ...CANDIDATOS.filter((item) => pode(item.permissao)).slice(0, 3),
  ];

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
