"use client";

import { useEffect, useState } from "react";
import { Building2, ChevronDown, Check } from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import { LocadorService } from "../../../services/locadores.service";
import { locadorFiltroAtual, definirLocadorFiltro } from "../../../utils/locadorFiltro";

// Só pra quem enxerga todo mundo (sem locador fixo no cadastro) e tem
// perfil Gerência ou Operador -- Diretoria e os demais continuam vendo
// exatamente o que já era mostrado pra eles, sem esse seletor (ver
// authMiddleware.js, que é quem de fato aplica o filtro no servidor).
const PERFIS_COM_SELETOR = ["GERENCIA", "OPERADOR"];

export default function LocadorFiltroSeletor({ compacto = false }) {

  const { usuario } = useAuth();

  const [locadores, setLocadores] = useState([]);
  const [selecionado, setSelecionado] = useState(() => locadorFiltroAtual());
  const [aberto, setAberto] = useState(false);

  const habilitado =
    !usuario?.locadorId &&
    PERFIS_COM_SELETOR.includes((usuario?.perfil || "").trim().toUpperCase());

  useEffect(() => {
    if (!habilitado) return;

    LocadorService.listarOpcoes()
      .then((resposta) => setLocadores(resposta.data || []))
      .catch(() => {});
  }, [habilitado]);

  if (!habilitado) return null;

  function escolher(id) {
    definirLocadorFiltro(id);
    setAberto(false);
    // Várias telas buscam os dados delas de jeitos diferentes -- recarregar
    // garante que tudo (dashboard, listas, filtros) já nasce com o locador
    // novo, em vez de precisar ensinar cada hook a reagir a essa troca.
    window.location.reload();
  }

  const nomeAtual =
    locadores.find((l) => l.id === selecionado)?.nome.split(" ")[0] || "Todos";

  return (
    <div className="relative">

      {compacto ? (
        <button
          onClick={() => setAberto((v) => !v)}
          aria-label={`Locador de trabalho: ${nomeAtual}`}
          className="
            relative
            w-10 h-10
            rounded-full
            border border-[var(--border-token)]
            bg-[var(--surface-2)]
            flex items-center justify-center
          "
        >
          <Building2 size={18} className="text-emerald-400" />
          {selecionado && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[var(--surface)]" />
          )}
        </button>
      ) : (
        <button
          onClick={() => setAberto((v) => !v)}
          className="
            flex items-center gap-2
            h-10 px-3.5
            rounded-full
            border border-[var(--border-token)]
            bg-[var(--surface-2)]
            hover:bg-[var(--surface-3)]
            transition
            text-sm
          "
        >
          <Building2 size={16} className="text-emerald-400 shrink-0" />
          <span className="hidden sm:inline text-[var(--text-subtle)]">Locador:</span>
          <span className="font-semibold text-[var(--text)] max-w-[110px] truncate">{nomeAtual}</span>
          <ChevronDown size={14} className="text-[var(--text-faint)] shrink-0" />
        </button>
      )}

      {aberto && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setAberto(false)} />

          <div
            className="
              absolute right-0 top-full mt-2 z-50
              w-56
              rounded-2xl
              border border-[var(--border-token)]
              bg-[var(--surface)]
              backdrop-blur-xl
              shadow-2xl
              p-1.5
            "
          >
            <Opcao
              label="Todos"
              ativo={!selecionado}
              onClick={() => escolher("")}
            />

            {locadores.map((l) => (
              <Opcao
                key={l.id}
                label={l.nome}
                ativo={selecionado === l.id}
                onClick={() => escolher(l.id)}
              />
            ))}
          </div>
        </>
      )}

    </div>
  );

}

function Opcao({ label, ativo, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        w-full flex items-center justify-between gap-2
        px-3 py-2.5
        rounded-xl
        text-left text-sm
        text-[var(--text)]
        hover:bg-[var(--surface-2)]
        transition
      "
    >
      <span className="truncate">{label}</span>
      {ativo && <Check size={15} className="text-emerald-400 shrink-0" />}
    </button>
  );
}
