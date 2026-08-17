"use client";

import { Palette, Moon, Sun, Monitor } from "lucide-react";

const TEMAS = [
  { valor: "claro", label: "Claro", icon: Sun, color: "text-yellow-400" },
  { valor: "escuro", label: "Escuro", icon: Moon, color: "text-emerald-400" },
  { valor: "automatico", label: "Automático", icon: Monitor, color: "text-cyan-400" },
];

export default function TemaCard({
  dados = {},
  onChange = () => {},
  onSalvar = () => {},
  salvando = false,
}) {
  return (
    <div className="rounded-3xl border border-[var(--border-token)] bg-[var(--surface)] backdrop-blur-xl shadow-xl p-6">

      <div className="flex items-center gap-3 mb-8">

        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">

          <Palette
            size={24}
            className="text-purple-400"
          />

        </div>

        <div>

          <h2 className="text-xl font-semibold text-[var(--text)]">

            Tema do Sistema

          </h2>

          <p className="text-sm text-[var(--text-subtle)]">

            Escolha a aparência do VIME APP.

          </p>

        </div>

      </div>

      <div className="grid md:grid-cols-3 gap-5">

        {TEMAS.map((tema) => {

          const Icon = tema.icon;
          const ativo = (dados.tema || "claro") === tema.valor;

          return (

            <button
              key={tema.valor}
              type="button"
              onClick={() => onChange("tema", tema.valor)}
              className={`
                rounded-2xl border p-6 transition-all
                ${
                  ativo
                    ? "border-emerald-500 bg-[var(--surface)]"
                    : "border-[var(--border-token)] bg-[var(--surface)] hover:border-emerald-500/40"
                }
              `}
            >

              <Icon
                size={34}
                className={`mx-auto ${tema.color}`}
              />

              <p className="mt-4 text-[var(--text)] font-medium">

                {tema.label}

              </p>

            </button>

          );

        })}

      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-5">

        <div>

          <label className="text-sm text-[var(--text-muted)]">

            Cor Principal

          </label>

          <input
            type="color"
            value={dados.corPrimaria || "#10b981"}
            onChange={(e) => onChange("corPrimaria", e.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-[var(--border-token)] bg-transparent cursor-pointer"
          />

        </div>

        <div>

          <label className="text-sm text-[var(--text-muted)]">

            Cor Secundária

          </label>

          <input
            type="color"
            value={dados.corSecundaria || "#1e293b"}
            onChange={(e) => onChange("corSecundaria", e.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-[var(--border-token)] bg-transparent cursor-pointer"
          />

        </div>

      </div>

      <button
        onClick={onSalvar}
        disabled={salvando}
        className="
          mt-8 rounded-xl bg-emerald-600 hover:bg-emerald-700
          disabled:opacity-50 disabled:cursor-not-allowed
          transition px-6 py-3 text-[var(--text)]
        "
      >

        {salvando ? "Salvando..." : "Salvar Tema"}

      </button>

    </div>
  );
}
