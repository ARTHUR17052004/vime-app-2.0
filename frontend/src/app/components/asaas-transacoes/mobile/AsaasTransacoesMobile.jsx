"use client";

import { useState } from "react";

import {
  Ban,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Info,
  MoreVertical,
  Repeat,
  Send,
  TriangleAlert,
} from "lucide-react";

import ActionMenu from "../../ui/ActionMenu";
import Badge from "../../ui/Badge";
import EmptyState from "../../ui/EmptyState";
import SearchInput from "../../common/SearchInput";
import AsaasExportar from "../AsaasExportar";

import { statusExibidoReceita, demonstrativoReceita } from "@/utils/statusReceita";

// Versão mobile de Transações -- painel de acompanhamento, só pra
// olhar (Visualizar/Detalhes). Lançar, editar e enviar ao banco
// (inclusive em lote) é tudo feito no Financeiro agora.

const cartao = `
  rounded-2xl
  border
  border-[var(--border-token)]
  bg-[var(--surface)]
  backdrop-blur-xl
`;

const RESUMO = [
  { chave: "PAGA", titulo: "Recebido", cor: "bg-emerald-500" },
  { chave: "PENDENTE", titulo: "Pendente", cor: "bg-yellow-500" },
  { chave: "ATRASADA", titulo: "Atrasado", cor: "bg-red-600" },
  { chave: "CANCELADA", titulo: "Cancelado", cor: "bg-[var(--surface-3)]" },
];

const FILTROS_STATUS = ["Todos", "Recebido", "Pendente", "Atrasado", "Cancelado"];
const FILTROS_FORMA = ["Todas", "PIX", "Boleto", "Cartão"];
const FILTROS_ENVIADO = ["Todos", "Enviadas", "Não enviadas"];

const ICONE_POR_TIPO = {
  aguardando: Clock,
  enviada: Send,
  atrasada: TriangleAlert,
  paga: CheckCircle2,
  cancelada: Ban,
};

const COR_POR_TIPO = {
  aguardando: "text-yellow-400",
  enviada: "text-sky-400",
  atrasada: "text-red-400",
  paga: "text-emerald-400",
  cancelada: "text-[var(--text-faint)]",
};

