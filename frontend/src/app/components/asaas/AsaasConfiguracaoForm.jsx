"use client";

import { useEffect, useState } from "react";

import { ConfiguracaoService } from "@/services/configuracao.service";
import { AsaasService } from "@/services/asaas.service";

export default function AsaasConfiguracaoForm() {
  const [mostrarApi, setMostrarApi] = useState(false);

  const [configuracaoId, setConfiguracaoId] = useState(null);

  const [dados, setDados] = useState({
    ambiente: "sandbox",
    walletId: "",
    apiKey: "",
    taxaAdministracao: "",
    webhookToken: "",
  });

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [testando, setTestando] = useState(false);
  const [buscandoWallet, setBuscandoWallet] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  useEffect(() => {
    async function carregar() {
      try {
        const resposta = await ConfiguracaoService.listar();
        const lista = Array.isArray(resposta) ? resposta : resposta.data || [];
        const configuracao = lista[0];

        if (configuracao) {
          setConfiguracaoId(configuracao.id);
          setDados({
            ambiente: configuracao.asaasAmbiente || "sandbox",
            walletId: configuracao.asaasWalletId || "",
            apiKey: configuracao.asaasToken || "",
            taxaAdministracao: configuracao.asaasTaxaAdministracao ?? "",
            webhookToken: configuracao.asaasWebhookToken || "",
          });
        }
      } catch (err) {
        console.error("Erro ao carregar configuração do Asaas:", err);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  function alterar(campo, valor) {
    setDados((old) => ({ ...old, [campo]: valor }));
    setMensagem(null);
  }

  async function salvar() {
    setSalvando(true);
    setMensagem(null);

    try {
      const payload = {
        asaasAmbiente: dados.ambiente,
        asaasWalletId: dados.walletId || null,
        asaasToken: dados.apiKey || null,
        asaasTaxaAdministracao: dados.taxaAdministracao
          ? Number(dados.taxaAdministracao)
          : 0,
        asaasWebhookToken: dados.webhookToken || null,
      };

      if (configuracaoId) {
        await ConfiguracaoService.atualizar(configuracaoId, payload);
      } else {
        const resposta = await ConfiguracaoService.criar({
          empresa: "Minha Empresa",
          ...payload,
        });
        setConfiguracaoId((resposta?.data || resposta)?.id);
      }

      setMensagem({ tipo: "sucesso", texto: "Configuração salva com sucesso." });
    } catch (err) {
      setMensagem({
        tipo: "erro",
        texto: err.message || "Erro ao salvar configuração.",
      });
    } finally {
      setSalvando(false);
    }
  }

  async function testarConexao() {
    setTestando(true);
    setMensagem(null);

    try {
      const resposta = await AsaasService.testarConexao();
      const info = resposta.data || resposta;

      setMensagem({
        tipo: "sucesso",
        texto: info.mensagem || "Conexão realizada com sucesso.",
      });
    } catch (err) {
      setMensagem({
        tipo: "erro",
        texto: err.message || "Não foi possível conectar ao Asaas.",
      });
    } finally {
      setTestando(false);
    }
  }

  async function buscarWallet() {
    setBuscandoWallet(true);
    setMensagem(null);

    try {
      const resposta = await AsaasService.buscarWallet();
      const info = resposta.data || resposta;

      if (info.walletId) {
        setDados((old) => ({ ...old, walletId: info.walletId }));
      }

      setMensagem({
        tipo: "sucesso",
        texto: `Wallet encontrada: ${info.walletId}`,
      });
    } catch (err) {
      setMensagem({
        tipo: "erro",
        texto: err.message || "Não foi possível buscar a wallet.",
      });
    } finally {
      setBuscandoWallet(false);
    }
  }

  return (
    <div className="bg-[var(--surface)] backdrop-blur-[24px] rounded-2xl border border-[var(--border-token)]">

      <div className="px-8 py-6 border-b border-[var(--border-token)]">
        <h2 className="text-2xl font-bold text-[var(--text)]">
          Configuração da Integração
        </h2>

        <p className="text-[var(--text-subtle)] mt-2">
          Configure sua conta Asaas para utilização no VIME.
        </p>
      </div>

      <div className="p-8 grid md:grid-cols-2 gap-6">

        <div>
          <label className="block text-sm font-semibold text-[var(--text-1)] mb-2">
            Ambiente
          </label>

          <select
            value={dados.ambiente}
            onChange={(e) => alterar("ambiente", e.target.value)}
            disabled={carregando}
            className="w-full border border-[var(--border-token)] rounded-xl p-3 bg-[var(--surface-2)] text-[var(--text)]"
          >
            <option value="sandbox">Sandbox</option>
            <option value="producao">Produção</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--text-1)] mb-2">
            Wallet ID
          </label>

          <input
            value={dados.walletId}
            onChange={(e) => alterar("walletId", e.target.value)}
            disabled={carregando}
            className="w-full border border-[var(--border-token)] rounded-xl p-3 bg-[var(--surface-2)] text-[var(--text)]"
            placeholder="Wallet do proprietário"
          />
        </div>

        <div className="md:col-span-2">

          <label className="block text-sm font-semibold text-[var(--text-1)] mb-2">
            API Key
          </label>

          <div className="flex gap-3">

            <input
              type={mostrarApi ? "text" : "password"}
              value={dados.apiKey}
              onChange={(e) => alterar("apiKey", e.target.value)}
              disabled={carregando}
              className="flex-1 border border-[var(--border-token)] rounded-xl p-3 bg-[var(--surface-2)] text-[var(--text)]"
              placeholder="$aact_prod..."
            />

            <button
              onClick={() =>
                setMostrarApi(!mostrarApi)
              }
              className="px-5 rounded-xl border border-[var(--border-token)] text-[var(--text-1)] hover:bg-[var(--surface-2)]"
            >
              {mostrarApi ? "Ocultar" : "Mostrar"}
            </button>

          </div>

        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--text-1)] mb-2">
            Taxa Administrativa (%)
          </label>

          <input
            value={dados.taxaAdministracao}
            onChange={(e) => alterar("taxaAdministracao", e.target.value)}
            disabled={carregando}
            className="w-full border border-[var(--border-token)] rounded-xl p-3 bg-[var(--surface-2)] text-[var(--text)]"
            placeholder="10"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-[var(--text-1)] mb-2">
            Token do Webhook
          </label>

          <input
            value={dados.webhookToken}
            onChange={(e) => alterar("webhookToken", e.target.value)}
            disabled={carregando}
            className="w-full border border-[var(--border-token)] rounded-xl p-3 bg-[var(--surface-2)] text-[var(--text)]"
            placeholder="Gerado na aba Webhook (ou cole aqui um token próprio)"
          />
        </div>

      </div>

      {mensagem && (
        <div className="px-8">
          <div
            className={`rounded-xl px-5 py-3 text-sm ${
              mensagem.tipo === "sucesso"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {mensagem.texto}
          </div>
        </div>
      )}

      <div className="border-t border-[var(--border-token)] px-8 py-6 flex flex-wrap gap-4">

        <button
          onClick={testarConexao}
          disabled={testando || carregando}
          className="
          bg-blue-600
          hover:bg-blue-700
          disabled:opacity-50
          text-[var(--text)]
          px-6
          py-3
          rounded-xl
          "
        >
          {testando ? "Testando..." : "Testar Conexão"}
        </button>

        <button
          onClick={buscarWallet}
          disabled={buscandoWallet || carregando}
          className="
          bg-purple-600
          hover:bg-purple-700
          disabled:opacity-50
          text-[var(--text)]
          px-6
          py-3
          rounded-xl
          "
        >
          {buscandoWallet ? "Buscando..." : "Buscar Wallet"}
        </button>

        <button
          onClick={salvar}
          disabled={salvando || carregando}
          className="
          bg-green-700
          hover:bg-green-800
          disabled:opacity-50
          text-[var(--text)]
          px-6
          py-3
          rounded-xl
          ml-auto
          "
        >
          {salvando ? "Salvando..." : "Salvar Configuração"}
        </button>

      </div>

    </div>
  );
}
