"use client";

import {
  Mail,
  ShieldCheck,
} from "lucide-react";

export default function SMTPCard({
  dados = {},
  onChange = () => {},
  onSalvar = () => {},
  salvando = false,
  podeEditar = true,
}) {
  return (
    <div id="secao-smtp" className="rounded-3xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl shadow-xl p-6">

      <div className="flex items-center gap-3 mb-8">

        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">

          <Mail
            size={24}
            className="text-blue-400"
          />

        </div>

        <div>

          <h2 className="text-xl font-semibold text-[var(--text)]">

            Configuração SMTP

          </h2>

          <p className="text-sm text-[var(--text-subtle)]">

            Configure o servidor responsável pelo envio de e-mails.

          </p>

        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-5">

        <div>

          <label className="text-sm text-[var(--text-muted)]">

            Servidor SMTP

          </label>

          <input
            value={dados.smtpHost || ""}
            onChange={(e) => onChange("smtpHost", e.target.value)}
            placeholder="smtp.gmail.com"
            className="mt-2 w-full rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-3 text-[var(--text)]"
          />

        </div>

        <div>

          <label className="text-sm text-[var(--text-muted)]">

            Porta

          </label>

          <input
            type="number"
            value={dados.smtpPorta || ""}
            onChange={(e) => onChange("smtpPorta", e.target.value)}
            placeholder="587"
            className="mt-2 w-full rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-3 text-[var(--text)]"
          />

        </div>

        <div>

          <label className="text-sm text-[var(--text-muted)]">

            E-mail

          </label>

          <input
            value={dados.smtpUsuario || ""}
            onChange={(e) => onChange("smtpUsuario", e.target.value)}
            placeholder="contato@empresa.com"
            className="mt-2 w-full rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-3 text-[var(--text)]"
          />

        </div>

        <div>

          <label className="text-sm text-[var(--text-muted)]">

            Senha

          </label>

          <input
            type="password"
            value={dados.smtpSenha || ""}
            onChange={(e) => onChange("smtpSenha", e.target.value)}
            placeholder="********"
            className="mt-2 w-full rounded-2xl border border-[var(--border-token)] bg-[var(--surface-2)] p-3 text-[var(--text)]"
          />

        </div>

      </div>

      {podeEditar && (
        <button
          onClick={onSalvar}
          disabled={salvando}
          className="
            mt-8 rounded-xl bg-emerald-600 hover:bg-emerald-700
            disabled:opacity-50 disabled:cursor-not-allowed
            transition px-6 py-3 text-[var(--text)] flex items-center gap-2
          "
        >

          <ShieldCheck size={18} />

          {salvando ? "Salvando..." : "Salvar"}

        </button>
      )}

    </div>
  );
}
