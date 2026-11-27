"use client";

import { useRouter } from "next/navigation";

import {
  Building2,
  CalendarClock,
  CheckCircle2,
  DollarSign,
  House,
  Plus,
  Ruler,
  Users,
  Wrench,
} from "lucide-react";

import ResidenciaFiltro from "../../common/ResidenciaFiltro";
import SearchInput from "../../common/SearchInput";
import KitnetActionsMenu from "../KitnetActionsMenu";
import VacanciaKitnet from "../VacanciaKitnet";
import EmptyState from "../../ui/EmptyState";

// Versão mobile da tela de Kitnets -- o desktop usa KitnetTable (uma
// <table> de verdade, cheia de colunas), que no celular só virava uma
// tabela cortada/rolando de lado. Aqui os mesmos dados (lista já
// filtrada/ordenada pela página) viram cartão, no mesmo estilo visual
// do DashboardMobile.

const cartao = `
  rounded-2xl
  border
  border-[var(--border-token)]
  bg-[var(--surface)]
  backdrop-blur-xl
`;

const STATUS_INFO = {
  DISPONIVEL: { label: "Vazia", cor: "bg-emerald-500/15 text-emerald-400" },
  OCUPADA: { label: "Ocupada", cor: "bg-sky-500/15 text-sky-400" },
  MANUTENCAO: { label: "Manutenção", cor: "bg-yellow-500/15 text-yellow-400" },
};

export default function KitnetsMobile({
  kitnets,
  totalKitnets,
  disponiveis,
  ocupadas,
  manutencao,
  podeCriar,
  onNovaKitnet,
  onEdit,
  onDelete,
  search,
  onSearchChange,
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
            Kitnets
          </h1>
          <p className="mt-0.5 text-[12px] text-[var(--text-subtle)]">
            Gerencie todas as kitnets cadastradas.
          </p>
          <p className="mt-1 text-[11px] font-semibold text-emerald-400">
            {totalKitnets} kitnet(s) cadastrada(s)
          </p>
        </div>

        {podeCriar && (
          <button
            onClick={onNovaKitnet}
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

      {/* INDICADORES */}

      <section className="grid grid-cols-4 gap-2">

        <StatKitnet
          icone={House}
          cor="text-[var(--text)] bg-[var(--surface-3)]"
          valor={totalKitnets}
          rotulo="Total"
        />

        <StatKitnet
          icone={CheckCircle2}
          cor="text-emerald-400 bg-emerald-500/15"
          valor={disponiveis}
          rotulo="Vazias"
        />

        <StatKitnet
          icone={Users}
          cor="text-sky-400 bg-sky-500/15"
          valor={ocupadas}
          rotulo="Ocupadas"
        />

        <StatKitnet
          icone={Wrench}
          cor="text-amber-400 bg-amber-500/15"
          valor={manutencao}
          rotulo="Manut."
        />

      </section>

      {/* FILTROS */}

      <section className={`${cartao} p-3 space-y-2`}>

        <SearchInput
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Pesquisar kitnet..."
          className="h-11"
        />

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
            <option value="DISPONIVEL" className="bg-[#1b2430]">Disponível</option>
            <option value="OCUPADA" className="bg-[#1b2430]">Ocupada</option>
            <option value="MANUTENCAO" className="bg-[#1b2430]">Manutenção</option>
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
            <option value="numero-asc" className="bg-[#1b2430]">Número (A-Z)</option>
            <option value="numero-desc" className="bg-[#1b2430]">Número (Z-A)</option>
            <option value="residencia-asc" className="bg-[#1b2430]">Residência</option>
            <option value="aluguel-maior" className="bg-[#1b2430]">Aluguel (maior)</option>
            <option value="aluguel-menor" className="bg-[#1b2430]">Aluguel (menor)</option>
            <option value="status" className="bg-[#1b2430]">Status</option>
          </select>

        </div>

      </section>

      {/* LISTA */}

      {kitnets.length === 0 ? (

        <EmptyState
          compact
          icon={<House size={26} />}
          title="Nenhuma kitnet encontrada"
          description="Ajuste os filtros ou cadastre sua primeira kitnet."
        />

      ) : (

        <section className="space-y-2.5">

          {kitnets.map((kitnet) => {

            const status = STATUS_INFO[kitnet.status] || {
              label: kitnet.status,
              cor: "bg-[var(--surface-3)] text-[var(--text-muted)]",
            };

            return (

              <div
                key={kitnet.id}
                onClick={() => router.push(`/kitnets/${kitnet.id}`)}
                className={`${cartao} p-3.5 active:scale-[0.99] transition cursor-pointer`}
              >

                <div className="flex items-start justify-between gap-2">

                  <div className="min-w-0">
                    <p className="text-[15px] font-bold text-[var(--text)] truncate">
                      {kitnet.nome || `Kitnet ${kitnet.numero}`}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-[12px] text-[var(--text-subtle)] truncate">
                      <Building2 size={12} className="shrink-0" />
                      {kitnet.unidade?.nome || kitnet.unidadeNome || "-"}
                      {kitnet.numero && ` · Nº ${kitnet.numero}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap ${status.cor}`}>
                      {status.label}
                    </span>

                    <KitnetActionsMenu
                      kitnet={kitnet}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />

                  </div>

                </div>

                <div className="mt-3 flex items-center gap-4 text-[12px] text-[var(--text-muted)]">

                  <span className="flex items-center gap-1.5">
                    <Ruler size={13} className="text-[var(--text-faint)]" />
                    {kitnet.metragem} m²
                  </span>

                  <span className="flex items-center gap-1.5">
                    <DollarSign size={13} className="text-[var(--text-faint)]" />
                    R$ {kitnet.aluguel}
                  </span>

                  {kitnet.diaVencimento && (
                    <span className="flex items-center gap-1.5">
                      <CalendarClock size={13} className="text-[var(--text-faint)]" />
                      Dia {kitnet.diaVencimento}
                    </span>
                  )}

                </div>

                {kitnet.status === "DISPONIVEL" && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-3 pt-3 border-t border-[var(--border-token)]"
                  >
                    <VacanciaKitnet kitnet={kitnet} />
                  </div>
                )}

              </div>

            );

          })}

        </section>

      )}

    </div>
  );
}

function StatKitnet({ icone: Icone, cor, valor, rotulo }) {
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
