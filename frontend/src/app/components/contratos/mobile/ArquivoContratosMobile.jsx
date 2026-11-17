"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Ban,
  Download,
  Eye,
  FileText,
  MoreVertical,
  Paperclip,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import ActionMenu from "../../ui/ActionMenu";
import EmptyState from "../../ui/EmptyState";
import SearchInput from "../../common/SearchInput";
import ResidenciaFiltro from "../../common/ResidenciaFiltro";

import { usePermissao } from "../../../../hooks/usePermissao";

// Versão mobile do Arquivo de Contratos -- mesmo tratamento dado a
// Contratos (ver ContratosMobile.jsx): cartão "Filtros" com campo
// rotulado (igual ao Financeiro) e a tabela (cortava de lado no
// celular) virando lista de cartões.

const cartao = `
  rounded-2xl
  border
  border-[var(--border-token)]
  bg-[var(--surface)]
  backdrop-blur-xl
`;

const STATUS_INFO = {
  ATIVO: { label: "Ativo", cor: "bg-emerald-500/15 text-emerald-400" },
  PENDENTE: { label: "Pendente", cor: "bg-yellow-500/15 text-yellow-400" },
  ENCERRADO: { label: "Encerrado", cor: "bg-[var(--surface-3)] text-[var(--text-muted)]" },
};

function formatarData(data) {
  if (!data) return "-";
  return new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default function ArquivoContratosMobile({
  contratos,
  totalContratos,
  podeCriar,
  onNovoContrato,
  onEdit,
  onDelete,
  onEncerrar,
  onBaixarArquivo,
  search,
  onSearchChange,
  residenciaSelecionada,
  onResidenciaChange,
}) {
  const router = useRouter();

  return (
    <div className="space-y-4">

      <Link
        href="/contratos"
        className="inline-flex items-center gap-2 text-sm text-[var(--text-subtle)]"
      >
        <ArrowLeft size={14} />
        Voltar para Contratos
      </Link>

      {/* CABEÇALHO */}

      <section className="flex items-start justify-between gap-3">

        <div className="min-w-0">
          <h1 className="text-[20px] font-extrabold text-[var(--text)]">
            Arquivo de Contratos
          </h1>
          <p className="mt-0.5 text-[12px] leading-snug text-[var(--text-subtle)]">
            Contratos registrados manualmente — já existiam de verdade e só precisavam ficar organizados aqui.
          </p>
          <p className="mt-1 text-[11px] font-semibold text-emerald-400">
            {totalContratos} contrato(s) no arquivo
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

      <section className={`${cartao} p-4 space-y-4`}>

        <div>
          <h2 className="text-[15px] font-bold text-[var(--text)]">
            Filtros
          </h2>
          <p className="mt-0.5 text-[12px] text-[var(--text-subtle)]">
            Encontre rapidamente um contrato por inquilino, residência ou kitnet.
          </p>
        </div>

        <div>
          <label className="block text-[11px] text-[var(--text-faint)] mb-1.5">
            Pesquisar
          </label>
          <SearchInput
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Inquilino, residência ou kitnet..."
            className="h-11"
          />
        </div>

        <div>
          <label className="block text-[11px] text-[var(--text-faint)] mb-1.5">
            Residência
          </label>
          <ResidenciaFiltro
            compact
            value={residenciaSelecionada}
            onChange={onResidenciaChange}
          />
        </div>

      </section>

      {/* LISTA */}

      {contratos.length === 0 ? (

        <EmptyState
          compact
          icon={<FileText size={26} />}
          title="Nenhum contrato no arquivo"
          description='Ajuste os filtros ou toque em "Novo" pra cadastrar um contrato que já existia em papel.'
        />

      ) : (

        <section className="space-y-2.5">
          {contratos.map((contrato) => (
            <ArquivoCard
              key={contrato.id}
              contrato={contrato}
              onEdit={onEdit}
              onDelete={onDelete}
              onEncerrar={onEncerrar}
              onBaixarArquivo={onBaixarArquivo}
              onAbrir={() => router.push(`/contratos/${contrato.id}`)}
            />
          ))}
        </section>

      )}

    </div>
  );
}

function ArquivoCard({ contrato, onEdit, onDelete, onEncerrar, onBaixarArquivo, onAbrir }) {

  const podeEditar = usePermissao("arquivoContratos.editar");
  const podeExcluir = usePermissao("arquivoContratos.excluir");

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
            {(contrato.kitnet?.nome || contrato.kitnet?.numero || contrato.kitnetNome || "-")}
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
        <span>{formatarData(contrato.dataInicio)} – {contrato.dataFim ? formatarData(contrato.dataFim) : "sem fim"}</span>
      </div>

      <div className="mt-2.5 pt-2.5 border-t border-[var(--border-token)]">
        {contrato.arquivoNomeOriginal ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBaixarArquivo?.(contrato);
            }}
            className="inline-flex items-center gap-1.5 text-[12px] text-emerald-400"
          >
            <Paperclip size={13} />
            <span className="truncate">{contrato.arquivoNomeOriginal}</span>
          </button>
        ) : (
          <span className="text-[11px] text-[var(--text-faint)]">Sem anexo</span>
        )}
      </div>

      <ActionMenu open={open} position={position} onClose={() => setOpen(false)}>

        <MenuItem icon={<Eye size={17} />} label="Visualizar" onClick={onAbrir} onCloseMenu={() => setOpen(false)} />

        {contrato.arquivoNomeOriginal && (
          <MenuItem
            icon={<Download size={17} />}
            label="Baixar Arquivo"
            cor="text-emerald-400 hover:bg-emerald-500/10"
            onClick={() => onBaixarArquivo?.(contrato)}
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
