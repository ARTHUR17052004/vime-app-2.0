"use client";

import {
  History,
  Send,
  PenSquare,
  CheckCircle2,
  XCircle,
  Clock3,
} from "lucide-react";

const historico = [
  {
    titulo: "Documento enviado",
    descricao: "Contrato de Locação - João Silva",
    horario: "Hoje • 09:12",
    cor: "text-blue-400",
    icone: Send,
  },
  {
    titulo: "Documento assinado",
    descricao: "Maria Souza concluiu a assinatura.",
    horario: "Hoje • 10:34",
    cor: "text-emerald-400",
    icone: PenSquare,
  },
  {
    titulo: "Assinatura concluída",
    descricao: "Contrato finalizado com sucesso.",
    horario: "Ontem • 16:20",
    cor: "text-emerald-500",
    icone: CheckCircle2,
  },
  {
    titulo: "Documento recusado",
    descricao: "Pedro Lima recusou a assinatura.",
    horario: "Ontem • 11:48",
    cor: "text-red-400",
    icone: XCircle,
  },
  {
    titulo: "Documento expirou",
    descricao: "Prazo para assinatura encerrado.",
    horario: "08/08 • 18:00",
    cor: "text-yellow-400",
    icone: Clock3,
  },
];

export default function HistoricoCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h2 className="flex items-center gap-3 text-2xl font-bold text-white">

            <History
              size={25}
              className="text-emerald-400"
            />

            Histórico

          </h2>

          <p className="text-slate-400">

            Últimas movimentações da integração Clicksign.

          </p>

        </div>

        <button className="text-emerald-400 hover:text-emerald-300 transition">

          Ver tudo

        </button>

      </div>

      <div className="space-y-5">

        {historico.map((item, index) => {

          const Icon = item.icone;

          return (

            <div
              key={index}
              className="flex gap-4"
            >

              <div className="flex flex-col items-center">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800">

                  <Icon
                    size={20}
                    className={item.cor}
                  />

                </div>

                {index !== historico.length - 1 && (
                  <div className="mt-2 h-12 w-px bg-slate-700" />
                )}

              </div>

              <div className="flex-1 rounded-2xl border border-white/10 bg-slate-800/30 p-4">

                <div className="flex items-center justify-between">

                  <h3 className="font-semibold text-white">

                    {item.titulo}

                  </h3>

                  <span className="text-xs text-slate-500">

                    {item.horario}

                  </span>

                </div>

                <p className="mt-2 text-sm text-slate-400">

                  {item.descricao}

                </p>

              </div>

            </div>

          );

        })}

      </div>

    </div>
  );
}