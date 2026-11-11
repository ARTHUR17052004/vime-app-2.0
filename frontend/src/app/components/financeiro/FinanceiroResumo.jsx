"use client";

import {
  CalendarCheck,
  Wallet,
  TrendingDown,
  TriangleAlert,
  Landmark,
  Receipt,
} from "lucide-react";

import { useIsMobile } from "@/hooks/useIsMobile";
import { formatarMoeda } from "../../../utils/dinheiro";

export default function FinanceiroResumo({
  receitaPrevista,
  totalDespesas,
  vencidos,
  lucroLiquido,
  taxasBoleto,
  recebidoNoMes,
}) {

  const isMobile = useIsMobile();

  const cards = [

    {
      titulo: "Recebido no Mês",
      valor: `R$ ${formatarMoeda(recebidoNoMes)}`,
      subtitulo: "Zera todo dia 1 -- só pagamento reconhecido este mês",
      cor: "bg-green-600",
      icone: CalendarCheck,
      corIcone: "bg-green-500/10 border-green-500/20 text-green-400",
    },

    {
      titulo: "Receita Prevista",
      valor: `R$ ${formatarMoeda(receitaPrevista)}`,
      subtitulo: "Receitas cadastradas",
      cor: "bg-sky-500",
      icone: Wallet,
      corIcone: "bg-sky-500/10 border-sky-500/20 text-sky-400",
    },

    {
      titulo: "Despesas",
      valor: `R$ ${formatarMoeda(totalDespesas)}`,
      subtitulo: "Total de despesas",
      cor: "bg-orange-500",
      icone: TrendingDown,
      corIcone: "bg-orange-500/10 border-orange-500/20 text-orange-400",
    },

    {
      titulo: "Vencidos",
      valor: `R$ ${formatarMoeda(vencidos)}`,
      subtitulo: "Receitas e despesas vencidas",
      cor: "bg-red-600",
      icone: TriangleAlert,
      corIcone: "bg-red-500/10 border-red-500/20 text-red-400",
    },

    {
      titulo: "Lucro Líquido",
      valor: `R$ ${formatarMoeda(lucroLiquido)}`,
      subtitulo: "Só o já pago/recebido, líquido",
      cor: "bg-emerald-500",
      icone: Landmark,
      corIcone: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    },

    {
      titulo: "Taxas de Boleto",
      valor: `R$ ${formatarMoeda(taxasBoleto)}`,
      subtitulo: "Valor de taxa acumulado",
      cor: "bg-gray-500",
      icone: Receipt,
      corIcone: "bg-gray-500/10 border-gray-500/20 text-gray-400",
    },

  ];

  // Celular: mesma organização compacta dos indicadores da Home
  // (ícone em círculo colorido, rótulo pequeno, valor em destaque) --
  // os cards grandes com tarja no topo ficam só pro desktop, onde tem
  // espaço de sobra (ver DashboardMobile.jsx, seção "INDICADORES").
  if (isMobile) {
    return (

      <div className="grid grid-cols-2 gap-3">

        {cards.map((card) => (

          <div
            key={card.titulo}
            className="rounded-2xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl p-3"
          >

            <div
              className={`w-9 h-9 rounded-full border flex items-center justify-center ${card.corIcone}`}
            >
              <card.icone size={16} />
            </div>

            <p className="mt-2 text-[11px] text-[var(--text-muted)] truncate">
              {card.titulo}
            </p>

            <p className="text-[17px] leading-tight font-extrabold text-[var(--text)] break-words">
              {card.valor}
            </p>

            <p className="mt-1 text-[10px] text-[var(--text-faint)] truncate">
              {card.subtitulo}
            </p>

          </div>

        ))}

      </div>

    );
  }

  return (

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

      {cards.map((card) => (

        <div
          key={card.titulo}
          className="
            bg-[var(--surface)]
            backdrop-blur-[24px]
            rounded-2xl
            border
            border-[var(--border-token)]
            overflow-hidden

            transition-all
            duration-300

            hover:-translate-y-1
            hover:border-emerald-400/20
            hover:shadow-[0_18px_42px_rgba(0,0,0,.28)]
          "
        >

          <div
            className={`${card.cor} h-2`}
          />

          <div className="p-6">

            <div className="flex items-start justify-between gap-3">

              <p className="text-[var(--text-subtle)] text-sm">
                {card.titulo}
              </p>

              <div
                className={`w-10 h-10 shrink-0 rounded-xl border flex items-center justify-center ${card.corIcone}`}
              >
                <card.icone size={20} />
              </div>

            </div>

            <h2 className="text-3xl font-bold text-[var(--text)] mt-3">
              {card.valor}
            </h2>

            <p className="text-xs text-[var(--text-faint)] mt-2">
              {card.subtitulo}
            </p>

          </div>

        </div>

      ))}

    </div>

  );
}
