"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function KitnetStep({
  formData,
  handleChange,
  kitnets,
}) {

  const inputStyle =
    "w-full border border-[var(--border-token)] rounded-xl p-3 text-[var(--text)] bg-[var(--surface-2)] backdrop-blur placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState(false);

  const containerRef = useRef(null);

  const rotulo = (kitnet) =>
    `${kitnet.unidade?.nome || kitnet.unidadeNome || ""} • ${kitnet.nome ? `${kitnet.nome} • ` : ""}Nº ${kitnet.numero}`;

  const kitnetsDisponiveis = useMemo(() => {

    return kitnets
      .filter((kitnet) => {

        if (String(kitnet.id) === String(formData.kitnetId)) {
          return true;
        }

        return kitnet.status !== "Ocupada";

      })
      .sort((a, b) =>
        String(a.numero).localeCompare(String(b.numero), undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );

  }, [kitnets, formData.kitnetId]);

  const kitnetsFiltradas = useMemo(() => {

    const termo = busca.trim().toLowerCase();

    if (!termo) return kitnetsDisponiveis;

    return kitnetsDisponiveis.filter((kitnet) =>
      rotulo(kitnet).toLowerCase().includes(termo)
    );

  }, [kitnetsDisponiveis, busca]);

  const kitnetSelecionada = kitnetsDisponiveis.find(
    (kitnet) => String(kitnet.id) === String(formData.kitnetId)
  );

  useEffect(() => {

    function fecharAoClicarFora(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setAberto(false);
      }
    }

    document.addEventListener("mousedown", fecharAoClicarFora);

    return () => document.removeEventListener("mousedown", fecharAoClicarFora);

  }, []);

  function selecionar(kitnet) {

    handleChange({ target: { name: "kitnetId", value: kitnet.id } });

    setBusca("");
    setAberto(false);

  }

  return (

    <div className="grid gap-6">

      <div ref={containerRef} className="relative">

        <label className="block text-sm font-medium text-[var(--text-subtle)] mb-2">

          Kitnet
          <span className="ml-1 text-red-400">*</span>

        </label>

        <input
          type="text"
          value={aberto ? busca : kitnetSelecionada ? rotulo(kitnetSelecionada) : ""}
          onChange={(e) => {
            setBusca(e.target.value);
            if (!aberto) setAberto(true);
          }}
          onFocus={() => {
            setBusca("");
            setAberto(true);
          }}
          placeholder="Digite pra buscar uma kitnet..."
          className={inputStyle}
        />

        {aberto && (

          <div
            className="
              absolute z-20 mt-2 w-full max-h-64 overflow-y-auto
              rounded-xl border border-[var(--border-token)]
              bg-[var(--surface-2)] shadow-xl
            "
          >

            {kitnetsFiltradas.length === 0 ? (

              <p className="px-4 py-3 text-sm text-[var(--text-subtle)]">
                Nenhuma kitnet encontrada.
              </p>

            ) : (

              kitnetsFiltradas.map((kitnet) => (

                <button
                  key={kitnet.id}
                  type="button"
                  onClick={() => selecionar(kitnet)}
                  className={`
                    w-full text-left px-4 py-3 text-sm transition-colors
                    hover:bg-emerald-500/10
                    ${
                      String(kitnet.id) === String(formData.kitnetId)
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "text-[var(--text)]"
                    }
                  `}
                >
                  {rotulo(kitnet)}
                </button>

              ))

            )}

          </div>

        )}

      </div>

      {formData.kitnetId && (

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">

          <p className="font-semibold text-emerald-400">

            Vinculação automática

          </p>

          <p className="mt-2 text-sm text-emerald-300/80">

            Ao concluir o cadastro, esta kitnet será vinculada ao inquilino e seu status será atualizado automaticamente para <strong>Ocupada</strong>.

          </p>

        </div>

      )}

    </div>

  );

}
