"use client";

import { useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock,
  MoreVertical,
  Pencil,
  Pin,
  Plus,
  TriangleAlert,
  User,
  XCircle,
} from "lucide-react";

import ResidenciaFiltro from "../../common/ResidenciaFiltro";
import SearchInput from "../../common/SearchInput";
import ActionMenu from "../../ui/ActionMenu";
import EmptyState from "../../ui/EmptyState";
import VistoriaRealizadasTable from "../VistoriaRealizadasTable";
import { usePermissao } from "../../../../hooks/usePermissao";
import { formatDate } from "@/utils/formatDate";

// Versão mobile da tela de Vistorias -- o desktop usa VistoriaCard (feito
// pra tela larga, com os botões de ação todos em linha), que no celular
// virava a mesma estrutura espremida em 400px. Mesmo padrão visual de
// KitnetsMobile/InquilinosMobile: cabeçalho, indicadores, filtro, cartões.
//
// Cabeçalho/indicadores/filtro ficam sempre visíveis, mesmo na aba
// Realizadas -- antes a página trocava o componente inteiro (vistorias/
// page.js) e sumia com o seletor de aba, sem nenhum jeito de voltar pra
// Visão Geral a não ser saindo da tela (bug relatado em 19/11/2026).
// Só a LISTA de baixo muda: card próprio pras abas "ao vivo", ou
// VistoriaRealizadasTable (que já tem sua própria versão mobile) pra
// Realizadas.

const cartao = `
  rounded-2xl
  border
  border-[var(--border-token)]
  bg-[var(--surface)]
  backdrop-blur-xl
`;

// Mesma regra de VistoriaCard.jsx -- categoria "Cobrança" é a única
// gerada automaticamente pelo corte de água/energia por atraso, e o
// alerta vermelho só faz sentido enquanto ainda está aberta.
const STATUS_ENCERRADOS_CORTE = ["REALIZADA", "CANCELADA"];
const ehVistoriaDeCorte = (vistoria) =>
  vistoria.categoria === "Cobrança" &&
  !STATUS_ENCERRADOS_CORTE.includes(vistoria.status);

const STATUS_INFO = {
  REALIZADA: { label: "Realizada", cor: "bg-emerald-500/15 text-emerald-400" },
  PENDENTE: { label: "Pendente", cor: "bg-yellow-500/15 text-yellow-400" },
  CANCELADA: { label: "Cancelada", cor: "bg-red-500/15 text-red-400" },
  ATRASADA: { label: "Atrasada", cor: "bg-red-500/15 text-red-400" },
  PROGRAMADA: { label: "Programada", cor: "bg-sky-500/15 text-sky-400" },
};

