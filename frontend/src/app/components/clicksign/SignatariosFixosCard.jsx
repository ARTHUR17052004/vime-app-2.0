"use client";

import { useEffect, useState } from "react";

import {
  UserCheck,
  Plus,
  Trash2,
  Mail,
  Phone,
} from "lucide-react";

import { SignatarioFixoService } from "@/services/signatarioFixo.service";

const SIGN_AS_OPCOES = [
  { value: "sign", label: "Assinar" },
  { value: "party", label: "Parte" },
  { value: "witness", label: "Testemunha" },
  { value: "intervening", label: "Interveniente" },
];

const NOVO_PADRAO = {
  nome: "",
  email: "",
  telefone: "",
  signAs: "sign",
};

export default function SignatariosFixosCard() {
  const [lista, setLista] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [novo, setNovo] = useState(NOVO_PADRAO);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  async function carregar() {
    setCarregando(true);
    try {
      const resposta = await SignatarioFixoService.listar();
      setLista(resposta.data || resposta || []);
    } catch (err) {
      console.error("Erro ao carregar signatários fixos:", err);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function adicionar() {
    if (!novo.nome || !novo.email) {
      setMensagem({ tipo: "erro", texto: "Nome e e-mail são obrigatórios." });
      return;
    }

    setSalvando(true);
    setMensagem(null);

    try {
      await SignatarioFixoService.criar(novo);
      setNovo(NOVO_PADRAO);
      setMensagem({ tipo: "sucesso", texto: "Signatário fixo adicionado." });
      await carregar();
    } catch (err) {
      setMensagem({ tipo: "erro", texto: err.message || "Erro ao adicionar signatário." });
    } finally {
      setSalvando(false);
    }
  }

  async function alternarAtivo(signatario) {
    try {
      await SignatarioFixoService.atualizar(signatario.id, { ativo: !signatario.ativo });
      await carregar();
    } catch (err) {
      setMensagem({ tipo: "erro", texto: err.message || "Erro ao atualizar signatário." });
    }
  }

  async function remover(id) {
    if (!confirm("Remover este signatário fixo? Ele deixará de entrar automaticamente nos próximos contratos.")) {
      return;
    }

    try {
      await SignatarioFixoService.excluir(id);
      await carregar();
    } catch (err) {
      setMensagem({ tipo: "erro", texto: err.message || "Erro ao remover signatário." });
    }
  }

  return (
    <div className="rounded-3xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl p-6 shadow-xl">

      <div className="flex items-center gap-3 mb-6">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
          <UserCheck size={24} className="text-emerald-400" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[var(--text)]">
            Signatários Fixos
          </h2>

          <p className="text-slate-400">
            Entram automaticamente em todo contrato novo, além do inquilino.
          </p>
        </div>

      </div>

      {carregando ? (
        <p className="text-center text-slate-400 py-6">Carregando...</p>
      ) : lista.length === 0 ? (
        <p className="text-center text-slate-500 py-6">
          Nenhum signatário fixo cadastrado ainda. Adicione abaixo.
        </p>
      ) : (
        <div className="space-y-3 mb-6">
          {lista.map((signatario) => (
            <div
              key={signatario.id}
              className={`rounded-2xl border p-4 flex items-center justify-between gap-4 transition ${
                signatario.ativo
                  ? "border-[var(--border-token)] bg-[var(--surface-2)]"
                  : "border-[var(--border-token)] bg-[var(--surface-2)] opacity-50"
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                  {signatario.nome.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-[var(--text)] truncate">
                    {signatario.nome}
                    <span className="ml-2 rounded-full bg-[var(--surface-3)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                      {SIGN_AS_OPCOES.find((o) => o.value === signatario.signAs)?.label || signatario.signAs}
                    </span>
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Mail size={13} /> {signatario.email}
                    </span>
                    {signatario.telefone && (
                      <span className="flex items-center gap-1.5">
                        <Phone size={13} /> {signatario.telefone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={signatario.ativo}
                    onChange={() => alternarAtivo(signatario)}
                    className="scale-110"
                  />
                  Ativo
                </label>

                <button
                  onClick={() => remover(signatario.id)}
                  title="Remover"
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-token)] text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-5">

        <p className="mb-4 text-sm font-medium text-slate-300">
          Adicionar novo signatário fixo
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={novo.nome}
            onChange={(e) => setNovo((old) => ({ ...old, nome: e.target.value }))}
            placeholder="Nome completo"
            className="rounded-xl border border-[var(--border-token)] bg-[var(--surface)] p-3 text-[var(--text)] outline-none"
          />

          <input
            value={novo.email}
            onChange={(e) => setNovo((old) => ({ ...old, email: e.target.value }))}
            placeholder="E-mail"
            type="email"
            className="rounded-xl border border-[var(--border-token)] bg-[var(--surface)] p-3 text-[var(--text)] outline-none"
          />

          <input
            value={novo.telefone}
            onChange={(e) => setNovo((old) => ({ ...old, telefone: e.target.value }))}
            placeholder="Telefone (opcional)"
            className="rounded-xl border border-[var(--border-token)] bg-[var(--surface)] p-3 text-[var(--text)] outline-none"
          />

          <select
            value={novo.signAs}
            onChange={(e) => setNovo((old) => ({ ...old, signAs: e.target.value }))}
            className="rounded-xl border border-[var(--border-token)] bg-[var(--surface)] p-3 text-[var(--text)] outline-none"
          >
            {SIGN_AS_OPCOES.map((opcao) => (
              <option key={opcao.value} value={opcao.value}>
                {opcao.label}
              </option>
            ))}
          </select>
        </div>

        {mensagem && (
          <div
            className={`mt-4 rounded-xl px-4 py-2.5 text-sm ${
              mensagem.tipo === "sucesso"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {mensagem.texto}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={adicionar}
            disabled={salvando}
            className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-[var(--text)] hover:bg-emerald-700 transition disabled:opacity-50"
          >
            <Plus size={18} />
            {salvando ? "Adicionando..." : "Adicionar"}
          </button>
        </div>

      </div>

    </div>
  );
}
