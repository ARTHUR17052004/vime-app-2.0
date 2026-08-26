"use client";

import { useEffect, useState } from "react";

import {
  Link2,
  ShieldCheck,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  Wifi,
  WifiOff,
} from "lucide-react";

import { ConfiguracaoService } from "@/services/configuracao.service";
import { ClicksignService } from "@/services/clicksign.service";

export default function TokenCard() {
  const [mostrarToken, setMostrarToken] = useState(false);

  const [configuracaoId, setConfiguracaoId] = useState(null);

  const [dados, setDados] = useState({
    ambiente: "sandbox",
    apiKey: "",
    templateKey: "",
  });

  const [statusApi, setStatusApi] = useState({ configurado: false, online: false });

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [testando, setTestando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  async function carregar() {
    setCarregando(true);

    try {
      const [resposta, statusResposta] = await Promise.all([
        ConfiguracaoService.listar(),
        ClicksignService.status(),
      ]);

      const lista = Array.isArray(resposta) ? resposta : resposta.data || [];
      const configuracao = lista[0];

      if (configuracao) {
        setConfiguracaoId(configuracao.id);
        setDados({
          ambiente: configuracao.clicksignAmbiente || "sandbox",
          apiKey: configuracao.clicksignToken || "",
          templateKey: configuracao.clicksignTemplateKey || "",
        });
      }

      setStatusApi(statusResposta?.data || statusResposta);
    } catch (err) {
      console.error("Erro ao carregar configuração da Clicksign:", err);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
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
        clicksignAmbiente: dados.ambiente,
        clicksignToken: dados.apiKey || null,
        clicksignTemplateKey: dados.templateKey || null,
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

      const statusResposta = await ClicksignService.status();
      setStatusApi(statusResposta?.data || statusResposta);
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
      const resposta = await ClicksignService.testarConexao();
      const info = resposta.data || resposta;

      setMensagem({
        tipo: resposta.success ? "sucesso" : "erro",
        texto: info.mensagem || resposta.message || "Teste concluído.",
      });
    } catch (err) {
      setMensagem({
        tipo: "erro",
        texto: err.message || "Não foi possível conectar à Clicksign.",
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

          <Link2
            size={24}
            className="text-emerald-400"
          />

        </div>

        <div>

          <h2 className="text-2xl font-bold text-[var(--text)]">

            Integração Clicksign

          </h2>

          <p className="text-slate-400">

            Gerencie as credenciais e acompanhe o status da conexão.

          </p>

        </div>

      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-8">

        <div
          className={`rounded-2xl border p-4 ${
            conectado
              ? "border-emerald-500/20 bg-emerald-500/10"
              : "border-[var(--border-token)] bg-[var(--surface-2)]"
          }`}
        >

          <div className="flex items-center gap-2">

            {conectado ? (
              <Wifi size={18} className="text-emerald-400" />
            ) : (
              <WifiOff size={18} className="text-slate-400" />
            )}

            <span className="font-medium text-[var(--text)]">

              {carregando
                ? "Carregando..."
                : conectado
                ? "Token configurado"
                : "Não configurado"}

            </span>

          </div>

        </div>

        <div className="rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-4">

          <span className="text-slate-400 text-sm">

            Ambiente

          </span>

          <p className="mt-1 text-[var(--text)] font-semibold capitalize">

            {dados.ambiente}

          </p>

        </div>

      </div>

      <div className="space-y-5">

        <div>

          <label className="mb-2 block text-sm text-slate-300">

            Ambiente

          </label>

          <select
            value={dados.ambiente}
            onChange={(e) => alterar("ambiente", e.target.value)}
            disabled={carregando}
            className="w-full rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-3 text-[var(--text)] outline-none"
          >
            <option value="sandbox">Sandbox</option>
            <option value="producao">Produção</option>
          </select>

        </div>

        <div>

          <label className="mb-2 block text-sm text-slate-300">

            Token da API

          </label>

          <div className="flex">

            <input
              type={mostrarToken ? "text" : "password"}
              value={dados.apiKey}
              onChange={(e) => alterar("apiKey", e.target.value)}
              disabled={carregando}
              placeholder="Token de acesso da Clicksign"
              className="flex-1 rounded-l-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-3 text-[var(--text)] outline-none"
            />

            <button
              onClick={() => setMostrarToken(!mostrarToken)}
              className="rounded-r-2xl border-y border-r border-[var(--border-token)] bg-slate-700 px-4 hover:bg-slate-600"
            >
              {mostrarToken ? <EyeOff size={18} className="text-[var(--text)]" /> : <Eye size={18} className="text-[var(--text)]" />}
            </button>

          </div>

        </div>

        <div>

          <label className="mb-2 block text-sm text-slate-300">

            Chave do Modelo de Contrato (Clicksign)

          </label>

          <input
            value={dados.templateKey}
            onChange={(e) => alterar("templateKey", e.target.value)}
            disabled={carregando}
            placeholder="Ex: 39f9f558-b0ba-4020-968e-9488c673dc67"
            className="w-full rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-3 text-[var(--text)] outline-none"
          />

          <p className="mt-2 text-xs text-slate-400">
            Código do modelo cadastrado em Modelos na Clicksign, usado para gerar o contrato automaticamente com os dados de cada locação.
          </p>

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
          onClick={testarConexao}
          disabled={testando || carregando}
          className="flex items-center gap-2 rounded-2xl border border-[var(--border-token)] bg-slate-800 px-5 py-3 text-[var(--text)] hover:border-emerald-500 transition disabled:opacity-50"
        >
          <RefreshCw size={18} className={testando ? "animate-spin" : ""} />
          {testando ? "Testando..." : "Testar Conexão"}
        </button>

        <button
          onClick={salvar}
          disabled={salvando || carregando}
          className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-[var(--text)] hover:bg-emerald-700 transition disabled:opacity-50"
        >
          <Save size={18} />
          {salvando ? "Salvando..." : "Salvar"}
        </button>

      </div>

      <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">

        <div className="flex items-center gap-3">

          <ShieldCheck
            size={22}
            className="text-blue-400"
          />

          <div>

            <p className="font-medium text-[var(--text)]">

              Integração segura

            </p>

            <p className="text-sm text-slate-300">

              As credenciais são armazenadas no banco e usadas somente para comunicação com a API da Clicksign. Sem token, o sistema opera em modo mock.

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}
