"use client";

import { useEffect, useState } from "react";

import { AsaasService } from "@/services/asaas.service";

export default function AsaasDiagnostico() {
  const [carregando, setCarregando] = useState(true);
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const [erroConexao, setErroConexao] = useState(null);

  const [dados, setDados] = useState({
    configurado: false,
    online: false,
    walletId: null,
    webhookConfigurado: false,
    ambiente: "sandbox",
  });

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);
    setErroConexao(null);

    try {
      const configResp = await AsaasService.config();
      const config = configResp.data || configResp;

      let online = false;
      let erro = null;

      if (config.configurado) {
        try {
          const statusResp = await AsaasService.status();
          const status = statusResp.data || statusResp;
          online = !!status.online;
          erro = status.erro || null;
        } catch (err) {
          erro = err.message;
        }
      }

      setDados({
        configurado: !!config.configurado,
        online,
        walletId: config.walletId || null,
        webhookConfigurado: !!config.webhookConfigurado,
        ambiente: config.ambiente || "sandbox",
      });

      setErroConexao(erro);
      setAtualizadoEm(new Date());
    } catch (err) {
      console.error("Erro ao carregar diagnóstico do Asaas:", err);
    } finally {
      setCarregando(false);
    }
  }

  const diagnosticos = [
    {
      nome: "API Key",
      status: !dados.configurado
        ? "Não configurada"
        : dados.online
        ? "Válida"
        : "Inválida ou sem resposta",
      cor: !dados.configurado
        ? "bg-gray-500"
        : dados.online
        ? "bg-green-500"
        : "bg-red-500",
    },
    {
      nome: "Conexão Asaas",
      status: !dados.configurado ? "Sem configuração" : dados.online ? "Online" : "Offline",
      cor: !dados.configurado
        ? "bg-gray-500"
        : dados.online
        ? "bg-green-500"
        : "bg-red-500",
    },
    {
      nome: "Wallet",
      status: dados.walletId ? "Encontrada" : "Não encontrada",
      cor: dados.walletId ? "bg-green-500" : "bg-gray-500",
    },
    {
      nome: "Webhook",
      status: dados.webhookConfigurado ? "Configurado" : "Não configurado",
      cor: dados.webhookConfigurado ? "bg-green-500" : "bg-gray-500",
    },
    {
      nome: "Ambiente",
      status: dados.ambiente === "producao" ? "Produção" : "Sandbox",
      cor: dados.ambiente === "producao" ? "bg-emerald-500" : "bg-blue-500",
    },
  ];

  return (
    <div className="bg-[var(--surface)] backdrop-blur-[24px] rounded-2xl border border-[var(--border-token)]">

      <div className="px-8 py-6 border-b border-[var(--border-token)] flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text)]">
            Diagnóstico da Integração
          </h2>

          <p className="text-[var(--text-subtle)] mt-2">
            Verifique rapidamente a saúde da integração com o Asaas.
          </p>
        </div>

        <button
          onClick={carregar}
          disabled={carregando}
          className="text-sm text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
        >
          {carregando ? "Verificando..." : "Verificar agora"}
        </button>
      </div>

      <div className="p-8 space-y-5">

        {diagnosticos.map((item) => (

          <div
            key={item.nome}
            className="
              flex
              justify-between
              items-center
              border
              border-[var(--border-token)]
              rounded-xl
              p-4
              hover:bg-[var(--surface-2)]
              transition
            "
          >

            <div className="flex items-center gap-4">

              <div
                className={`w-3 h-3 rounded-full ${item.cor}`}
              />

              <span className="font-semibold text-[var(--text-1)]">
                {item.nome}
              </span>

            </div>

            <span className="font-semibold text-[var(--text)]">
              {item.status}
            </span>

          </div>

        ))}

        {erroConexao && (
          <p className="text-sm text-red-400">
            Erro reportado pelo Asaas: {erroConexao}
          </p>
        )}

      </div>

      <div className="border-t border-[var(--border-token)] px-8 py-5 flex justify-between">

        <span className="text-[var(--text-subtle)]">
          Última sincronização
        </span>

        <span className="font-bold text-green-400">
          {atualizadoEm
            ? atualizadoEm.toLocaleString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "—"}
        </span>

      </div>

    </div>
  );
}
