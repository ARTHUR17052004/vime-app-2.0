"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Volta pra LISTA do módulo (ex.: /inquilinos), não pra página anterior do
// histórico -- assim, mesmo chegando pela busca universal, o "Voltar" leva
// pra onde o conteúdo fica.
export default function BotaoVoltar({ href, label = "Voltar" }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-subtle)] hover:text-[var(--text)] transition"
    >
      <ArrowLeft size={18} />
      {label}
    </Link>
  );
}