export default function VistoriasMobile({
  vistorias,
  totalVistorias,
  programadas,
  realizadasHoje,
  atrasadas,
  podeCriar,
  onNovaVistoria,
  onEdit,
  onDelete,
  onConcluir,
  onCancelar,
  onFixar,
  onVerMissoes,
  residenciaSelecionada,
  onResidenciaChange,
  abaSelecionada,
  onAbaChange,
  ordenacao,
  onOrdenacaoChange,
  search,
  onSearchChange,
  missoesRealizadas,
  carregandoMissoes,
  filtroVistoriaId,
  onLimparFiltro,
  onRecarregarVistorias,
  onRecarregarMissoes,
}) {
  return (
    <div className="space-y-4">

      {/* Voltar -- só dentro de Realizadas, que é uma "sub-tela" dentro
          de Vistorias (lista bem diferente das outras abas). Chama a
          mesma troca de aba de sempre (onAbaChange), então também conta
          como navegação de verdade pro botão "voltar" do navegador. */}

      {abaSelecionada === "realizadas" && (
        <button
          onClick={() => onAbaChange?.("visao-geral")}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-emerald-400"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
      )}

      {/* CABEÇALHO */}

      <section className="flex items-start justify-between gap-3">

        <div className="min-w-0">
          <h1 className="text-[22px] font-extrabold text-[var(--text)]">
            Vistorias
          </h1>
          <p className="mt-0.5 text-[12px] text-[var(--text-subtle)]">
            Gerencie todas as vistorias cadastradas.
          </p>
          <p className="mt-1 text-[11px] font-semibold text-emerald-400">
            {totalVistorias} vistoria(s) cadastrada(s)
          </p>
        </div>

        {podeCriar && (
          <button
            onClick={onNovaVistoria}
            className="
              shrink-0
              flex items-center gap-1.5
              rounded-xl
              bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-500
              border border-emerald-400/30
              px-3.5 py-2.5
              text-[12px] font-semibold text-white
              active:scale-95
              transition
            "
          >
            <Plus size={15} />
            Nova
          </button>
        )}

      </section>

      {/* BUSCA -- mesmo SearchInput do desktop (PageHeader), só que
          fora dele aqui (mobile não usa PageHeader). */}

      <SearchInput
        placeholder="Pesquisar vistoria..."
        value={search}
        onChange={(e) => onSearchChange?.(e.target.value)}
      />

      {/* INDICADORES */}

      <section className="grid grid-cols-2 gap-2">

        <StatVistoria
          ativo={abaSelecionada === "visao-geral"}
          onClick={() => onAbaChange?.("visao-geral")}
          icone={ClipboardList}
          cor="text-[var(--text)] bg-[var(--surface-3)]"
          valor={totalVistorias}
          rotulo="Total"
        />

        <StatVistoria
          ativo={abaSelecionada === "agendadas"}
          onClick={() => onAbaChange?.("agendadas")}
          icone={CalendarClock}
          cor="text-sky-400 bg-sky-500/15"
          valor={programadas}
          rotulo="Programadas"
        />

        <StatVistoria
          ativo={abaSelecionada === "realizadas"}
          onClick={() => onAbaChange?.("realizadas")}
          icone={CheckCircle2}
          cor="text-emerald-400 bg-emerald-500/15"
          valor={realizadasHoje}
          rotulo="Realizadas hoje"
        />

        <StatVistoria
          ativo={abaSelecionada === "atrasadas"}
          onClick={() => onAbaChange?.("atrasadas")}
          icone={TriangleAlert}
          cor="text-red-400 bg-red-500/15"
          valor={atrasadas}
          rotulo="Atrasadas"
        />

      </section>

      {/* FILTROS */}

      <section className={`${cartao} p-3 space-y-2`}>

        <ResidenciaFiltro
          compact
          value={residenciaSelecionada}
          onChange={onResidenciaChange}
        />

        <div className="grid grid-cols-2 gap-2">

          <select
            value={abaSelecionada}
            onChange={(e) => onAbaChange?.(e.target.value)}
            className="
              rounded-xl
              border border-[var(--border-token)]
              bg-[var(--surface-2)]
              text-[var(--text)]
              px-3 py-2.5
              text-[12px]
            "
          >
            <option value="visao-geral" className="bg-[#1b2430]">Visão geral</option>
            <option value="agendadas" className="bg-[#1b2430]">Agendadas</option>
            <option value="realizadas" className="bg-[#1b2430]">Realizadas</option>
            <option value="pendentes" className="bg-[#1b2430]">Pendentes</option>
            <option value="atrasadas" className="bg-[#1b2430]">Atrasadas</option>
          </select>

          <select
            value={ordenacao}
            onChange={(e) => onOrdenacaoChange(e.target.value)}
            className="
              rounded-xl
              border border-[var(--border-token)]
              bg-[var(--surface-2)]
              text-[var(--text)]
              px-3 py-2.5
              text-[12px]
            "
          >
            <option value="data-proxima" className="bg-[#1b2430]">Data (mais próxima)</option>
            <option value="data-distante" className="bg-[#1b2430]">Data (mais distante)</option>
            <option value="titulo-asc" className="bg-[#1b2430]">Título (A-Z)</option>
            <option value="responsavel-asc" className="bg-[#1b2430]">Responsável</option>
            <option value="residencia-asc" className="bg-[#1b2430]">Residência</option>
          </select>

        </div>

      </section>

      {/* LISTA */}

      {abaSelecionada === "realizadas" ? (

        <VistoriaRealizadasTable
          vistorias={vistorias}
          missoesRealizadas={missoesRealizadas}
          carregandoMissoes={carregandoMissoes}
          filtroVistoriaId={filtroVistoriaId}
          onLimparFiltro={onLimparFiltro}
          onRecarregarVistorias={onRecarregarVistorias}
          onRecarregarMissoes={onRecarregarMissoes}
        />

      ) : vistorias.length === 0 ? (

        <EmptyState
          compact
          icon={<ClipboardList size={26} />}
          title="Nenhuma vistoria encontrada"
          description="Ajuste os filtros ou cadastre sua primeira vistoria."
        />

      ) : (

        <section className="space-y-2.5">

          {vistorias.map((vistoria) => {

            const corte = ehVistoriaDeCorte(vistoria);

            const status = STATUS_INFO[vistoria.status] || {
              label: vistoria.status,
              cor: "bg-[var(--surface-3)] text-[var(--text-muted)]",
            };

            return (

              <div
                key={vistoria.id}
                className={`${cartao} p-3.5 ${corte ? "corte-alerta-piscando" : ""}`}
              >

                <div className="flex items-start justify-between gap-2">

                  <div className="min-w-0 flex items-center gap-1.5">

                    {vistoria.fixado && (
                      <Pin size={13} className="shrink-0 text-emerald-400 fill-emerald-400" />
                    )}

                    <div className="min-w-0">
                      <p className={`text-[15px] font-bold truncate ${corte ? "text-red-400" : "text-[var(--text)]"}`}>
                        {corte ? "⚠️ " : ""}{vistoria.nomeVistoria}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-[12px] text-[var(--text-subtle)] truncate">
                        <Building2 size={12} className="shrink-0" />
                        {vistoria.unidadeNome}
                        {vistoria.kitnetNome && ` · ${vistoria.kitnetNome}`}
                      </p>
                    </div>

                  </div>

                  <div className="flex items-center gap-2 shrink-0">

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${status.cor}`}>
                      {status.label}
                    </span>

                    <VistoriaActionsMenuMobile
                      vistoria={vistoria}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onConcluir={onConcluir}
                      onCancelar={onCancelar}
                      onFixar={onFixar}
                    />

                  </div>

                </div>

                {vistoria.descricao && (
                  <p className={`mt-2 text-[12px] ${corte ? "text-red-300" : "text-[var(--text-muted)]"}`}>
                    {vistoria.descricao}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-[var(--text-muted)]">

                  <span className="flex items-center gap-1.5">
                    <User size={13} className="text-[var(--text-faint)]" />
                    {vistoria.responsavel || "-"}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-[var(--text-faint)]" />
                    {vistoria.dataProxima ? formatDate(vistoria.dataProxima) : "-"}
                  </span>

                </div>

                {vistoria.progressoMissoes && (
                  <button
                    onClick={() => onVerMissoes?.(vistoria.id)}
                    className="
                      mt-3
                      w-full
                      text-center
                      text-[11px]
                      font-semibold
                      text-emerald-400
                      bg-emerald-500/10
                      border
                      border-emerald-500/30
                      rounded-xl
                      py-2
                    "
                  >
                    {vistoria.progressoMissoes.concluidas}/{vistoria.progressoMissoes.total} VIMEs já vistoriadas
                  </button>
                )}

              </div>

            );

          })}

        </section>

      )}

    </div>
  );
}

function StatVistoria({ icone: Icone, cor, valor, rotulo, ativo, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        ${cartao} p-2.5 text-left transition
        ${ativo ? "border-emerald-400/70 ring-1 ring-emerald-400/70" : ""}
      `}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cor}`}>
        <Icone size={15} />
      </div>
      <p className="mt-2 text-[16px] leading-none font-extrabold text-[var(--text)] tabular-nums">
        {valor}
      </p>
      <p className="mt-1 text-[10px] text-[var(--text-faint)] truncate">
        {rotulo}
      </p>
    </button>
  );
}

function VistoriaActionsMenuMobile({ vistoria, onEdit, onDelete, onConcluir, onCancelar, onFixar }) {

  const podeEditar = usePermissao("vistorias.editar");
  const podeExcluir = usePermissao("vistorias.excluir");

  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  function abrirMenu(e) {

    const rect = e.currentTarget.getBoundingClientRect();
    const largura = 200;

    let left = rect.right - largura;
    const top = rect.bottom + 8;

    if (left + largura > window.innerWidth - 16) {
      left = window.innerWidth - largura - 16;
    }

    if (left < 16) left = 16;

    setPosition({ top, left });
    setOpen(true);

  }

  return (

    <div className="relative">

      <button
        onClick={(e) => {
          e.stopPropagation();
          if (open) { setOpen(false); return; }
          abrirMenu(e);
        }}
        className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--surface-2)] transition"
      >
        <MoreVertical size={18} className="text-[var(--text-subtle)]" />
      </button>

      <ActionMenu open={open} position={position} onClose={() => setOpen(false)}>

        <Link
          href={`/vistorias/${vistoria.id}`}
          className="block px-4 py-3 text-[var(--text-muted)] hover:bg-[var(--surface-2)] transition"
          onClick={() => setOpen(false)}
        >
          Visualizar
        </Link>

        {podeEditar && (
          <button
            onClick={() => { onFixar?.(vistoria.id, !vistoria.fixado); setOpen(false); }}
            className="w-full flex items-center gap-2 text-left px-4 py-3 text-[var(--text-muted)] hover:bg-[var(--surface-2)] transition"
          >
            <Pin size={15} className={vistoria.fixado ? "fill-emerald-400 text-emerald-400" : ""} />
            {vistoria.fixado ? "Desafixar" : "Fixar"}
          </button>
        )}

        {podeEditar && (
          <button
            onClick={() => { onEdit?.(vistoria); setOpen(false); }}
            className="w-full flex items-center gap-2 text-left px-4 py-3 text-yellow-400 hover:bg-yellow-500/10 transition"
          >
            <Pencil size={15} />
            Editar
          </button>
        )}

        {podeEditar && (
          <button
            onClick={() => { onConcluir?.(vistoria.id); setOpen(false); }}
            className="w-full flex items-center gap-2 text-left px-4 py-3 text-emerald-400 hover:bg-emerald-500/10 transition"
          >
            <CheckCircle2 size={15} />
            Realizar
          </button>
        )}

        {podeEditar && (
          <button
            onClick={() => { onCancelar?.(vistoria.id); setOpen(false); }}
            className="w-full flex items-center gap-2 text-left px-4 py-3 text-orange-400 hover:bg-orange-500/10 transition"
          >
            <XCircle size={15} />
            Cancelar
          </button>
        )}

        {podeExcluir && (
          <button
            onClick={() => { onDelete?.(vistoria.id); setOpen(false); }}
            className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 transition"
          >
            Excluir
          </button>
        )}

      </ActionMenu>

    </div>

  );

}
