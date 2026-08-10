"use client";

import {
  FilePlus2,
  LayoutTemplate,
  Users,
  RefreshCw,
  Upload,
  History,
  Settings2,
  ChevronRight,
} from "lucide-react";

const acoes = [
  {
    titulo: "Novo Documento",
    descricao: "Enviar documento para assinatura",
    icone: FilePlus2,
    cor: "bg-emerald-500/10 text-emerald-400",
  },
  {
    titulo: "Novo Template",
    descricao: "Criar modelo de documento",
    icone: LayoutTemplate,
    cor: "bg-blue-500/10 text-blue-400",
  },
  {
    titulo: "Gerenciar Assinantes",
    descricao: "Cadastrar participantes",
    icone: Users,
    cor: "bg-purple-500/10 text-purple-400",
  },
  {
    titulo: "Sincronizar",
    descricao: "Atualizar dados da Clicksign",
    icone: RefreshCw,
    cor: "bg-orange-500/10 text-orange-400",
  },
  {
    titulo: "Importar PDF",
    descricao: "Adicionar documento existente",
    icone: Upload,
    cor: "bg-cyan-500/10 text-cyan-400",
  },
  {
    titulo: "Histórico",
    descricao: "Visualizar eventos",
    icone: History,
    cor: "bg-pink-500/10 text-pink-400",
  },
];

export default function AcessoRapido() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl">

      <h2 className="mb-6 text-xl font-bold text-white">

        ⚡ Ações Rápidas

      </h2>

      <div className="space-y-3">

        {acoes.map((item, index) => {

          const Icon = item.icone;

          return (

            <button
              key={index}
              className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-800/40 p-4 transition hover:border-emerald-500/30 hover:bg-slate-800"
            >

              <div className="flex items-center gap-4">

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.cor}`}
                >

                  <Icon size={22} />

                </div>

                <div className="text-left">

                  <h3 className="font-semibold text-white">

                    {item.titulo}

                  </h3>

                  <p className="text-xs text-slate-400">

                    {item.descricao}

                  </p>

                </div>

              </div>

              <ChevronRight
                size={18}
                className="text-slate-500 transition group-hover:text-emerald-400"
              />

            </button>

          );

        })}

      </div>

      <div className="mt-6">

        <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 font-medium text-white transition hover:bg-emerald-700">

          <Settings2 size={18} />

          Configurar Integração

        </button>

      </div>

    </div>
  );
}