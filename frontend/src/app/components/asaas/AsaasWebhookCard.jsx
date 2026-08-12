"use client";

import { useState } from "react";

import { API_URL } from "@/config/api";
import { AsaasService } from "@/services/asaas.service";

export default function AsaasWebhookCard() {
  const webhook = `${API_URL}/asaas/webhook`;

  const [copiado, setCopiado] = useState(false);
  const [testando, setTestando] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [status, setStatus] = useState({
    tipo: "neutro",
    texto: "Webhook pronto para configuração.",
  });

  const copiar = async () => {
    await navigator.clipboard.writeText(webhook);

    setCopiado(true);

    setTimeout(() => {
      setCopiado(false);
    }, 2000);
  };

  async function testarWebhook() {
    setTestando(true);

    try {
      const resposta = await AsaasService.testarWebhook();
      const info = resposta.data || resposta;

      setStatus({
        tipo: "sucesso",
        texto: info.mensagem || "Webhook registrado com sucesso no Asaas.",
      });
    } catch (err) {
      setStatus({
        tipo: "erro",
        texto: err.message || "Não foi possível registrar o webhook no Asaas.",
      });
    } finally {
      setTestando(false);
    }
  }

  async function gerarToken() {
    setGerando(true);

    try {
      await AsaasService.gerarTokenWebhook();

      setStatus({
        tipo: "sucesso",
        texto: "Novo token gerado e salvo. Clique em Testar Webhook para reenviar a configuração ao Asaas.",
      });
    } catch (err) {
      setStatus({
        tipo: "erro",
        texto: err.message || "Não foi possível gerar um novo token.",
      });
    } finally {
      setGerando(false);
    }
  }

  const corBola = {
    neutro: "bg-emerald-500",
    sucesso: "bg-emerald-500",
    erro: "bg-red-500",
  };

  return (
    <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-[24px] rounded-2xl border border-white/[0.07]">

      <div className="px-8 py-6 border-b border-white/[0.07]">

        <h2 className="text-2xl font-bold text-white">
          Webhook do Asaas
        </h2>

        <p className="text-gray-400 mt-2">
          Configure esta URL dentro do painel do Asaas para que o
          VIME receba automaticamente os eventos de pagamento.
        </p>

      </div>

      <div className="p-8">

        <label className="block text-sm font-semibold text-gray-200 mb-3">
          URL do Webhook
        </label>

        <div className="flex gap-3">

          <input
            value={webhook}
            readOnly
            className="
              flex-1
              border
              border-white/[0.07]
              rounded-xl
              p-3
              bg-white/5
              text-white
            "
          />

          <button
            onClick={copiar}
            className="
              px-5
              rounded-xl
              bg-blue-600
              text-white
              hover:bg-blue-700
            "
          >
            {copiado ? "Copiado!" : "Copiar"}
          </button>

        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">

          <button
            onClick={testarWebhook}
            disabled={testando}
            className="
              bg-green-700
              hover:bg-green-800
              disabled:opacity-50
              text-white
              rounded-xl
              py-3
            "
          >
            {testando ? "Testando..." : "Testar Webhook"}
          </button>

          <button
            onClick={() =>
              window.open(
                "https://docs.asaas.com/docs/webhook",
                "_blank",
                "noopener,noreferrer"
              )
            }
            className="
              bg-purple-700
              hover:bg-purple-800
              text-white
              rounded-xl
              py-3
            "
          >
            Abrir Documentação
          </button>

          <button
            onClick={gerarToken}
            disabled={gerando}
            className="
              border
              border-white/[0.07]
              rounded-xl
              py-3
              text-gray-200
              hover:bg-white/5
              disabled:opacity-50
            "
          >
            {gerando ? "Gerando..." : "Gerar Novo Token"}
          </button>

        </div>

      </div>

      <div className="border-t border-white/[0.07] px-8 py-4">

        <div className="flex items-center gap-3">

          <div className={`w-3 h-3 rounded-full ${corBola[status.tipo]}`} />

          <span className="font-medium text-gray-200">
            {status.texto}
          </span>

        </div>

      </div>

    </div>
  );
}
