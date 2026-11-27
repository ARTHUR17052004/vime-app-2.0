"use client";

import {
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
} from "lucide-react";

import ContratoHistoricoFinanceiro from "../ContratoHistoricoFinanceiro";
import ContratoHistoricoEventos from "../ContratoHistoricoEventos";

// Versão mobile do detalhe de um Contrato -- o desktop usa
// ContratoFinanceiroResumo (4 cartões iguais, 1 por linha no celular,
// cada um ocupando a tela toda) + um bloco "Contrato" com título
// text-4xl e pares label/valor em text-2xl, pensados pra tela grande.
// Aqui os mesmos dados viram: 3 estatísticas lado a lado, um cartão de
// destaque pra Receita Anual, e o detalhe do contrato em linhas
// compactas -- igual ao resto do app no mobile (ver KitnetsMobile,
// ContratosMobile). ContratoHistoricoCard não entra aqui -- é
// (Data início/fim/Status) repetido do próprio cartão de detalhe.

const cartao = `
  rounded-2xl
  border
  border-[var(--border-token)]
  bg-[var(--surface)]
  backdrop-blur-xl
`;

const MOTIVO_ENCERRAMENTO = {
  FIM_DE_CONTRATO: "Fim do contrato (encerramento normal)",
  ABANDONO: "Abandono",
  INADIMPLENCIA: "Inadimplência",
  QUEBRA_DO_INQUILINO: "Quebra do inquilino",
};

const STATUS_INFO = {
  ATIVO: { label: "Ativo", cor: "bg-emerald-500/15 text-emerald-400" },
  ASSINADO: { label: "Assinado", cor: "bg-emerald-500/15 text-emerald-400" },
  PENDENTE: { label: "Pendente", cor: "bg-yellow-500/15 text-yellow-400" },
  ENCERRADO: { label: "Encerrado", cor: "bg-[var(--surface-3)] text-[var(--text-muted)]" },
};

function formatarData(data, fallback = "-") {
  return data ? new Date(data).toLocaleDateString("pt-BR") : fallback;
}

