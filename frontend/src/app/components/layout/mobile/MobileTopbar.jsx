/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Search } from "lucide-react";

import NotificationBell from "../../notificacoes/NotificationBell";
import { useAuth } from "../../../../context/AuthContext";

// "ARTHUR " no cadastro vira "Arthur" na saudação.
function nomeProprio(nome) {
  return (nome || "").toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

function iniciais(nome) {
  const partes = (nome || "").trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

const botaoRedondo = `
  w-10
  h-10
  rounded-full
  border
  border-[var(--border-token)]
  bg-[var(--surface-2)]
  flex
  items-center
  justify-center
`;

export default function MobileTopbar() {

  const { usuario } = useAuth();
  const primeiroNome = nomeProprio(usuario?.nome?.trim().split(/\s+/)[0] || "");

  return (
    <header
      className="
        sticky
        top-0
        z-30

        border-b
        border-[var(--border-token)]

        bg-[var(--surface)]

        backdrop-blur-2xl

        px-4
        py-2.5

        flex
        items-center
        justify-between
        gap-2
      "
    >

      <Link href="/" className="flex items-center gap-2.5 min-w-0">
        <img
          src="/images/logo-vime.jpeg"
          alt="VIME"
          className="w-10 h-10 object-contain rounded-xl shrink-0"
          draggable={false}
        />

        <div className="min-w-0 leading-tight">
          <h1 className="text-[18px] font-extrabold text-[var(--text)]">
            VIME
          </h1>
          <p className="text-[10px] text-[var(--text-subtle)] whitespace-nowrap">
            Gestão Inteligente
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-1.5 shrink-0">

        <button
          onClick={() => window.dispatchEvent(new Event("abrir-busca-universal"))}
          className={botaoRedondo}
          aria-label="Buscar"
        >
          <Search size={18} className="text-[var(--text)]" />
        </button>

        <div className={botaoRedondo}>
          <NotificationBell />
        </div>

        <Link href="/perfil" className="flex items-center gap-2" aria-label="Meu perfil">

          <span className="relative w-10 h-10 rounded-full bg-emerald-700/60 border border-emerald-400/30 flex items-center justify-center overflow-hidden text-[14px] font-bold text-white">
            {usuario?.foto ? (
              <img src={usuario.foto} alt="" className="w-full h-full object-cover" />
            ) : (
              iniciais(usuario?.nome)
            )}
            <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[var(--surface)]" />
          </span>

          {primeiroNome && (
            <span className="hidden min-[400px]:block leading-tight max-w-[76px]">
              <span className="block text-[12px] font-semibold text-[var(--text)] truncate">
                Olá, {primeiroNome}
              </span>
              <span className="block text-[10px] text-[var(--text-subtle)] truncate">
                {usuario?.perfil?.toString().toLowerCase().replace(/^./, (c) => c.toUpperCase())}
              </span>
            </span>
          )}

        </Link>

      </div>

    </header>
  );
}
