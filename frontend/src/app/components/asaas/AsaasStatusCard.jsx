"use client";

import { useEffect, useState } from "react";

import { AsaasService } from "@/services/asaas.service";

export default function AsaasStatusCard() {
  const [carregando, setCarregando] = useState(true);
  const [atualizadoEm, setAtualizadoEm] = useState(null);

  const [dados, setDados] = useState({
    online: false,
    configurado: false,
    ambiente: "sandbox",
    walletId: null,
    webhookConfigurado: false,
  });

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setCarregando(true);

    try {
      const [statusResp, configResp] = await Promise.all([
        AsaasService.status(),
        AsaasService.config(),
      ]);

      const status = statusResp.data || statusResp;
      const config = configResp.data || configResp;

      setDados({
        online: !!status.online,
        configurado: !!config.configurado,
        ambiente: config.ambiente || "sandbox",
        walletId: config.walletId || null,
        webhookConfigurado: !!config.webhookConfigurado,
      });

      setAtualizadoEm(new Date());
    } catch (err) {
      console.error("Erro ao carregar status do Asaas:", err);
    } finally {
      setCarregando(false);
    }
  }

  const status = [
    {
      titulo: "API Asaas",
      valor: !dados.configurado
        ? "Não configurada"
        : dados.online
        ? "Conectada"
        : "Falha na conexão",
      cor: !dados.configurado
        ? "bg-gray-500"
        : dados.online
        ? "bg-green-500"
        : "bg-red-500",
    },
    {
      titulo: "Wallet",
      valor: dados.walletId ? "Encontrada" : "Não encontrada",
      cor: dados.walletId ? "bg-green-500" : "bg-gray-500",
    },
    {
      titulo: "Webhook",
      valor: dados.webhookConfigurado ? "Configurado" : "Não configurado",
      cor: dados.webhookConfigurado ? "bg-green-500" : "bg-gray-500",
    },
    {
      titulo: "Ambiente",
      valor: dados.ambiente === "producao" ? "Produção" : "Sandbox",
      cor: dados.ambiente === "producao" ? "bg-emerald-500" : "bg-blue-500",
    },
  ];

  return (
    <div className="bg-[var(--surface)] backdrop-blur-[24px] rounded-2xl border border-[var(--border-token)] overflow-hidden">

      <div className="px-8 py-6 border-b border-[var(--border-token)] flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text)]">
            Status da Integração
          </h2>

          <p className="text-[var(--text-subtle)] mt-1">
            Acompanhe rapidamente a situação da conexão com o Asaas.
          </p>
        </div>

        <button
          onClick={carregar}
          disabled={carregando}
          className="text-sm text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
        >
          {carregando ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      <div className="p-8 space-y-5">

        {status.map((item) => (

          <div
            key={item.titulo}
            className="flex justify-between items-center"
          >

            <div className="flex items-center gap-4">

              <div
                className={`w-3 h-3 rounded-full ${item.cor}`}
              />

              <span className="font-medium text-[var(--text-1)]">
                {item.titulo}
              </span>

            </div>

            <span className="font-semibold text-[var(--text)]">
              {item.valor}
            </span>

          </div>

        ))}

      </div>

      <div className="px-8 py-4 border-t border-[var(--border-token)] flex justify-between">

        <span className="text-[var(--text-subtle)]">
          Última verificação
        </span>

        <span className="font-semibold text-green-400">
          {atualizadoEm
            ? atualizadoEm.toLocaleTimeString("pt-BR")
            : "—"}
        </span>

      </div>

    </div>
  );
}
