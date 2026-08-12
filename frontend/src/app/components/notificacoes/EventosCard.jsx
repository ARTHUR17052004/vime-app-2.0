"use client";

import {
  CalendarPlus,
  FileSignature,
  DollarSign,
  ClipboardCheck,
  Wrench,
  UserPlus,
  TriangleAlert,
  BellRing,
} from "lucide-react";

const eventos = [
  {
    titulo: "Novo Contrato",
    descricao: "Enviar quando um contrato for criado.",
    icone: FileSignature,
    ativo: true,
  },
  {
    titulo: "Pagamento Recebido",
    descricao: "Avisar quando um pagamento for confirmado.",
    icone: DollarSign,
    ativo: true,
  },
  {
    titulo: "Aluguel Vencendo",
    descricao: "Lembrar antes do vencimento.",
    icone: CalendarPlus,
    ativo: true,
  },
  {
    titulo: "Nova Vistoria",
    descricao: "Notificar criação de vistorias.",
    icone: ClipboardCheck,
    ativo: true,
  },
  {
    titulo: "Nova Solicitação",
    descricao: "Avisar abertura de solicitações.",
    icone: Wrench,
    ativo: true,
  },
  {
    titulo: "Novo Inquilino",
    descricao: "Notificar novos cadastros.",
    icone: UserPlus,
    ativo: false,
  },
  {
    titulo: "Avisos Gerais",
    descricao: "Enviar comunicados administrativos.",
    icone: BellRing,
    ativo: true,
  },
  {
    titulo: "Alertas do Sistema",
    descricao: "Exibir erros e eventos críticos.",
    icone: TriangleAlert,
    ativo: true,
  },
];

export default function EventosCard() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">

      <div className="mb-6">

        <h2 className="text-2xl font-bold text-white">
          Eventos Automáticos
        </h2>

        <p className="text-slate-400">
          Escolha quais eventos irão gerar notificações automaticamente.
        </p>

      </div>

      <div className="grid gap-4 md:grid-cols-2">

        {eventos.map((evento, index) => {

          const Icon = evento.icone;

          return (

            <div
              key={index}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-800/40 p-4"
            >

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">

                  <Icon
                    size={22}
                    className="text-emerald-400"
                  />

                </div>

                <div>

                  <h3 className="font-semibold text-white">
                    {evento.titulo}
                  </h3>

                  <p className="text-sm text-slate-400">
                    {evento.descricao}
                  </p>

                </div>

              </div>

              <button
                className={`h-7 w-14 rounded-full transition ${
                  evento.ativo
                    ? "bg-emerald-500"
                    : "bg-slate-600"
                }`}
              >
                <div
                  className={`h-6 w-6 rounded-full bg-white transition ${
                    evento.ativo
                      ? "translate-x-7"
                      : "translate-x-0"
                  }`}
                />
              </button>

            </div>

          );

        })}

      </div>

      <div className="mt-6 flex justify-end">

        <button className="rounded-2xl bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700">

          Salvar Eventos

        </button>

      </div>

    </div>
  );
}