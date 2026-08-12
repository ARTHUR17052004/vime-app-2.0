"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

import { AsaasService } from "@/services/asaas.service";

export default function AsaasWizard() {
  const [carregando, setCarregando] = useState(true);

  const [dados, setDados] = useState({
    configurado: false,
    online: false,
    walletId: null,
    webhookConfigurado: false,
  });

  useEffect(() => {
    async function carregar() {
      try {
        const configResp = await AsaasService.config();
        const config = configResp.data || configResp;

        let online = false;

        if (config.configurado) {
          try {
            const statusResp = await AsaasService.status();
            online = !!(statusResp.data || statusResp).online;
          } catch {
            online = false;
          }
        }

        setDados({
          configurado: !!config.configurado,
          online,
          walletId: config.walletId || null,
          webhookConfigurado: !!config.webhookConfigurado,
        });
      } catch (err) {
        console.error("Erro ao carregar assistente do Asaas:", err);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  const passo1 = dados.configurado;
  const passo2 = dados.online;
  const passo3 = !!dados.walletId;
  const passo4 = dados.webhookConfigurado;
  const passo5 = passo1 && passo2 && passo3 && passo4;

  const etapas = [
    {
      numero: 1,
      titulo: "API",
      descricao: "Informar a API Key",
      concluido: passo1,
    },
    {
      numero: 2,
      titulo: "Conexão",
      descricao: "Testar comunicação",
      concluido: passo2,
    },
    {
      numero: 3,
      titulo: "Wallet",
      descricao: "Buscar Wallet ID",
      concluido: passo3,
    },
    {
      numero: 4,
      titulo: "Webhook",
      descricao: "Configurar eventos",
      concluido: passo4,
    },
    {
      numero: 5,
      titulo: "Finalizar",
      descricao: "Salvar configuração",
      concluido: passo5,
    },
  ];

  return (
    <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-[24px] rounded-2xl border border-white/[0.07] p-8">

      <h2 className="text-2xl font-bold text-white">
        Assistente de Configuração
      </h2>

      <p className="text-gray-400 mt-2 mb-8">
        {carregando
          ? "Verificando o progresso da integração..."
          : passo5
          ? "Integração com o Asaas concluída."
          : "Siga as etapas abaixo para concluir a integração com o Asaas."}
      </p>

      <div className="flex items-center justify-between flex-wrap gap-6">

        {etapas.map((etapa, index) => (

          <div
            key={etapa.numero}
            className="flex items-center flex-1 min-w-[170px]"
          >

            <div className="flex flex-col items-center">

              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white transition-colors
                ${etapa.concluido ? "bg-green-600" : "bg-white/10"}`}
              >
                {etapa.concluido ? <Check size={20} /> : etapa.numero}
              </div>

              <span className="mt-3 font-semibold text-white">
                {etapa.titulo}
              </span>

              <span className="text-xs text-gray-400 text-center mt-1">
                {etapa.descricao}
              </span>

            </div>

            {index < etapas.length - 1 && (
              <div
                className={`flex-1 h-1 mx-4 rounded transition-colors ${
                  etapa.concluido ? "bg-green-600" : "bg-white/10"
                }`}
              />
            )}

          </div>

        ))}

      </div>

    </div>
  );
}
