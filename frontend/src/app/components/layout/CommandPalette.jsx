"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from "lucide-react";

import menuConfig from "../../config/menuConfig";
import { BuscaService } from "../../../services/busca.service";

const paginas = menuConfig.flatMap((secao) =>
  secao.items.map((item) => ({
    tipo: "PÁGINA",
    label: "Página",
    titulo: item.label,
    subtitulo: secao.title,
    href: item.href,
    icon: item.icon,
  }))
);

export default function CommandPalette() {
  const [aberto, setAberto] = useState(false);
  const [query, setQuery] = useState("");
  const [resultadosDados, setResultadosDados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [ativo, setAtivo] = useState(0);

  const inputRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    function abrir() {
      setAberto(true);
    }

    function aoTeclarGlobal(e) {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const combo = isMac ? e.metaKey : e.ctrlKey;

      if (combo && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setAberto((v) => !v);
      }
    }

    window.addEventListener("abrir-busca-universal", abrir);
    document.addEventListener("keydown", aoTeclarGlobal);

    return () => {
      window.removeEventListener("abrir-busca-universal", abrir);
      document.removeEventListener("keydown", aoTeclarGlobal);
    };
  }, []);

  useEffect(() => {
    if (aberto) {
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      setQuery("");
      setResultadosDados([]);
      setAtivo(0);
    }
  }, [aberto]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResultadosDados([]);
      return;
    }

    setCarregando(true);

    const timer = setTimeout(async () => {
      try {
        const resposta = await BuscaService.buscar(query.trim());
        setResultadosDados(resposta.data || []);
      } catch (err) {
        console.error("Erro na busca universal:", err);
        setResultadosDados([]);
      } finally {
        setCarregando(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const paginasFiltradas = useMemo(() => {
    const termo = query.trim().toLowerCase();

    if (!termo) return paginas.slice(0, 6);

    return paginas.filter(
      (p) =>
        p.titulo.toLowerCase().includes(termo) ||
        p.subtitulo.toLowerCase().includes(termo)
    );
  }, [query]);

  const todosResultados = useMemo(
    () => [...paginasFiltradas, ...resultadosDados],
    [paginasFiltradas, resultadosDados]
  );

  function navegarPara(item) {
    setAberto(false);
    router.push(item.href);
  }

  function aoTeclarInput(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAtivo((v) => Math.min(v + 1, todosResultados.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAtivo((v) => Math.max(v - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = todosResultados[ativo];
      if (item) navegarPara(item);
    } else if (e.key === "Escape") {
      setAberto(false);
    }
  }

  if (!aberto) return null;

  return (
    <div
      onClick={() => setAberto(false)}
      className="
        fixed
        inset-0

        z-[999]

        flex
        items-start
        justify-center

        bg-black/60
        backdrop-blur-md

        pt-[12vh]
        px-4

        animate-in
        fade-in
        duration-200
      "
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          relative

          w-full
          max-w-2xl

          max-h-[70vh]

          overflow-hidden

          rounded-[26px]

          border
          border-white/[0.07]

          bg-gradient-to-br
          from-[#202a36]/97
          via-[#1b2430]/98
          to-[#151c25]/98

          backdrop-blur-3xl

          shadow-[0_30px_80px_rgba(0,0,0,.5)]

          flex
          flex-col

          animate-in
          zoom-in-95
          fade-in
          duration-200
        "
      >
        <div
          className="
            flex
            items-center
            gap-3

            px-6
            h-16

            border-b
            border-white/5

            shrink-0
          "
        >
          <Search size={18} className="text-gray-400 shrink-0" />

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setAtivo(0);
            }}
            onKeyDown={aoTeclarInput}
            placeholder="Buscar páginas, locadores, inquilinos, contratos..."
            className="
              flex-1

              bg-transparent

              outline-none

              text-[15px]

              text-white

              placeholder:text-gray-500
            "
          />

          <kbd
            className="
              shrink-0

              rounded-md

              border
              border-white/10

              bg-white/5

              px-2
              py-1

              text-[11px]

              text-gray-400
            "
          >
            Esc
          </kbd>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {paginasFiltradas.length > 0 && (
            <div className="px-3 py-2">
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                Páginas
              </p>

              {paginasFiltradas.map((item, i) => (
                <ResultRow
                  key={`pagina-${item.href}`}
                  item={item}
                  ativo={i === ativo}
                  onHover={() => setAtivo(i)}
                  onClick={() => navegarPara(item)}
                />
              ))}
            </div>
          )}

          {query.trim().length >= 2 && (
            <div className="px-3 py-2">
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                {carregando ? "Buscando..." : "Resultados"}
              </p>

              {!carregando && resultadosDados.length === 0 && (
                <p className="px-3 py-3 text-sm text-gray-500">
                  Nenhum resultado encontrado para "{query}".
                </p>
              )}

              {resultadosDados.map((item, i) => {
                const indexGlobal = paginasFiltradas.length + i;

                return (
                  <ResultRow
                    key={`${item.tipo}-${item.id}`}
                    item={item}
                    ativo={indexGlobal === ativo}
                    onHover={() => setAtivo(indexGlobal)}
                    onClick={() => navegarPara(item)}
                  />
                );
              })}
            </div>
          )}

          {query.trim().length < 2 && paginasFiltradas.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-gray-500">
              Digite para buscar em todo o sistema.
            </p>
          )}
        </div>

        <div
          className="
            flex
            items-center
            gap-4

            px-6
            h-11

            border-t
            border-white/5

            text-[11px]
            text-gray-500

            shrink-0
          "
        >
          <span className="flex items-center gap-1.5">
            <ArrowUp size={12} />
            <ArrowDown size={12} />
            navegar
          </span>

          <span className="flex items-center gap-1.5">
            <CornerDownLeft size={12} />
            abrir
          </span>
        </div>
      </div>
    </div>
  );
}

function ResultRow({ item, ativo, onHover, onClick }) {
  const Icon = item.icon;

  return (
    <button
      onMouseEnter={onHover}
      onClick={onClick}
      className={`
        w-full

        flex
        items-center
        gap-3

        rounded-xl

        px-3
        py-2.5

        text-left

        transition-colors

        ${ativo ? "bg-emerald-500/10" : "hover:bg-white/5"}
      `}
    >
      <div
        className={`
          flex
          items-center
          justify-center

          w-9
          h-9

          rounded-lg

          shrink-0

          ${ativo ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-gray-400"}
        `}
      >
        {Icon ? <Icon size={16} /> : <Search size={14} />}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">
          {item.titulo}
        </p>

        {item.subtitulo && (
          <p className="truncate text-xs text-gray-500">
            {item.subtitulo}
          </p>
        )}
      </div>

      <span
        className="
          shrink-0

          rounded-md

          bg-white/5

          px-2
          py-1

          text-[10px]
          font-semibold
          uppercase
          tracking-wide

          text-gray-400
        "
      >
        {item.label}
      </span>
    </button>
  );
}
