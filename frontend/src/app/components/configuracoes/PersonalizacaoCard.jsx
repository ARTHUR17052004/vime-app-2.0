"use client";

import { Wand2 } from "lucide-react";

export default function PersonalizacaoCard({
  dados = {},
  onChange = () => {},
  onSalvar = () => {},
  salvando = false,
  podeEditar = true,
}) {
  return (
    <div className="rounded-3xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl shadow-xl p-6">

      <div className="flex items-center gap-3 mb-8">

        <div className="w-12 h-12 rounded-2xl bg-pink-500/20 flex items-center justify-center">

          <Wand2
            size={24}
            className="text-pink-400"
          />

        </div>

        <div>

          <h2 className="text-xl font-semibold text-[var(--text)]">

            Personalização

          </h2>

          <p className="text-sm text-[var(--text-subtle)]">

            Customize a identidade visual do sistema.

          </p>

        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-5">

        <div>

          <label className="text-sm text-[var(--text-muted)]">

            Nome do Sistema

          </label>

          <input
            value={dados.nomeSistema || ""}
            onChange={(e) => onChange("nomeSistema", e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-3 text-[var(--text)]"
            placeholder="VIME APP 2.0"
          />

        </div>

        <div>

          <label className="text-sm text-[var(--text-muted)]">

            Nome da Empresa

          </label>

          <input
            value={dados.nomeEmpresa || ""}
            onChange={(e) => onChange("nomeEmpresa", e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-3 text-[var(--text)]"
            placeholder="Minha Imobiliária"
          />

        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-5 mt-5">

        <div>

          <label className="text-sm text-[var(--text-muted)]">

            Texto da Tela de Login

          </label>

          <input
            value={dados.textoLogin || ""}
            onChange={(e) => onChange("textoLogin", e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-3 text-[var(--text)]"
            placeholder="Bem-vindo ao VIME APP"
          />

        </div>

        <div>

          <label className="text-sm text-[var(--text-muted)]">

            Texto do Rodapé

          </label>

          <input
            value={dados.textoRodape || ""}
            onChange={(e) => onChange("textoRodape", e.target.value)}
            className="mt-2 w-full rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-3 text-[var(--text)]"
            placeholder="© VIME APP 2026"
          />

        </div>

      </div>

      <div className="mt-5">

        <label className="text-sm text-[var(--text-muted)]">

          Mensagem de Boas-vindas

        </label>

        <textarea
          value={dados.mensagemBoasVindas || ""}
          onChange={(e) => onChange("mensagemBoasVindas", e.target.value)}
          rows={4}
          className="mt-2 w-full rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-3 text-[var(--text)] resize-none"
          placeholder="Escreva uma mensagem para aparecer na tela inicial..."
        />

      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-500/5 p-5">

        <h3 className="text-[var(--text)] font-semibold">

          Pré-visualização

        </h3>

        <p className="text-sm text-[var(--text-subtle)] mt-2">

          {dados.nomeSistema || "VIME APP 2.0"}

        </p>

        <p className="text-xs text-[var(--text-faint)] mt-1">

          {dados.mensagemBoasVindas || "Bem-vindo ao sistema de gestão imobiliária."}

        </p>

      </div>

      {podeEditar && (
        <button
          onClick={onSalvar}
          disabled={salvando}
          className="
            mt-8 rounded-xl bg-emerald-600 hover:bg-emerald-700
            disabled:opacity-50 disabled:cursor-not-allowed
            transition px-6 py-3 text-[var(--text)]
          "
        >

          {salvando ? "Salvando..." : "Salvar Personalização"}

        </button>
      )}

    </div>
  );
}
