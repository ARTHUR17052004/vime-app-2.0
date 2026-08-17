"use client";

import { useState } from "react";

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

import { ClicksignService } from "@/services/clicksign.service";

const acoes = [
  {
    titulo: "Novo Documento",
    descricao: "Enviar documento para assinatura",
    icone: FilePlus2,
    cor: "bg-emerald-500/10 text-emerald-400",
    alvo: "clicksign-documentos",
  },
  {
    titulo: "Templates",
    descricao: "Modelos de documento (em breve)",
    icone: LayoutTemplate,
    cor: "bg-blue-500/10 text-blue-400",
    alvo: "clicksign-templates",
  },
  {
    titulo: "Gerenciar Assinantes",
    descricao: "Ver assinantes cadastrados",
    icone: Users,
    cor: "bg-purple-500/10 text-purple-400",
    alvo: "clicksign-assinantes",
  },
  {
    titulo: "Sincronizar",
    descricao: "Atualizar dados da Clicksign",
    icone: RefreshCw,
    cor: "bg-orange-500/10 text-orange-400",
    acao: "sincronizar",
  },
  {
    titulo: "Importar PDF",
    descricao: "Adicionar documento existente",
    icone: Upload,
    cor: "bg-cyan-500/10 text-cyan-400",
    alvo: "clicksign-documentos",
  },
  {
    titulo: "Histórico",
    descricao: "Visualizar eventos",
    icone: History,
    cor: "bg-pink-500/10 text-pink-400",
    alvo: "clicksign-historico",
  },
];

export default function AcessoRapido() {
  const [sincronizando, setSincronizando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  function irPara(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function executar(item) {
    if (item.acao === "sincronizar") {
      setSincronizando(true);
      setMensagem(null);

      try {
        const resposta = await ClicksignService.sincronizar();
        const info = resposta.data || resposta;
        setMensagem(`Sincronização concluída: ${info.atualizados ?? 0} contrato(s) atualizado(s).`);
      } catch (err) {
        setMensagem(err.message || "Erro ao sincronizar com a Clicksign.");
      } finally {
        setSincronizando(false);
      }
      return;
    }

    if (item.alvo) {
      irPara(item.alvo);
    }
  }

  return (
    <div className="rounded-3xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl p-6 shadow-xl">

      <h2 className="mb-6 text-xl font-bold text-[var(--text)]">

        ⚡ Ações Rápidas

      </h2>

      <div className="space-y-3">

        {acoes.map((item, index) => {

          const Icon = item.icone;

          return (

            <button
              key={index}
              onClick={() => executar(item)}
              disabled={item.acao === "sincronizar" && sincronizando}
              className="group flex w-full items-center justify-between rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-4 transition hover:border-emerald-500/30 hover:bg-slate-800 disabled:opacity-50"
            >

              <div className="flex items-center gap-4">

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.cor}`}
                >

                  <Icon
                    size={22}
                    className={item.acao === "sincronizar" && sincronizando ? "animate-spin" : ""}
                  />

                </div>

                <div className="text-left">

                  <h3 className="font-semibold text-[var(--text)]">

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

      {mensagem && (
        <p className="mt-4 text-sm text-slate-300">{mensagem}</p>
      )}

      <div className="mt-6">

        <button
          onClick={() => irPara("clicksign-token")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 font-medium text-[var(--text)] transition hover:bg-emerald-700"
        >

          <Settings2 size={18} />

          Configurar Integração

        </button>

      </div>

    </div>
  );
}
