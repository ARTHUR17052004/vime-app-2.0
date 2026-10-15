"use client";

import { useEffect, useRef, useState } from "react";

// Select com busca por texto -- pra listas longas (ex.: inquilinos)
// onde rolar uma lista fixa pra achar um nome é lento. `opcoes` é
// [{ value, label }]; funciona como um <select> normal por fora
// (value/onChange), só a exibição que muda.
export default function SeletorBusca({
  opcoes = [],
  value,
  onChange,
  placeholder = "Buscar...",
  className = "",
  disabled = false,
  required = false,
}) {

  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const ref = useRef(null);

  const selecionada = opcoes.find((o) => o.value === value);

  useEffect(() => {

    function aoClicarFora(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setAberto(false);
        setBusca("");
      }
    }

    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);

  }, []);

  const filtradas = busca
    ? opcoes.filter((o) => o.label.toLowerCase().includes(busca.toLowerCase()))
    : opcoes;

  return (

    <div ref={ref} className="relative">

      <input
        type="text"
        disabled={disabled}
        required={required && !value}
        value={aberto ? busca : (selecionada?.label || "")}
        onChange={(e) => {
          setBusca(e.target.value);
          setAberto(true);
        }}
        onFocus={() => {
          setBusca("");
          setAberto(true);
        }}
        placeholder={disabled ? placeholder : (selecionada?.label || placeholder)}
        className={className}
        autoComplete="off"
      />

      {aberto && !disabled && (

        <div
          className="
            absolute z-20 mt-1 w-full max-h-60 overflow-y-auto
            rounded-xl border border-[var(--border-token)]
            bg-[#1d2833] shadow-xl
          "
        >

          {filtradas.length === 0 && (
            <p className="px-4 py-3 text-sm text-[var(--text-faint)]">
              Nada encontrado.
            </p>
          )}

          {filtradas.map((opcao) => (
            <button
              type="button"
              key={opcao.value}
              onClick={() => {
                onChange(opcao.value);
                setAberto(false);
                setBusca("");
              }}
              className="
                block w-full text-left px-4 py-2.5 text-sm text-white
                hover:bg-emerald-600/20 transition
              "
            >
              {opcao.label}
            </button>
          ))}

        </div>

      )}

    </div>

  );

}
