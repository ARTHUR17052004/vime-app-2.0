"use client";

import { useRouter } from "next/navigation";

import {
  MessageCircle,
  FileSignature,
  Wallet,
  Bot,
  ArrowRight,
} from "lucide-react";

export default function IntegracoesCard({
  dados = {},
}) {

  const router = useRouter();

  const integracoes = [
    {
      nome: "WhatsApp",
      descricao: "Envio de mensagens automáticas.",
      conectado: !!dados.whatsappToken,
      icon: MessageCircle,
      color: "bg-green-500/20 text-green-400",
      rota: "/whatsapp",
    },
    {
      nome: "Asaas",
      descricao: "Cobranças e pagamentos.",
      conectado: !!dados.asaasToken,
      icon: Wallet,
      color: "bg-cyan-500/20 text-cyan-400",
      rota: "/asaas-config",
    },
    {
      nome: "Clicksign",
      descricao: "Assinatura digital.",
      conectado: !!dados.clicksignToken,
      icon: FileSignature,
      color: "bg-yellow-500/20 text-yellow-400",
      rota: "/clicksign",
    },
    {
      nome: "Inteligência Artificial",
      descricao: "Assistente do sistema.",
      conectado: null,
      icon: Bot,
      color: "bg-purple-500/20 text-purple-400",
      rota: null,
    },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 backdrop-blur-xl shadow-xl p-6">

      <div className="mb-8">

        <h2 className="text-2xl font-bold text-white">

          Integrações

        </h2>

        <p className="text-gray-400 mt-1">

          Serviços conectados ao VIME APP.

        </p>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {integracoes.map((item) => {

          const Icon = item.icon;

          const status =
            item.conectado === null
              ? "Em breve"
              : item.conectado
                ? "Conectado"
                : "Não configurado";

          return (

            <div
              key={item.nome}
              className="rounded-3xl border border-white/10 bg-slate-800/60 hover:border-emerald-500/30 hover:-translate-y-1 hover:shadow-xl transition-all p-6"
            >

              <div className="flex items-start justify-between">

                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center ${item.color}`}
                >

                  <Icon size={28} />

                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs ${
                    item.conectado
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-white/10 text-gray-300"
                  }`}
                >

                  {status}

                </span>

              </div>

              <h3 className="text-lg font-semibold text-white mt-5">

                {item.nome}

              </h3>

              <p className="text-sm text-gray-400 mt-2">

                {item.descricao}

              </p>

              <button
                disabled={!item.rota}
                onClick={() => item.rota && router.push(item.rota)}
                className="
                  mt-6 w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-600
                  transition-all py-3 flex items-center justify-center gap-2 font-medium text-white
                "
              >

                Configurar

                <ArrowRight size={18} />

              </button>

            </div>

          );

        })}

      </div>

    </div>
  );
}
