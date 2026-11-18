"use client";

import { useRouter } from "next/navigation";

import {
  Building2,
  Mail,
  Phone,
  Plus,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

import ResidenciaFiltro from "../../common/ResidenciaFiltro";
import InquilinoActionsMenu from "../InquilinoActionsMenu";
import EmptyState from "../../ui/EmptyState";

// Versão mobile da tela de Inquilinos -- o desktop usa InquilinoTable
// (uma <table> de verdade, cheia de colunas), que no celular só virava
// uma tabela cortada/rolando de lado. Mesmo padrão visual (e mesmo
// grid de filtro) de KitnetsMobile.jsx.

const cartao = `
  rounded-2xl
  border
  border-[var(--border-token)]
  bg-[var(--surface)]
  backdrop-blur-xl
`;

export default function InquilinosMobile({
  inquilinos,
  totalInquilinos,
  ativos,
  inativos,
  podeCriar,
  onNovoInquilino,
  onEdit,
  onDelete,
  residenciaSelecionada,
  onResidenciaChange,
  statusFiltro,
  onStatusChange,
  ordenacao,
  onOrdenacaoChange,
}) {
  const router = useRouter();

  return (
    <div className="space-y-4">

      {/* CABEÇALHO */}

      <section className="flex items-start justify-between gap-3">

        <div className="min-w-0">
          <h1 className="text-[22px] font-extrabold text-[var(--text)]">
            Inquilinos
          </h1>
          <p className="mt-0.5 text-[12px] text-[var(--text-subtle)]">
            Gerencie todos os inquilinos cadastrados.
          </p>
          <p className="mt-1 text-[11px] font-semibold text-emerald-400">
            {totalInquilinos} inquilino(s) cadastrado(s)
          </p>
        </div>

        {podeCriar && (
          <button
            onClick={onNovoInquilino}
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

      {/* INDICADORES */}

      <section className="grid grid-cols-3 gap-2">

        <StatInquilino
          icone={Users}
          cor="text-[var(--text)] bg-[var(--surface-3)]"
          valor={totalInquilinos}
          rotulo="Total"
        />

        <StatInquilino
          icone={UserCheck}
          cor="text-emerald-400 bg-emerald-500/15"
          valor={ativos}
          rotulo="Ativos"
        />

        <StatInquilino
          icone={UserX}
          cor="text-red-400 bg-red-500/15"
          valor={inativos}
          rotulo="Inativos"
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
            value={statusFiltro}
            onChange={(e) => onStatusChange(e.target.value)}
            className="
              rounded-xl
              border border-[var(--border-token)]
              bg-[var(--surface-2)]
              text-[var(--text)]
              px-3 py-2.5
              text-[12px]
            "
          >
            <option value="" className="bg-[#1b2430]">Todos os status</option>
            <option value="ATIVO" className="bg-[#1b2430]">Ativo</option>
            <option value="INATIVO" className="bg-[#1b2430]">Inativo</option>
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
            <option value="nome-asc" className="bg-[#1b2430]">Nome (A-Z)</option>
            <option value="nome-desc" className="bg-[#1b2430]">Nome (Z-A)</option>
            <option value="kitnet-asc" className="bg-[#1b2430]">Kitnet</option>
            <option value="contrato-recente" className="bg-[#1b2430]">Contrato (mais recente)</option>
            <option value="contrato-antigo" className="bg-[#1b2430]">Contrato (mais antigo)</option>
            <option value="status-asc" className="bg-[#1b2430]">Status (ativos primeiro)</option>
          </select>

        </div>

      </section>

      {/* LISTA */}

      {inquilinos.length === 0 ? (

        <EmptyState
          compact
          icon={<Users size={26} />}
          title="Nenhum inquilino encontrado"
          description="Ajuste os filtros ou cadastre seu primeiro inquilino."
        />

      ) : (

        <section className="space-y-2.5">

          {inquilinos.map((inquilino) => {

            const nomeUnidade = inquilino.kitnet?.unidade?.nome || inquilino.unidadeNome;
            const nomeKitnet = inquilino.kitnet?.nome || inquilino.kitnet?.numero || inquilino.kitnetNome;

            return (

              <div
                key={inquilino.id}
                onClick={() => router.push(`/inquilinos/${inquilino.id}`)}
                className={`${cartao} p-3.5 active:scale-[0.99] transition cursor-pointer`}
              >

                <div className="flex items-start justify-between gap-2">

                  <div className="min-w-0">
                    <p className="text-[15px] font-bold text-[var(--text)] truncate">
                      {inquilino.nome}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[12px] text-[var(--text-subtle)] truncate">
                      <Building2 size={12} className="shrink-0" />
                      {nomeUnidade || "-"}
                      {nomeKitnet && ` · ${nomeKitnet}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">

                    <span
                      className={`
                        px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap
                        ${inquilino.ativo ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}
                      `}
                    >
                      {inquilino.ativo ? "Ativo" : "Inativo"}
                    </span>

                    <InquilinoActionsMenu
                      inquilino={inquilino}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />

                  </div>

                </div>

                <div className="mt-3 flex items-center gap-4 text-[12px] text-[var(--text-muted)]">

                  <span className="flex items-center gap-1.5 min-w-0">
                    <Mail size={13} className="text-[var(--text-faint)] shrink-0" />
                    <span className="truncate">{inquilino.email || "-"}</span>
                  </span>

                  <span className="flex items-center gap-1.5 shrink-0">
                    <Phone size={13} className="text-[var(--text-faint)]" />
                    {inquilino.telefone || "-"}
                  </span>

                </div>

              </div>

            );

          })}

        </section>

      )}

    </div>
  );
}

function StatInquilino({ icone: Icone, cor, valor, rotulo }) {
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
