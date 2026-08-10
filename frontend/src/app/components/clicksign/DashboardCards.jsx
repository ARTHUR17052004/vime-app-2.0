"use client";

import {
  FileText,
  Clock3,
  CheckCircle2,
  TimerReset,
} from "lucide-react";

const cards = [
  {
    titulo: "Documentos Enviados",
    valor: "126",
    descricao: "Total enviados este mês",
    cor: "bg-blue-500/10",
    texto: "text-blue-400",
    icone: FileText,
  },
  {
    titulo: "Aguardando Assinatura",
    valor: "18",
    descricao: "Necessitam ação",
    cor: "bg-yellow-500/10",
    texto: "text-yellow-400",
    icone: Clock3,
  },
  {
    titulo: "Concluídos",
    valor: "97",
    descricao: "Assinados com sucesso",
    cor: "bg-emerald-500/10",
    texto: "text-emerald-400",
    icone: CheckCircle2,
  },
  {
    titulo: "Tempo Médio",
    valor: "2,4 dias",
    descricao: "Tempo até concluir",
    cor: "bg-purple-500/10",
    texto: "text-purple-400",
    icone: TimerReset,
  },
];

export default function DashboardCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      {cards.map((card, index) => {

        const Icon = card.icone;

        return (

          <div
            key={index}
            className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl transition hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-2xl"
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-400">

                  {card.titulo}

                </p>

                <h2 className="mt-2 text-3xl font-bold text-white">

                  {card.valor}

                </h2>

                <p className="mt-2 text-sm text-slate-500">

                  {card.descricao}

                </p>

              </div>

              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${card.cor}`}
              >

                <Icon
                  size={28}
                  className={card.texto}
                />

              </div>

            </div>

          </div>

        );

      })}

    </div>
  );
}