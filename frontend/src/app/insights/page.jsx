"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  TrendingUp,
  CalendarClock,
  AlertTriangle,
  Clock,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Building2,
  FileText,
  ClipboardList,
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import FadeIn from "../components/ui/FadeIn";
import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import PageSection from "../components/ui/PageSection";
import SemPermissao from "../components/ui/SemPermissao";
import DashboardStatsCard from "../components/dashboard/DashboardStatsCard";

import { InsightsService } from "@/services/insights.service";
import { usePermissao } from "../../hooks/usePermissao";
import { formatCurrency } from "@/utils/formatCurrency";

const ICONES = {
  recebido_periodo: TrendingUp,
  previsto_periodo: CalendarClock,
  cobrancas_vencidas: AlertTriangle,
  cobrancas_a_vencer: Clock,
  pagamentos_pendentes: Wallet,
};

function formatarDataCurta(iso) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function construirUrl(navegacao) {
  if (!navegacao) return "#";
  const params = new URLSearchParams(navegacao.query || {});
  const query = params.toString();
  return `${navegacao.href}${query ? `?${query}` : ""}`;
}

export default function InsightsPage() {

  const podeVisualizar = usePermissao("insights.visualizar");

  const router = useRouter();

  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // null = mês atual (o backend decide). Trocar de mês manda inicio/fim
  // explícitos -- sempre o 1º e o último dia do mês escolhido.
  const [mesOffset, setMesOffset] = useState(0);

  const carregar = useCallback(async () => {

    try {

      setCarregando(true);
      setErro("");

      let params = {};

      if (mesOffset !== 0) {
        const base = new Date();
        base.setDate(1);
        base.setMonth(base.getMonth() + mesOffset);
        const inicio = new Date(base.getFullYear(), base.getMonth(), 1);
        const fim = new Date(base.getFullYear(), base.getMonth() + 1, 0);
        const paraISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        params = { inicio: paraISO(inicio), fim: paraISO(fim) };
      }

      const resposta = await InsightsService.financeiro(params);

      setResumo(resposta.data || resposta);

    } catch (err) {

      setErro(err.message || "Não foi possível carregar o VIME Insights.");

    } finally {

      setCarregando(false);

    }

  }, [mesOffset]);

  useEffect(() => {

    carregar();

  }, [carregar]);

  if (!podeVisualizar) {
    return <SemPermissao />;
  }

  const indicadores = resumo?.indicadores || [];

  return (

    <MainLayout>

      <Page>

        <PageContainer>

          <FadeIn>

            <div className="flex items-center gap-3">

              <div
                className="
                  w-12 h-12
                  rounded-2xl
                  bg-emerald-500/10
                  border border-emerald-500/20
                  flex items-center justify-center
                "
              >
                <Sparkles size={22} className="text-emerald-400" />
              </div>

              <div>
                <h1 className="text-4xl font-black text-[var(--text)]">
                  VIME Insights
                </h1>
                <p className="text-[var(--text-subtle)]">
                  Resumo executivo do sistema -- clique em qualquer número pra ver os registros por trás dele.
                </p>
              </div>

            </div>

          </FadeIn>

          {erro && (
            <FadeIn delay={0.05}>
              <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-300">
                {erro}
              </div>
            </FadeIn>
          )}

          <FadeIn delay={0.1}>

            <PageSection spacing="lg">

              <div
                className="
                  flex items-center justify-between flex-wrap gap-4
                  rounded-2xl border border-[var(--border-token)] bg-[var(--surface)]
                  px-6 py-4
                "
              >

                <div className="flex items-center gap-2">

                  <TrendingUp size={16} className="text-emerald-400" />

                  <h2 className="text-sm font-bold text-[var(--text)] uppercase tracking-wide">
                    Financeiro
                  </h2>

                  {resumo?.periodo && (
                    <span className="text-sm text-[var(--text-subtle)]">
                      -- {formatarDataCurta(resumo.periodo.inicio)} a {formatarDataCurta(resumo.periodo.fim)}
                    </span>
                  )}

                </div>

                <div className="flex items-center gap-2">

                  <button
                    onClick={() => setMesOffset((v) => v - 1)}
                    className="w-9 h-9 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] flex items-center justify-center transition"
                    title="Mês anterior"
                  >
                    <ChevronLeft size={16} className="text-[var(--text-subtle)]" />
                  </button>

                  {mesOffset !== 0 && (
                    <button
                      onClick={() => setMesOffset(0)}
                      className="text-xs text-emerald-400 hover:underline px-1"
                    >
                      Voltar pro mês atual
                    </button>
                  )}

                  <button
                    onClick={() => setMesOffset((v) => v + 1)}
                    className="w-9 h-9 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] flex items-center justify-center transition"
                    title="Próximo mês"
                  >
                    <ChevronRight size={16} className="text-[var(--text-subtle)]" />
                  </button>

                </div>

              </div>

            </PageSection>

          </FadeIn>

          <FadeIn delay={0.15}>

            <PageSection spacing="xxl">

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">

                {carregando && indicadores.length === 0 && (
                  <p className="col-span-full text-center text-[var(--text-subtle)] py-10">
                    Calculando os indicadores...
                  </p>
                )}

                {indicadores.map((ind) => {

                  const Icone = ICONES[ind.chave] || TrendingUp;

                  let subtitulo = `${ind.quantidade} registro(s)`;

                  if (ind.comparacao && ind.comparacao.variacaoPercentual !== null && ind.comparacao.variacaoPercentual !== undefined) {
                    const sinal = ind.comparacao.variacaoPercentual >= 0 ? "+" : "";
                    subtitulo = `${sinal}${ind.comparacao.variacaoPercentual}% vs. período anterior`;
                  }

                  return (
                    <DashboardStatsCard
                      key={ind.chave}
                      compact
                      title={ind.rotulo}
                      value={ind.formato === "moeda" ? formatCurrency(ind.valor) : ind.valor}
                      subtitle={subtitulo}
                      icon={Icone}
                      onClick={() => router.push(construirUrl(ind.navegacao))}
                    />
                  );

                })}

              </div>

            </PageSection>

          </FadeIn>

          <FadeIn delay={0.2}>

            <PageSection spacing="xxl">

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {[
                  { titulo: "Imóveis e Kitnets", icone: Building2 },
                  { titulo: "Contratos", icone: FileText },
                  { titulo: "Solicitações e Vistorias", icone: ClipboardList },
                ].map(({ titulo, icone: Icone }) => (

                  <div
                    key={titulo}
                    className="
                      rounded-2xl border border-dashed border-[var(--border-token)]
                      bg-[var(--surface)] px-6 py-8 text-center
                    "
                  >
                    <Icone size={22} className="mx-auto text-[var(--text-faint)]" />
                    <p className="mt-3 font-semibold text-[var(--text-muted)]">{titulo}</p>
                    <p className="mt-1 text-xs text-[var(--text-faint)]">
                      Próxima etapa -- ainda não calculado aqui.
                    </p>
                  </div>

                ))}

              </div>

            </PageSection>

          </FadeIn>

          {resumo?.geradoEm && (
            <FadeIn delay={0.25}>
              <p className="text-center text-xs text-[var(--text-faint)] mt-2">
                Última atualização: {new Date(resumo.geradoEm).toLocaleString("pt-BR")}
              </p>
            </FadeIn>
          )}

        </PageContainer>

      </Page>

    </MainLayout>

  );

}
