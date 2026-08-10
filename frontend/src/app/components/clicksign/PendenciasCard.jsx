"use client";

import {
  Clock3,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const pendencias = [
  {
    documento: "Contrato João Silva",
    pessoa: "João Silva",
    status: "Aguardando Assinatura",
    cor: "text-yellow-400",
    icone: Clock3,
  },
  {
    documento: "Aditivo Comercial",
    pessoa: "Maria Souza",
    status: "Expira Hoje",
    cor: "text-orange-400",
    icone: AlertTriangle,
  },
  {
    documento: "Distrato Pedro",
    pessoa: "Pedro Lima",
    status: "Recusado",
    cor: "text-red-400",
    icone: XCircle,
  },
  {
    documento: "Contrato Sala 05",
    pessoa: "Carlos Henrique",
    status: "Concluído",
    cor: "text-emerald-400",
    icone: CheckCircle2,
  },
];

export default function PendenciasCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-2xl font-bold text-white">

            Pendências

          </h2>

          <p className="text-slate-400">

            Acompanhe documentos que precisam de atenção.

          </p>

        </div>

        <button className="text-emerald-400 hover:text-emerald-300 transition">

          Ver tudo

        </button>

      </div>

      <div className="space-y-4">

        {pendencias.map((item, index) => {

          const Icon = item.icone;

          return (

            <div
              key={index}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-800/40 p-4 transition hover:border-emerald-500/30"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-700">

                  <Icon
                    size={22}
                    className={item.cor}
                  />

                </div>

                <div>

                  <h3 className="font-semibold text-white">

                    {item.documento}

                  </h3>

                  <p className="text-sm text-slate-400">

                    {item.pessoa}

                  </p>

                </div>

              </div>

              <div className="flex items-center gap-4">

                <span className={`${item.cor} text-sm font-medium`}>

                  {item.status}

                </span>

                <button className="rounded-xl bg-slate-700 p-2 text-white hover:bg-slate-600 transition">

                  <ArrowRight size={18} />

                </button>

              </div>

            </div>

          );

        })}

      </div>

    </div>
  );
}