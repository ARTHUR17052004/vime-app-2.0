"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  Ban,
  CalendarClock,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  MoreVertical,
  Pencil,
  PenLine,
  RefreshCw,
  Send,
  Trash2,
  TriangleAlert,
  DollarSign,
  Plus,
} from "lucide-react";

import ActionMenu from "../../ui/ActionMenu";
import EmptyState from "../../ui/EmptyState";
import SearchInput from "../../common/SearchInput";
import ResidenciaFiltro from "../../common/ResidenciaFiltro";
import ContratoRelatorios from "../ContratoRelatorios";

import { usePermissao } from "../../../../hooks/usePermissao";
import { formatarProximoVencimento } from "../../../../utils/vencimento";

// Versão mobile da tela de Contratos -- o desktop usa SearchInput +
// ContratoFiltros (pills) + ResidenciaFiltro + ContratoTabs + ContratoTable
// como blocos separados, cada um com seu próprio cartão; no celular isso
// vira cartões empilhados colidindo (abas e pills de status quase do
// mesmo tamanho/cor, tabela cortada de lado). Aqui os mesmos dados (já
// filtrados/ordenados pela página) viram um único cartão de filtros +
// abas em rolagem horizontal + conteúdo em cartão, no estilo do
// DashboardMobile/KitnetsMobile.

const cartao = `
  rounded-2xl
  border
  border-[var(--border-token)]
  bg-[var(--surface)]
  backdrop-blur-xl
`;

const ABAS = [
  { id: "visao-geral", nome: "Visão Geral" },
  { id: "contratos", nome: "Contratos" },
  { id: "vencimentos", nome: "Vencimentos" },
  { id: "relatorios", nome: "Relatórios" },
];

const FILTROS_STATUS = ["Todos", "Ativos", "Pendentes", "Encerrados"];

const STATUS_INFO = {
  ATIVO: { label: "Ativo", cor: "bg-emerald-500/15 text-emerald-400" },
  ASSINADO: { label: "Assinado", cor: "bg-emerald-500/15 text-emerald-400" },
  PENDENTE: { label: "Pendente", cor: "bg-yellow-500/15 text-yellow-400" },
  ENCERRADO: { label: "Encerrado", cor: "bg-[var(--surface-3)] text-[var(--text-muted)]" },
};