export default function ContratoDetalheMobile({ contrato }) {

  const valorAluguel = Number(contrato?.valorAluguel || 0);
  const receitaAnual = valorAluguel * 12;

  const hoje = new Date();
  const dataFim = contrato?.dataFim ? new Date(contrato.dataFim) : hoje;
  const mesesRestantes = Math.max(
    0,
    Math.ceil((dataFim - hoje) / (1000 * 60 * 60 * 24 * 30))
  );

  const status = STATUS_INFO[contrato.status] || {
    label: contrato.status,
    cor: "bg-[var(--surface-3)] text-[var(--text-muted)]",
  };

  return (
    <div className="space-y-4">

      {/* INDICADORES */}

      <section className="grid grid-cols-3 gap-2">

        <div className={`${cartao} p-2.5`}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-emerald-400 bg-emerald-500/15">
            <DollarSign size={15} />
          </div>
          <p className="mt-2 text-[15px] leading-tight font-extrabold text-[var(--text)] tabular-nums">
            R$ {valorAluguel.toLocaleString("pt-BR")}
          </p>
          <p className="mt-1 text-[10px] text-[var(--text-faint)]">Aluguel</p>
        </div>

        <div className={`${cartao} p-2.5`}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-yellow-400 bg-yellow-500/15">
            <Calendar size={15} />
          </div>
          <p className="mt-2 text-[16px] leading-none font-extrabold text-[var(--text)] tabular-nums">
            {mesesRestantes}
          </p>
          <p className="mt-1 text-[10px] text-[var(--text-faint)]">Meses restantes</p>
        </div>

        <div className={`${cartao} p-2.5`}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] bg-[var(--surface-3)]">
            <FileText size={15} />
          </div>
          <p className="mt-2 text-[13px] leading-tight font-extrabold text-[var(--text)] truncate">
            {status.label}
          </p>
          <p className="mt-1 text-[10px] text-[var(--text-faint)]">Status</p>
        </div>

      </section>

      {/* RECEITA ANUAL */}

      <section className={`${cartao} p-4 flex items-center justify-between`}>

        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-subtle)] font-semibold">
            Receita Anual
          </p>
          <p className="mt-1.5 text-[22px] leading-none font-extrabold text-[var(--text)] tabular-nums">
            R$ {receitaAnual.toLocaleString("pt-BR")}
          </p>
        </div>

        <div className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center bg-sky-500/10 border border-sky-500/20">
          <TrendingUp size={22} className="text-sky-400" />
        </div>

      </section>

      {/* DETALHES DO CONTRATO */}

      <section className={`${cartao} p-4`}>

        <h2 className="text-[16px] font-bold text-[var(--text)]">
          Contrato
        </h2>
        <p className="text-[11px] text-[var(--text-subtle)]">
          Detalhes do contrato
        </p>

        <div className="mt-4 divide-y divide-[var(--border-token)]">

          <Campo rotulo="Inquilino" valor={contrato.inquilino?.nome || contrato.inquilinoNome || "-"} />
          <Campo rotulo="Residência" valor={contrato.unidade?.nome || contrato.unidadeNome || "-"} />
          <Campo rotulo="Kitnet" valor={contrato.kitnet?.nome || contrato.kitnetNome || "-"} />
          <Campo rotulo="Valor do aluguel" valor={`R$ ${valorAluguel.toLocaleString("pt-BR")}`} destaque />
          <Campo rotulo="Data início" valor={formatarData(contrato.dataInicio)} />
          <Campo rotulo="Data fim" valor={formatarData(contrato.dataFim, "Indeterminado")} />
          <Campo rotulo="Dia vencimento" valor={`Dia ${contrato.diaVencimento}`} />

          <div className="flex items-center justify-between py-3">
            <p className="text-[12px] text-[var(--text-subtle)]">Status</p>
            <span className={`px-3 py-1 rounded-full text-[11px] font-semibold ${status.cor}`}>
              {status.label}
            </span>
          </div>

          {contrato.status === "ENCERRADO" && contrato.motivoEncerramento && (
            <div className="py-3">
              <p className="text-[12px] text-[var(--text-subtle)]">
                {contrato.motivoEncerramento === "FIM_DE_CONTRATO"
                  ? "Encerrado manualmente antes do fim previsto"
                  : "Encerrado por quebra de contrato"}
              </p>
              <p className={`mt-1 text-[14px] font-bold ${contrato.motivoEncerramento === "FIM_DE_CONTRATO" ? "text-[var(--text)]" : "text-red-400"}`}>
                {MOTIVO_ENCERRAMENTO[contrato.motivoEncerramento] || contrato.motivoEncerramento}
              </p>
              {contrato.observacaoEncerramento && (
                <p className="mt-1 text-[12px] text-[var(--text-muted)]">
                  {contrato.observacaoEncerramento}
                </p>
              )}
            </div>
          )}

        </div>

      </section>

      <ContratoHistoricoFinanceiro contratoId={contrato.id} />

      <ContratoHistoricoEventos contrato={contrato} />

      {/* OBSERVAÇÕES */}

      <section className={`${cartao} p-4`}>
        <p className="text-[12px] text-[var(--text-subtle)] mb-2">
          Observações
        </p>
        <div className="rounded-xl border border-[var(--border-token)] bg-[var(--surface-2)] p-3 text-[13px] text-[var(--text-1)]">
          {contrato.observacoes || "Nenhuma observação cadastrada."}
        </div>
      </section>

    </div>
  );
}

function Campo({ rotulo, valor, destaque = false }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <p className="text-[12px] text-[var(--text-subtle)]">{rotulo}</p>
      <p className={`text-[14px] font-bold text-right truncate ${destaque ? "text-emerald-400" : "text-[var(--text)]"}`}>
        {valor}
      </p>
    </div>
  );
}
