"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function KitnetStep({
  formData,
  handleChange,
  kitnets,
}) {

  const inputStyle =
    "w-full border border-[var(--border-token)] rounded-xl p-3 text-[var(--text)] bg-[var(--surface-2)] backdrop-blur placeholder:text-[var(--text-subtle)] focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState(false);
  const [posicao, setPosicao] = useState({ top: 0, left: 0, width: 0 });

  const inputRef = useRef(null);
  const listaRef = useRef(null);

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

  function atualizarPosicao() {

    const el = inputRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();

    setPosicao({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });

  }

  // O input fica dentro do Modal, que tem overflow-y-auto pra rolar o
  // conteúdo -- se a lista fosse filha normal dele, ficaria cortada nas
  // bordas do card. Por isso ela é portada pro body (fixed, medida a
  // partir do próprio input), igual ao ActionMenu já faz pros menus de
  // ação das tabelas.
  useLayoutEffect(() => {

    if (!aberto) return;

    atualizarPosicao();

    window.addEventListener("scroll", atualizarPosicao, true);
    window.addEventListener("resize", atualizarPosicao);

    return () => {
      window.removeEventListener("scroll", atualizarPosicao, true);
      window.removeEventListener("resize", atualizarPosicao);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  useEffect(() => {

    function fecharAoClicarFora(e) {

      if (
        inputRef.current && inputRef.current.contains(e.target)
      ) {
        return;
      }

      if (
        listaRef.current && listaRef.current.contains(e.target)
      ) {
        return;
      }

      setAberto(false);

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

      <div>

        <label className="block text-sm font-medium text-[var(--text-subtle)] mb-2">

          Kitnet
          <span className="ml-1 text-red-400">*</span>

        </label>

        <input
          ref={inputRef}
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
          onKeyDown={(e) => {
            // Um <input> de texto sozinho nesta etapa deixa o Enter
            // submeter o formulário inteiro por engano (submissão
            // implícita do HTML) -- aqui ele só escolhe o primeiro
            // resultado da busca, nunca envia o form.
            if (e.key !== "Enter") return;

            e.preventDefault();

            if (aberto && kitnetsFiltradas.length > 0) {
              selecionar(kitnetsFiltradas[0]);
            }
          }}
          placeholder="Digite pra buscar uma kitnet..."
          className={inputStyle}
        />

      </div>

      {aberto && typeof window !== "undefined" && createPortal(

        <div
          ref={listaRef}
          style={{
            position: "fixed",
            top: posicao.top,
            left: posicao.left,
            width: posicao.width,
            maxHeight: `min(24rem, calc(100vh - ${posicao.top + 16}px))`,
            zIndex: 9999999,
          }}
          className="
            overflow-y-auto
            rounded-xl border border-[var(--border-token)]
            bg-[var(--surface)] backdrop-blur-3xl
            shadow-2xl shadow-black/60
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

        </div>,

        document.body

      )}

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