export default function ContratosMobile({
  contratos,
  contratosFiltrados,
  totalContratos,
  podeCriar,
  onNovoContrato,
  onEdit,
  onDelete,
  onBaixarPdf,
  onEnviarClicksign,
  onRenovar,
  onEncerrar,
  search,
  onSearchChange,
  residenciaSelecionada,
  onResidenciaChange,
  filtroSelecionado,
  onFiltroChange,
  abaSelecionada,
  onAbaChange,
}) {
  const router = useRouter();

  const ativos = contratosFiltrados.filter((c) => c.status === "ATIVO").length;
  const pendentes = contratosFiltrados.filter((c) => c.status === "PENDENTE").length;
  const encerrados = contratosFiltrados.filter((c) => c.status === "ENCERRADO").length;
  const valorTotal = contratosFiltrados.reduce(
    (total, c) => total + Number(c.valorAluguel || 0),
    0
  );

  const contratosVencendo = contratos
    .filter((c) => c.status === "ATIVO")
    .sort((a, b) => Number(a.diaVencimento) - Number(b.diaVencimento));

  return (
    <div className="space-y-4">

      {/* CABEÇALHO */}

      <section className="flex items-start justify-between gap-3">

        <div className="min-w-0">
          <h1 className="text-[22px] font-extrabold text-[var(--text)]">
            Contratos
          </h1>
          <p className="mt-0.5 text-[12px] text-[var(--text-subtle)]">
            Gerencie todos os contratos do sistema.
          </p>
          <p className="mt-1 text-[11px] font-semibold text-emerald-400">
            {totalContratos} contrato(s) cadastrado(s)
          </p>
        </div>

        {podeCriar && (
          <button
            onClick={onNovoContrato}
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
            Novo
          </button>
        )}

      </section>

      {/* FILTROS */}

      <section className={`${cartao} p-3 space-y-3`}>

        <h2 className="px-0.5 text-[13px] font-bold text-[var(--text)]">
          Filtros
        </h2>

        <SearchInput
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Descrição, inquilino, kitnet..."
          className="h-11"
        />

        <ResidenciaFiltro
          compact
          value={residenciaSelecionada}
          onChange={onResidenciaChange}
        />

        <div className="flex gap-2 overflow-x-auto pb-0.5 -mx-0.5 px-0.5">
          {FILTROS_STATUS.map((filtro) => (
            <button
              key={filtro}
              onClick={() => onFiltroChange(filtro)}
              className={`
                shrink-0
                px-3.5 py-2
                rounded-xl
                text-[12px] font-semibold
                whitespace-nowrap
                transition-all
                ${
                  filtroSelecionado === filtro
                    ? "bg-[var(--surface-2)] text-emerald-400 ring-2 ring-emerald-400/70"
                    : "bg-[var(--surface-2)] text-[var(--text-muted)]"
                }
              `}
            >
              {filtro}
            </button>
          ))}
        </div>

      </section>

      {/* ABAS */}

      <section className="flex gap-2 overflow-x-auto pb-0.5 -mx-0.5 px-0.5">
        {ABAS.map((aba) => (
          <button
            key={aba.id}
            onClick={() => onAbaChange(aba.id)}
            className={`
              shrink-0
              px-4 py-2.5
              rounded-xl
              text-[12px] font-semibold
              whitespace-nowrap
              transition-all
              ${
                abaSelecionada === aba.id
                  ? "bg-[var(--surface-2)] text-emerald-400 ring-2 ring-emerald-400/70 shadow-[0_0_14px_rgba(16,185,129,.35)]"
                  : `${cartao} text-[var(--text-muted)]`
              }
            `}
          >
            {aba.nome}
          </button>
        ))}
      </section>

      {/* CONTEÚDO */}

      {abaSelecionada === "visao-geral" && (

        <section className="space-y-3">

          <div className="grid grid-cols-3 gap-2">

            <StatContrato
              icone={CheckCircle2}
              cor="text-emerald-400 bg-emerald-500/15"
              valor={ativos}
              rotulo="Ativos"
            />

            <StatContrato
              icone={TriangleAlert}
              cor="text-yellow-400 bg-yellow-500/15"
              valor={pendentes}
              rotulo="Pendentes"
            />

            <StatContrato
              icone={FileText}
              cor="text-[var(--text-muted)] bg-[var(--surface-3)]"
              valor={encerrados}
              rotulo="Encerrados"
            />

          </div>

          <div className={`${cartao} p-4 flex items-center justify-between`}>

            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)] font-semibold">
                Valor Total
              </p>
              <p className="mt-1.5 text-[24px] leading-none font-extrabold text-[var(--text)] tabular-nums">
                R$ {valorTotal.toLocaleString("pt-BR")}
              </p>
            </div>

            <div className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20">
              <DollarSign size={22} className="text-emerald-400" />
            </div>

          </div>

        </section>

      )}

      {abaSelecionada === "contratos" && (

        contratosFiltrados.length === 0 ? (

          <EmptyState
            icon={<FileText size={54} />}
            title="Nenhum contrato encontrado"
            description="Ajuste os filtros ou cadastre o primeiro contrato."
          />

        ) : (

          <section className="space-y-2.5">
            {contratosFiltrados.map((contrato) => (
              <ContratoCard
                key={contrato.id}
                contrato={contrato}
                onEdit={onEdit}
                onDelete={onDelete}
                onBaixarPdf={onBaixarPdf}
                onEnviarClicksign={onEnviarClicksign}
                onRenovar={onRenovar}
                onEncerrar={onEncerrar}
                onAbrir={() => router.push(`/contratos/${contrato.id}`)}
              />
            ))}
          </section>

        )

      )}

      {abaSelecionada === "vencimentos" && (

        contratosVencendo.length === 0 ? (

          <EmptyState
            icon={<CalendarClock size={54} />}
            title="Nenhum contrato ativo"
            description="Não há vencimentos para mostrar no momento."
          />

        ) : (

          <section className="space-y-2.5">
            {contratosVencendo.map((contrato) => (
              <div
                key={contrato.id}
                onClick={() => router.push(`/contratos/${contrato.id}`)}
                className={`${cartao} p-3.5 flex items-center justify-between gap-3 active:scale-[0.99] transition cursor-pointer`}
              >
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-[var(--text)] truncate">
                    {contrato.inquilino?.nome || contrato.inquilinoNome || "-"}
                  </p>
                  <p className="mt-0.5 text-[12px] text-[var(--text-subtle)] truncate">
                    {contrato.unidade?.nome || contrato.unidadeNome || "-"}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[14px] font-bold text-emerald-400 tabular-nums">
                    R$ {Number(contrato.valorAluguel || 0).toLocaleString("pt-BR")}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--text-subtle)]">
                    Dia {contrato.diaVencimento}
                  </p>
                </div>
              </div>
            ))}
          </section>

        )

      )}

      {abaSelecionada === "relatorios" && (
        <ContratoRelatorios contratos={contratos} />
      )}

    </div>
  );
}

