"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

// Remove acento pra "jose" achar "José" -- nomes de inquilino vêm
// cheios de acento e o funcionário não vai digitar todos certinho.
const normalizar = (texto) =>
  (texto || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

// Select de busca: parece um <select> normal fechado, mas ao digitar
// filtra as opções na hora -- pra listas grandes (inquilinos, por
// exemplo) onde rolar no dropdown nativo é lento.
export default function SelectBusca({
  value,
  onChange,
  options, // [{ id, label }]
  placeholder = "Selecione...",
  disabled = false,
  required = false,
  className = "",
}) {

  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");

  const fecharComAtraso = useRef(null);

  const selecionada = options.find((o) => String(o.id) === String(value));

  const filtradas = busca
    ? options.filter((o) => normalizar(o.label).includes(normalizar(busca)))
    : options;

  const valorExibido = aberto ? busca : (selecionada?.label || "");

  const abrir = () => {
    if (disabled) return;
    setBusca("");
    setAberto(true);
  };

  const escolher = (opcao) => {
    onChange?.(opcao.id);
    setBusca("");
    setAberto(false);
  };

  const fechar = () => {
    // Atraso pra dar tempo do clique na opção (abaixo) registrar antes
    // da lista sumir -- sem isso o blur fecha primeiro e o clique
    // nunca chega a acontecer.
    fecharComAtraso.current = setTimeout(() => setAberto(false), 150);
  };

  return (
    <div className="relative">

      <input
        type="text"
        value={valorExibido}
        onChange={(e) => setBusca(e.target.value)}
        onFocus={abrir}
        onBlur={fechar}
        placeholder={placeholder}
        disabled={disabled}
        required={required && !value}
        autoComplete="off"
        className={`
          border border-[var(--border-token)] bg-[var(--surface-2)]
          text-[var(--text)] rounded-xl p-3 w-full pr-9
          disabled:cursor-not-allowed disabled:opacity-60
          ${className}
        `}
      />

      <ChevronDown
        size={16}
        className="
          pointer-events-none absolute right-3 top-1/2 -translate-y-1/2
          text-[var(--text-faint)]
        "
      />

      {aberto && !disabled && (
        <div
          className="
            absolute z-30 mt-1 w-full max-h-64 overflow-y-auto
            rounded-xl border border-[var(--border-token)]
            bg-[var(--surface)] backdrop-blur-xl shadow-xl
          "
        >
          {filtradas.length === 0 && (
            <p className="px-4 py-3 text-sm text-[var(--text-faint)]">
              Nada encontrado.
            </p>
          )}

          {filtradas.map((opcao) => (
            <button
              key={opcao.id}
              type="button"
              onClick={() => escolher(opcao)}
              className={`
                block w-full text-left px-4 py-2.5 text-sm
                hover:bg-[var(--surface-3)] transition
                ${String(opcao.id) === String(value)
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "text-[var(--text)]"}
              `}
            >
              {opcao.label}
            </button>
          ))}

        </div>
      )}

    </div>
  );

}