function formatarValor(valor) {
  return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function somarPorStatus(transacoes, status) {
  return transacoes
    .filter((item) => item.status === status)
    .reduce((total, item) => total + Number(item.valor || 0), 0);
}

export default function AsaasTransacoesMobile({
  transacoes,
  totalTransacoes,
  loading,
  podeCriar,
  podeExportar,
  onNovaCobranca,
  onVisualizar,
  onDetalhes,
  locadores,
  locadorFiltro,
  onLocadorChange,
  filtros,
  onFiltroChange,
  onAplicarFiltros,
  onLimparFiltros,
}) {

  return (
    <div className="space-y-4">

      {/* CABEÇALHO */}

      <section className="flex items-start justify-between gap-3">

        <div className="min-w-0">
          <h1 className="text-[22px] font-extrabold text-[var(--text)]">
            Transações
          </h1>
          <p className="mt-0.5 text-[12px] leading-snug text-[var(--text-subtle)]">
            Acompanhe o que está acontecendo com cada cobrança -- lançar e enviar ao banco é no Financeiro.
          </p>
          <p className="mt-1 text-[11px] font-semibold text-emerald-400">
            {totalTransacoes} cobrança(s)
          </p>
        </div>

        {podeCriar && (
          <button
            onClick={onNovaCobranca}
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
            Nova
          </button>
        )}

      </section>

      {/* LOCADOR */}

      <section className={`${cartao} p-3`}>
        <label className="block text-[11px] text-[var(--text-faint)] mb-1.5">
          Selecione o locador
        </label>
        <select
          value={locadorFiltro}
          onChange={(e) => onLocadorChange(e.target.value)}
          className="w-full h-11 rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] px-3 text-[13px]"
        >
          <option value="" className="bg-[#1b2430]">Todos os locadores</option>
          {locadores.map((locador) => (
            <option key={locador.id} value={locador.id} className="bg-[#1b2430]">
              {locador.nome}
            </option>
          ))}
        </select>
      </section>

      {/* INDICADORES */}

      <section className="grid grid-cols-2 gap-2">
        {RESUMO.map(({ chave, titulo, cor }) => (
          <div key={chave} className={`${cartao} overflow-hidden`}>
            <div className={`${cor} h-1.5`} />
            <div className="p-3">
              <p className="text-[11px] text-[var(--text-subtle)]">{titulo}</p>
              <p className="mt-1.5 text-[16px] leading-tight font-extrabold text-[var(--text)] tabular-nums">
                {formatarValor(somarPorStatus(transacoes, chave))}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* FILTROS */}

      <section className={`${cartao} p-4 space-y-4`}>

        <div>
          <h2 className="text-[15px] font-bold text-[var(--text)]">
            Filtros
          </h2>
          <p className="mt-0.5 text-[12px] text-[var(--text-subtle)]">
            Localize rapidamente qualquer cobrança.
          </p>
        </div>

        <div>
          <label className="block text-[11px] text-[var(--text-faint)] mb-1.5">
            Pesquisar
          </label>
          <SearchInput
            value={filtros.busca}
            onChange={(e) => onFiltroChange("busca", e.target.value)}
            placeholder="Cliente, cobrança..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">

          <div>
            <label className="block text-[11px] text-[var(--text-faint)] mb-1.5">
              Status
            </label>
            <select
              value={filtros.status}
              onChange={(e) => onFiltroChange("status", e.target.value)}
              className="w-full h-11 rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] px-3 text-[13px]"
            >
              {FILTROS_STATUS.map((s) => (
                <option key={s} value={s} className="bg-[#1b2430]">{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-[var(--text-faint)] mb-1.5">
              Forma
            </label>
            <select
              value={filtros.forma}
              onChange={(e) => onFiltroChange("forma", e.target.value)}
              className="w-full h-11 rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] px-3 text-[13px]"
            >
              {FILTROS_FORMA.map((f) => (
                <option key={f} value={f} className="bg-[#1b2430]">{f}</option>
              ))}
            </select>
          </div>

        </div>

        <div className="grid grid-cols-2 gap-3">

          <div>
            <label className="block text-[11px] text-[var(--text-faint)] mb-1.5">
              Vencimento até
            </label>
            <input
              type="date"
              value={filtros.periodo}
              onChange={(e) => onFiltroChange("periodo", e.target.value)}
              className="w-full h-11 rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] px-3 text-[13px]"
            />
          </div>

          <div>
            <label className="block text-[11px] text-[var(--text-faint)] mb-1.5">
              Enviado ao banco
            </label>
            <select
              value={filtros.enviado}
              onChange={(e) => onFiltroChange("enviado", e.target.value)}
              className="w-full h-11 rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] px-3 text-[13px]"
            >
              {FILTROS_ENVIADO.map((f) => (
                <option key={f} value={f} className="bg-[#1b2430]">{f}</option>
              ))}
            </select>
          </div>

        </div>

        <div className="flex gap-3">
          <button
            onClick={onAplicarFiltros}
            className="flex-1 h-11 rounded-xl bg-green-700 text-white text-[13px] font-semibold"
          >
            Filtrar
          </button>
          <button
            onClick={onLimparFiltros}
            className="flex-1 h-11 rounded-xl border border-[var(--border-token)] text-[var(--text-1)] text-[13px]"
          >
            Limpar
          </button>
        </div>

      </section>

      {/* LISTA */}

      {loading ? (

        <p className="py-10 text-center text-[13px] text-[var(--text-subtle)]">
          Carregando cobranças...
        </p>

      ) : transacoes.length === 0 ? (

        <EmptyState
          compact
          icon={<FileText size={26} />}
          title="Nenhuma cobrança encontrada"
          description="Ajuste os filtros ou crie uma nova cobrança."
        />

      ) : (

        <section className="space-y-2.5">
          {transacoes.map((item) => (
            <TransacaoCard
              key={item.id}
              item={item}
              onVisualizar={() => onVisualizar(item)}
              onDetalhes={() => onDetalhes(item)}
            />
          ))}
        </section>

      )}

      {podeExportar && <AsaasExportar transacoes={transacoes} />}

    </div>
  );
}

function TransacaoCard({ item, onVisualizar, onDetalhes }) {

  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  function abrirMenu(e) {
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    const larguraMenu = 200;

    let left = rect.right - larguraMenu;
    let top = rect.bottom + 8;

    if (left + larguraMenu > window.innerWidth - 16) {
      left = window.innerWidth - larguraMenu - 16;
    }
    if (left < 16) left = 16;

    setPosition({ top, left });
    setOpen(true);
  }

  const status = statusExibidoReceita(item);
  const { tipo, titulo, linhas } = demonstrativoReceita(item);
  const Icone = ICONE_POR_TIPO[tipo];
  const cor = COR_POR_TIPO[tipo];

  return (
    <div className={`${cartao} p-3.5`}>

      <div className="flex items-start justify-between gap-2">

        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[14px] font-bold text-[var(--text)] truncate">
            {item.clienteNome || item.cliente}
            {item.recorrente && <Repeat size={12} className="shrink-0 text-sky-400" />}
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--text-subtle)] truncate">
            {item.descricao || item.cliente}
            {item.residenciaNome && ` · ${item.residenciaNome}`}
            {item.kitnetNome && ` · Kitnet ${item.kitnetNome}`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant={status.variant} size="sm">{status.texto}</Badge>

          <button
            onClick={(e) => {
              if (open) {
                e.stopPropagation();
                setOpen(false);
                return;
              }
              abrirMenu(e);
            }}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-[var(--surface-2)] border border-[var(--border-token)]"
          >
            <MoreVertical size={16} className="text-[var(--text-muted)]" />
          </button>
        </div>

      </div>

      <div className="mt-2 flex items-start gap-1.5">
        <Icone size={13} className={`mt-0.5 shrink-0 ${cor}`} />
        <div className="min-w-0">
          <p className={`text-[12px] font-semibold ${cor}`}>{titulo}</p>
          {linhas.map((linha) => (
            <p key={linha} className="text-[11px] text-[var(--text-faint)]">{linha}</p>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-[12px] text-[var(--text-muted)]">
        <span className="text-[14px] font-bold text-[var(--text)]">{formatarValor(item.valor)}</span>
        <span>{item.formaPagamento || "-"}</span>
      </div>

      <ActionMenu open={open} position={position} onClose={() => setOpen(false)}>

        <MenuItem icon={<Eye size={17} />} label="Visualizar" onClick={onVisualizar} onCloseMenu={() => setOpen(false)} />

        <MenuItem icon={<Info size={17} />} label="Detalhes" cor="text-emerald-400 hover:bg-emerald-500/10" onClick={onDetalhes} onCloseMenu={() => setOpen(false)} />

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