function StatContrato({ icone: Icone, cor, valor, rotulo }) {
  return (
    <div className={`${cartao} p-2.5`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${cor}`}>
        <Icone size={15} />
      </div>
      <p className="mt-2 text-[16px] leading-none font-extrabold text-[var(--text)] tabular-nums">
        {valor}
      </p>
      <p className="mt-1 text-[10px] text-[var(--text-faint)] truncate">
        {rotulo}
      </p>
    </div>
  );
}

function ContratoCard({
  contrato,
  onEdit,
  onDelete,
  onBaixarPdf,
  onEnviarClicksign,
  onRenovar,
  onEncerrar,
  onAbrir,
}) {
  const podeEditar = usePermissao("contratos.editar");
  const podeExcluir = usePermissao("contratos.excluir");

  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  function abrirMenu(e) {
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const larguraMenu = 224;

    let left = rect.right - larguraMenu;
    let top = rect.bottom + 8;

    if (left + larguraMenu > window.innerWidth - 16) {
      left = window.innerWidth - larguraMenu - 16;
    }
    if (left < 16) left = 16;

    setPosition({ top, left });
    setOpen(true);
  }

  const status = STATUS_INFO[contrato.status] || {
    label: contrato.status,
    cor: "bg-[var(--surface-3)] text-[var(--text-muted)]",
  };

  return (
    <div
      onClick={onAbrir}
      className={`${cartao} p-3.5 active:scale-[0.99] transition cursor-pointer`}
    >

      <div className="flex items-start justify-between gap-2">

        <div className="min-w-0">
          <p className="text-[15px] font-bold text-[var(--text)] truncate">
            {contrato.inquilino?.nome || contrato.inquilinoNome || "-"}
          </p>
          <p className="mt-0.5 text-[12px] text-[var(--text-subtle)] truncate">
            {(contrato.unidade?.nome || contrato.unidadeNome || "-")}
            {" · "}
            {(contrato.kitnet?.nome || contrato.kitnetNome || "-")}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">

          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${status.cor}`}>
            {status.label}
          </span>

          <button
            onClick={(e) => {
              if (open) {
                e.stopPropagation();
                setOpen(false);
                return;
              }
              abrirMenu(e);
            }}
            className="
              flex items-center justify-center
              w-9 h-9
              rounded-xl
              bg-[var(--surface-2)]
              border border-[var(--border-token)]
            "
          >
            <MoreVertical size={16} className="text-[var(--text-muted)]" />
          </button>

        </div>

      </div>

      <div className="mt-3 flex items-center gap-4 text-[12px] text-[var(--text-muted)]">
        <span>R$ {Number(contrato.valorAluguel || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
        <span>{formatarProximoVencimento(contrato.diaVencimento)}</span>
      </div>

      <ActionMenu open={open} position={position} onClose={() => setOpen(false)}>

        <MenuItem icon={<Eye size={17} />} label="Visualizar" onClick={onAbrir} onCloseMenu={() => setOpen(false)} />

        <MenuItem
          icon={<Download size={17} />}
          label="Baixar PDF"
          cor="text-emerald-400 hover:bg-emerald-500/10"
          onClick={() => onBaixarPdf?.(contrato.id)}
          onCloseMenu={() => setOpen(false)}
        />

        {podeEditar && !contrato.clicksignEnvelopeId && (
          <MenuItem
            icon={<Send size={17} />}
            label="Enviar à Clicksign"
            cor="text-sky-400 hover:bg-sky-500/10"
            onClick={() => onEnviarClicksign?.(contrato.id)}
            onCloseMenu={() => setOpen(false)}
          />
        )}

        {contrato.clicksignSigningUrl && (
          <a
            href={contrato.clicksignSigningUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            className="flex items-center gap-3 px-5 py-3 text-sky-400 hover:bg-sky-500/10 transition"
          >
            <PenLine size={17} />
            Assinar na Clicksign
          </a>
        )}

        {podeEditar && (
          <MenuItem
            icon={<RefreshCw size={17} />}
            label="Renovar"
            cor="text-emerald-400 hover:bg-emerald-500/10"
            onClick={() => onRenovar?.(contrato.id)}
            onCloseMenu={() => setOpen(false)}
          />
        )}

        {podeEditar && contrato.status === "ATIVO" && (
          <MenuItem
            icon={<Ban size={17} />}
            label="Encerrar Contrato"
            cor="text-orange-400 hover:bg-orange-500/10"
            onClick={() => onEncerrar?.(contrato.id)}
            onCloseMenu={() => setOpen(false)}
          />
        )}

        {podeEditar && (
          <MenuItem
            icon={<Pencil size={17} />}
            label="Editar"
            cor="text-yellow-400 hover:bg-yellow-500/10"
            onClick={() => onEdit?.(contrato)}
            onCloseMenu={() => setOpen(false)}
          />
        )}

        {podeExcluir && (
          <MenuItem
            icon={<Trash2 size={17} />}
            label="Excluir"
            cor="text-red-400 hover:bg-red-500/10"
            onClick={() => onDelete?.(contrato.id)}
            onCloseMenu={() => setOpen(false)}
          />
        )}

      </ActionMenu>

    </div>
  );
}

function MenuItem({ icon, label, cor = "text-[var(--text-1)] hover:bg-[var(--surface-2)]", onClick, onCloseMenu }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onCloseMenu?.();
        onClick?.();
      }}
      className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-all ${cor}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
