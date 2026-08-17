"use client";

import { useEffect, useState } from "react";

import {
  Webhook,
  CheckCircle2,
  Copy,
  Wifi,
  WifiOff,
} from "lucide-react";

import { ClicksignService } from "@/services/clicksign.service";
import { API_URL } from "@/config/api";

const EVENTOS = [
  "Documento Criado",
  "Documento Assinado",
  "Documento Recusado",
  "Documento Cancelado",
  "Documento Expirado",
  "Assinante Adicionado",
];

const WEBHOOK_URL = `${API_URL}/clicksign/webhook`;

export default function WebhookCard() {
  const [statusApi, setStatusApi] = useState({ configurado: false });
  const [testando, setTestando] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        const resposta = await ClicksignService.status();
        setStatusApi(resposta?.data || resposta);
      } catch (err) {
        console.error("Erro ao carregar status da Clicksign:", err);
      }
    }

    carregar();
  }, []);

  function copiarUrl() {
    navigator.clipboard?.writeText(WEBHOOK_URL);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  async function testarWebhook() {
    setTestando(true);
    setMensagem(null);

    try {
      const resposta = await ClicksignService.testarConexao();
      const info = resposta.data || resposta;

      setMensagem({
        tipo: resposta.success ? "sucesso" : "erro",
        texto: resposta.success
          ? "Backend acessível — cadastre esta URL como webhook no painel da Clicksign para receber eventos."
          : info.mensagem || "Não foi possível validar a conexão com a Clicksign.",
      });
    } catch (err) {
      setMensagem({
        tipo: "erro",
        texto: err.message || "Não foi possível testar o webhook.",
      });
    } finally {
      setTestando(false);
    }
  }

  const conectado = !!statusApi?.configurado;

  return (
    <div className="rounded-3xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl p-6 shadow-xl">

      <div className="flex items-center gap-3 mb-6">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">

          <Webhook
            size={24}
            className="text-emerald-400"
          />

        </div>

        <div>

          <h2 className="text-2xl font-bold text-[var(--text)]">

            Webhooks

          </h2>

          <p className="text-slate-400">

            Eventos enviados automaticamente pela Clicksign ao VIME.

          </p>

        </div>

      </div>

      <div className="space-y-5">

        <div>

          <label className="mb-2 block text-sm text-slate-300">

            URL do Webhook (cadastre no painel da Clicksign)

          </label>

          <div className="flex">

            <input
              type="text"
              readOnly
              value={WEBHOOK_URL}
              className="flex-1 rounded-l-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-3 text-[var(--text)] outline-none"
            />

            <button
              onClick={copiarUrl}
              className="rounded-r-2xl border-y border-r border-[var(--border-token)] bg-slate-700 px-4 hover:bg-slate-600"
            >
              <Copy size={18} className="text-[var(--text)]" />
            </button>

          </div>

          {copiado && (
            <p className="mt-1 text-xs text-emerald-400">URL copiada.</p>
          )}

        </div>

        <div>

          <label className="mb-3 block text-sm text-slate-300">

            Eventos que este endpoint já trata (definidos no código, informativo)

          </label>

          <div className="grid gap-3 md:grid-cols-2">

            {EVENTOS.map((evento, index) => (

              <div
                key={index}
                className="flex items-center gap-3 rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-3 text-slate-300"
              >

                {evento}

              </div>

            ))}

          </div>

          <p className="mt-2 text-xs text-slate-500">
            Hoje o backend processa "signature_finished" e "document_cancelled" — os demais eventos são aceitos mas ainda não geram ação.
          </p>

        </div>

        <div
          className={`rounded-2xl border p-4 ${
            conectado
              ? "border-emerald-500/20 bg-emerald-500/10"
              : "border-[var(--border-token)] bg-[var(--surface-2)]"
          }`}
        >

          <div className="flex items-center gap-3">

            {conectado ? (
              <Wifi size={20} className="text-emerald-400" />
            ) : (
              <WifiOff size={20} className="text-slate-400" />
            )}

            <div>

              <p className="font-semibold text-[var(--text)]">

                Status da Integração

              </p>

              <p className="text-sm text-slate-300">

                {conectado
                  ? "Token configurado. Cadastre a URL acima no painel da Clicksign."
                  : "Nenhum token da Clicksign configurado ainda."}

              </p>

            </div>

          </div>

        </div>

      </div>

      {mensagem && (
        <div
          className={`mt-6 rounded-xl px-5 py-3 text-sm ${
            mensagem.tipo === "sucesso"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {mensagem.texto}
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-end gap-3">

        <button
          onClick={testarWebhook}
          disabled={testando}
          className="flex items-center gap-2 rounded-2xl border border-[var(--border-token)] bg-slate-800 px-5 py-3 text-[var(--text)] transition hover:border-emerald-500 disabled:opacity-50"
        >

          <CheckCircle2 size={18} />

          {testando ? "Testando..." : "Testar Webhook"}

        </button>

      </div>

    </div>
  );
}
