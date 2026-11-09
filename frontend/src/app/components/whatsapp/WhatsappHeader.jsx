"use client";

import Link from "next/link";
import { MessageCircle, BarChart3 } from "lucide-react";

import { usePermissao } from "../../../hooks/usePermissao";

export default function WhatsappHeader() {

  const podeVerRelatorio = usePermissao("whatsapp.relatorio");

  return (

    <div className="mb-8">

      <div className="flex items-center justify-between flex-wrap gap-4">

        <div>

          <h1 className="flex items-center gap-3 text-4xl font-black text-[var(--text)]">

            <MessageCircle
              size={38}
              className="text-green-500"
            />

            WhatsApp IA

          </h1>

          <p className="mt-2 text-[var(--text-subtle)]">

            Central de atendimento, automações e integração com WhatsApp.

          </p>

        </div>

        {podeVerRelatorio && (
          <Link
            href="/whatsapp/relatorio"
            className="
              inline-flex items-center gap-2
              rounded-xl border border-[var(--border-token)]
              bg-[var(--surface-2)] hover:bg-[var(--surface-3)]
              px-4 py-2.5 text-sm font-semibold text-[var(--text)]
              transition
            "
          >
            <BarChart3 size={16} />
            Relatório de mensagens
          </Link>
        )}

      </div>

    </div>

  );

}