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
  ChevronDown,
  RefreshCw,
  Building2,
  FileText,
  ClipboardList,
  Info,
  TriangleAlert,
  Home,
  PieChart,
  FileWarning,
  FileCheck2,
  FileClock,
  Archive,
  ClipboardCheck,
  ClipboardX,
  CalendarCheck,
  ListChecks,
  ShieldAlert,
  LayoutGrid,
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";
import FadeIn from "../components/ui/FadeIn";
import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import SemPermissao from "../components/ui/SemPermissao";
import AssistenteChat from "../components/insights/AssistenteChat";

import { InsightsService } from "@/services/insights.service";
import { usePermissao } from "../../hooks/usePermissao";
import { formatCurrency } from "@/utils/formatCurrency";

const ICONES = {
  recebido_periodo: TrendingUp,
  previsto_periodo: CalendarClock,
  cobrancas_vencidas: AlertTriangle,
  cobrancas_a_vencer: Clock,
  pagamentos_pendentes: Wallet,
  residencias_total: Building2,
  kitnets_total: Home,
  kitnets_ocupadas: Home,
  kitnets_vazias: Home,
  taxa_ocupacao: PieChart,
  imoveis_incompletos: FileWarning,
  contratos_vigentes: FileCheck2,
  contratos_vencendo: FileClock,
  contratos_pendentes: FileClock,
  contratos_encerrados: Archive,
  solicitacoes_abertas: ClipboardCheck,
  solicitacoes_atrasadas: ClipboardX,
  vistorias_agendadas: CalendarCheck,
  vistorias_pendentes: Clock,
  vistorias_atrasadas: ShieldAlert,
  ocorrencias_registradas: ListChecks,
};

function formatarDataCurta(iso) {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarValor(indicador) {
  if (!indicador) return "";
  if (indicador.formato === "moeda") return formatCurrency(indicador.valor);
  if (indicador.formato === "percentual") return `${indicador.valor}%`;
  return String(indicador.valor);
}

function construirUrl(navegacao) {
  if (!navegacao) return "#";
  const params = new URLSearchParams(navegacao.query || {});
  const query = params.toString();
  return `${navegacao.href}${query ? `?${query}` : ""}`;
}

// Cartão -- título, subtítulo e um "slot" de conteúdo embaixo. É a base
// visual repetida em toda a tela (Período, Resumo/Pergunte, Visão
// operacional) -- de propósito mais enxuto que o DashboardStatsCard do
// Dashboard (sem número gigante, sem ícone grande colorido): o pedido
// foi justamente não parecer "mais um Dashboard".
function Cartao({ icone: Icone, titulo, subtitulo, acao, children }) {
  return (
    <div className="rounded-2xl border border-[var(--border-token)] bg-[var(--surface)] overflow-hidden">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 px-5 sm:px-6 py-4">

        <div className="flex items-center gap-2.5 min-w-0">
          {Icone && <Icone size={16} className="text-emerald-400 shrink-0" />}
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-[var(--text)] uppercase tracking-wide">
              {titulo}
            </h2>
            {subtitulo && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {subtitulo}
              </p>
            )}
          </div>
        </div>

        {acao && <div className="shrink-0">{acao}</div>}

      </div>

      {children}

    </div>
  );
}

// Divisória entre os dois grupos (o que muda com o período x o que é
// sempre "agora") -- pedido explícito pra ficar bem visível, não só
// um texto pequeno junto do título do cartão.
function DivisoriaGrupo({ titulo, descricao }) {
  return (
    <div className="px-6 py-2.5 border-t border-[var(--border-token)] bg-[var(--surface-2)]">
      <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
        {titulo}
      </p>
      <p className="text-[11px] text-[var(--text-faint)] mt-0.5">
        {descricao}
      </p>
    </div>
  );
}

// Linha compacta de indicador: ícone pequeno + título + valor + uma
// linha de contexto. Clicar no corpo da linha leva pro módulo já
// filtrado; o botão "i" separado revela o critério de cálculo exato
// sem sair da tela (clique, não hover -- precisa funcionar no celular).
function LinhaIndicador({ indicador, expandido, onToggleInfo, onClick, carregando }) {

  const Icone = ICONES[indicador.chave] || TrendingUp;

  let contexto = `${indicador.quantidade} registro(s)`;

  if (indicador.comparacao && indicador.comparacao.variacaoPercentual !== null && indicador.comparacao.variacaoPercentual !== undefined) {
    const sinal = indicador.comparacao.variacaoPercentual >= 0 ? "+" : "";
    contexto += ` -- ${sinal}${indicador.comparacao.variacaoPercentual}% vs. período anterior`;
  }

  return (
    <div className={`border-t border-[var(--border-token)] transition-opacity ${carregando ? "opacity-50" : ""}`}>

      <div className="flex items-start gap-1 sm:gap-2">

        <button
          onClick={onClick}
          disabled={carregando}
          className="
            flex items-start gap-3
            pl-6 pr-2 py-4
            text-left
            hover:bg-[var(--surface-2)]
            transition
            flex-1 min-w-0
          "
        >

          <div
            className="
              w-9 h-9 shrink-0 mt-0.5
              rounded-xl
              bg-emerald-500/10 border border-emerald-500/20
              flex items-center justify-center
            "
          >
            <Icone size={15} className="text-emerald-400" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
              {indicador.rotulo}
            </p>
            <p className="text-xl font-black text-[var(--text)] mt-0.5">
              {formatarValor(indicador)}
            </p>
            <p className="text-xs text-[var(--text-faint)] mt-0.5">
              {contexto}
            </p>
          </div>

          <ChevronRight size={16} className="text-[var(--text-faint)] mt-2 shrink-0 hidden sm:block" />

        </button>

        {indicador.criterio && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleInfo(indicador.chave);
            }}
            title="Como esse número é calculado"
            className={`
              shrink-0 w-9 h-9 mt-2 mr-4
              rounded-full
              flex items-center justify-center
              transition
              ${expandido ? "bg-emerald-500/15 text-emerald-400" : "bg-[var(--surface-2)] text-[var(--text-faint)] hover:bg-[var(--surface-3)]"}
            `}
          >
            <Info size={15} />
          </button>
        )}

      </div>

      {expandido && indicador.criterio && (
        <div className="px-6 pb-4 -mt-2">
          <p className="text-xs text-[var(--text-muted)] bg-[var(--surface-2)] rounded-xl px-4 py-3 leading-relaxed">
            {indicador.criterio}
          </p>
        </div>
      )}

    </div>
  );
}

// Linha de módulo -- fechada por padrão, mostra só um resumo de uma
// linha; clicar expande e revela o conteúdo de verdade embaixo. Mesma
// linha serve pros módulos ainda não integrados (sem seta, nada pra
// abrir) e pro Financeiro (com seta, abre os indicadores). Pedido
// explícito: tudo começa resumido, o usuário escolhe o que quer abrir.
function LinhaModulo({ titulo, resumo, icone: Icone, expansivel = false, aberto = false, onToggle, children }) {
  return (
    <div className="border-t border-[var(--border-token)]">

      <button
        onClick={expansivel ? onToggle : undefined}
        disabled={!expansivel}
        className={`
          w-full flex items-center gap-3
          px-6 py-4
          text-left
          ${expansivel ? "hover:bg-[var(--surface-2)] transition cursor-pointer" : "cursor-default"}
        `}
      >
        <Icone size={18} className={expansivel ? "text-emerald-400 shrink-0" : "text-[var(--text-faint)] shrink-0"} />
        <div className="min-w-0 flex-1">
          <p className={`font-semibold ${expansivel ? "text-[var(--text)]" : "text-[var(--text-muted)]"}`}>{titulo}</p>
          <p className="text-xs text-[var(--text-faint)] truncate">
            {resumo}
          </p>
        </div>
        {expansivel && (
          <ChevronDown
            size={16}
            className={`text-[var(--text-faint)] shrink-0 transition-transform ${aberto ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {expansivel && aberto && children}

    </div>
  );
}

export default function InsightsPage() {

  const podeVisualizar = usePermissao("insights.visualizar");
  const podeUsarSabado = usePermissao("sabado.usar");

  const router = useRouter();

  // Assistente é a aba padrão quando o usuário tem permissão pra ele
  // -- é o motivo da tela se chamar "Assistente IA" no menu agora.
  const [aba, setAba] = useState(podeUsarSabado ? "assistente" : "visao-geral");

  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [resumoImoveisDados, setResumoImoveisDados] = useState(null);
  const [erroImoveis, setErroImoveis] = useState("");

  const [resumoContratosDados, setResumoContratosDados] = useState(null);
  const [erroContratos, setErroContratos] = useState("");

  const [resumoSolicVistDados, setResumoSolicVistDados] = useState(null);
  const [erroSolicVist, setErroSolicVist] = useState("");

  // 0 = mês atual (o backend decide sozinho). Trocar de mês manda
  // inicio/fim explícitos -- sempre o 1º e o último dia do mês escolhido.
  const [mesOffset, setMesOffset] = useState(0);

  // Quais indicadores estão com o critério de cálculo aberto (clique no
  // botão "i" de cada linha) -- guarda por chave, não precisa resetar
  // ao trocar de período.
  const [expandidos, setExpandidos] = useState(() => new Set());

  const toggleInfo = (chave) => {
    setExpandidos((atual) => {
      const novo = new Set(atual);
      if (novo.has(chave)) novo.delete(chave);
      else novo.add(chave);
      return novo;
    });
  };

  // Começa fechado -- tudo na tela abre só quando o usuário pedir.
  const [financeiroAberto, setFinanceiroAberto] = useState(false);
  const [imoveisAberto, setImoveisAberto] = useState(false);
  const [contratosAberto, setContratosAberto] = useState(false);
  const [solicVistAberto, setSolicVistAberto] = useState(false);

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

      const [respostaFinanceiro, respostaImoveis, respostaContratos, respostaSolicVist] = await Promise.all([
        InsightsService.financeiro(params),
        InsightsService.imoveis().catch((err) => {
          // Cada módulo falha sozinho sem travar os outros -- guarda o
          // erro à parte e segue com o resto normalmente.
          setErroImoveis(err.message || "Não foi possível carregar Imóveis e Kitnets.");
          return null;
        }),
        InsightsService.contratos().catch((err) => {
          setErroContratos(err.message || "Não foi possível carregar Contratos.");
          return null;
        }),
        InsightsService.solicitacoesVistorias().catch((err) => {
          setErroSolicVist(err.message || "Não foi possível carregar Solicitações e Vistorias.");
          return null;
        }),
      ]);

      setResumo(respostaFinanceiro.data || respostaFinanceiro);

      if (respostaImoveis) {
        setErroImoveis("");
        setResumoImoveisDados(respostaImoveis.data || respostaImoveis);
      }

      if (respostaContratos) {
        setErroContratos("");
        setResumoContratosDados(respostaContratos.data || respostaContratos);
      }

      if (respostaSolicVist) {
        setErroSolicVist("");
        setResumoSolicVistDados(respostaSolicVist.data || respostaSolicVist);
      }

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
  const indicadoresPeriodo = indicadores.filter((i) => i.escopo === "periodo");
  const indicadoresAtual = indicadores.filter((i) => i.escopo === "atual");

  const recebido = indicadores.find((i) => i.chave === "recebido_periodo");
  const vencidas = indicadores.find((i) => i.chave === "cobrancas_vencidas");

  const resumoFinanceiro =
    carregando && indicadores.length === 0
      ? "Calculando..."
      : recebido && vencidas
        ? `Recebido ${formatCurrency(recebido.valor)} no período -- ${formatCurrency(vencidas.valor)} vencido agora`
        : "Toque para ver os indicadores.";

  const indicadoresImoveis = resumoImoveisDados?.indicadores || [];
  const taxaOcupacao = indicadoresImoveis.find((i) => i.chave === "taxa_ocupacao");
  const kitnetsVaziasInd = indicadoresImoveis.find((i) => i.chave === "kitnets_vazias");

  const resumoImoveisTexto = erroImoveis
    ? "Não foi possível carregar."
    : carregando && indicadoresImoveis.length === 0
      ? "Calculando..."
      : taxaOcupacao && kitnetsVaziasInd
        ? `${taxaOcupacao.valor}% ocupado -- ${kitnetsVaziasInd.valor} kitnet(s) disponível(is)`
        : "Toque para ver os indicadores.";

  const indicadoresContratos = resumoContratosDados?.indicadores || [];
  const contratosVigentesInd = indicadoresContratos.find((i) => i.chave === "contratos_vigentes");
  const contratosVencendoInd = indicadoresContratos.find((i) => i.chave === "contratos_vencendo");

  const resumoContratosTexto = erroContratos
    ? "Não foi possível carregar."
    : carregando && indicadoresContratos.length === 0
      ? "Calculando..."
      : contratosVigentesInd && contratosVencendoInd
        ? `${contratosVigentesInd.valor} vigente(s) -- ${contratosVencendoInd.valor} vencendo em breve`
        : "Toque para ver os indicadores.";

  const indicadoresSolicVist = resumoSolicVistDados?.indicadores || [];
  const solicitacoesAbertasInd = indicadoresSolicVist.find((i) => i.chave === "solicitacoes_abertas");
  const vistoriasAtrasadasInd = indicadoresSolicVist.find((i) => i.chave === "vistorias_atrasadas");

  const resumoSolicVistTexto = erroSolicVist
    ? "Não foi possível carregar."
    : carregando && indicadoresSolicVist.length === 0
      ? "Calculando..."
      : solicitacoesAbertasInd && vistoriasAtrasadasInd
        ? `${solicitacoesAbertasInd.valor} solicitação(ões) aberta(s) -- ${vistoriasAtrasadasInd.valor} vistoria(s) atrasada(s)`
        : "Toque para ver os indicadores.";

  return (

    <MainLayout>

      <Page>

        <PageContainer>

          <FadeIn>

            <div className="flex items-center justify-between gap-4 flex-wrap">

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
                    Assistente IA
                  </h1>
                  <p className="text-[var(--text-subtle)]">
                    Converse com o SABADO sobre a operação ou veja os indicadores direto.
                  </p>
                </div>

              </div>

              {aba === "visao-geral" && (
                <button
                  onClick={carregar}
                  disabled={carregando}
                  title="Atualizar"
                  className="
                    w-11 h-11 shrink-0
                    rounded-xl
                    bg-[var(--surface-2)] hover:bg-[var(--surface-3)]
                    flex items-center justify-center
                    transition
                    disabled:opacity-50
                  "
                >
                  <RefreshCw size={18} className={`text-[var(--text-muted)] ${carregando ? "animate-spin" : ""}`} />
                </button>
              )}

            </div>

          </FadeIn>

          <FadeIn delay={0.06}>
            <div className="mt-6 inline-flex rounded-xl border border-[var(--border-token)] bg-[var(--surface)] p-1 gap-1">

              <button
                onClick={() => setAba("assistente")}
                className={`
                  flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-colors
                  ${aba === "assistente" ? "bg-emerald-500/15 text-emerald-400" : "text-[var(--text-muted)] hover:text-[var(--text)]"}
                `}
              >
                <Sparkles size={14} />
                Assistente
              </button>

              <button
                onClick={() => setAba("visao-geral")}
                className={`
                  flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg transition-colors
                  ${aba === "visao-geral" ? "bg-emerald-500/15 text-emerald-400" : "text-[var(--text-muted)] hover:text-[var(--text)]"}
                `}
              >
                <LayoutGrid size={14} />
                Visão geral
              </button>

            </div>
          </FadeIn>

          {aba === "assistente" && (
            <FadeIn delay={0.1}>
              <div className="mt-6">
                {podeUsarSabado ? (
                  <AssistenteChat />
                ) : (
                  <div className="rounded-2xl border border-[var(--border-token)] bg-[var(--surface)] p-6 text-center text-sm text-[var(--text-muted)]">
                    Você não tem permissão para usar o Assistente IA.
                  </div>
                )}
              </div>
            </FadeIn>
          )}

          {aba === "visao-geral" && erro && (
            <FadeIn delay={0.05}>
              <div
                className="
                  mt-6 flex items-center justify-between gap-4 flex-wrap
                  rounded-2xl border border-red-500/20 bg-red-500/10
                  px-5 py-4
                "
              >
                <div className="flex items-center gap-2.5 text-red-300">
                  <TriangleAlert size={18} className="shrink-0" />
                  {erro}
                </div>
                <button
                  onClick={carregar}
                  className="text-sm font-semibold text-red-200 hover:text-white underline shrink-0"
                >
                  Tentar novamente
                </button>
              </div>
            </FadeIn>
          )}

          {aba === "visao-geral" && (
          <>

          <FadeIn delay={0.1}>
            <div className="mt-8">
              <Cartao
                icone={CalendarClock}
                titulo="Período de análise"
                subtitulo={
                  resumo?.periodo
                    ? `${formatarDataCurta(resumo.periodo.inicio)} a ${formatarDataCurta(resumo.periodo.fim)}`
                    : "Seletor de datas e indicação clara do período consultado."
                }
                acao={
                  <div className="flex items-center gap-2 shrink-0">

                    <button
                      onClick={() => setMesOffset((v) => v - 1)}
                      className="w-9 h-9 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] flex items-center justify-center transition"
                      title="Mês anterior"
                    >
                      <ChevronLeft size={16} className="text-[var(--text-muted)]" />
                    </button>

                    {mesOffset !== 0 && (
                      <button
                        onClick={() => setMesOffset(0)}
                        className="text-xs text-emerald-400 hover:underline px-1 whitespace-nowrap"
                      >
                        Mês atual
                      </button>
                    )}

                    <button
                      onClick={() => setMesOffset((v) => v + 1)}
                      className="w-9 h-9 rounded-xl bg-[var(--surface-2)] hover:bg-[var(--surface-3)] flex items-center justify-center transition"
                      title="Próximo mês"
                    >
                      <ChevronRight size={16} className="text-[var(--text-muted)]" />
                    </button>

                  </div>
                }
              />
            </div>
          </FadeIn>

          <FadeIn delay={0.18}>
            <div className="mt-8">

              <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wide mb-3 px-1">
                Módulos
              </h2>

              <div className="rounded-2xl border border-[var(--border-token)] bg-[var(--surface)] overflow-hidden">

                <LinhaModulo
                  titulo="Financeiro"
                  resumo={resumoFinanceiro}
                  icone={TrendingUp}
                  expansivel
                  aberto={financeiroAberto}
                  onToggle={() => setFinanceiroAberto((v) => !v)}
                >

                  {indicadoresPeriodo.length > 0 && (
                    <>
                      <DivisoriaGrupo
                        titulo="Nesse período"
                        descricao="Muda quando você troca o mês no cartão acima."
                      />
                      {indicadoresPeriodo.map((ind) => (
                        <LinhaIndicador
                          key={ind.chave}
                          indicador={ind}
                          expandido={expandidos.has(ind.chave)}
                          onToggleInfo={toggleInfo}
                          carregando={carregando}
                          onClick={() => router.push(construirUrl(ind.navegacao))}
                        />
                      ))}
                    </>
                  )}

                  {indicadoresAtual.length > 0 && (
                    <>
                      <DivisoriaGrupo
                        titulo="Situação agora"
                        descricao="Não muda com o período -- é sempre o momento atual."
                      />
                      {indicadoresAtual.map((ind) => (
                        <LinhaIndicador
                          key={ind.chave}
                          indicador={ind}
                          expandido={expandidos.has(ind.chave)}
                          onToggleInfo={toggleInfo}
                          carregando={carregando}
                          onClick={() => router.push(construirUrl(ind.navegacao))}
                        />
                      ))}
                    </>
                  )}

                </LinhaModulo>

                <LinhaModulo
                  titulo="Imóveis e Kitnets"
                  resumo={resumoImoveisTexto}
                  icone={Building2}
                  expansivel
                  aberto={imoveisAberto}
                  onToggle={() => setImoveisAberto((v) => !v)}
                >

                  {erroImoveis && (
                    <div className="px-6 pb-4 pt-1">
                      <div className="flex items-center justify-between gap-3 flex-wrap rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                        <span className="text-xs text-red-300">{erroImoveis}</span>
                        <button
                          onClick={carregar}
                          className="text-xs font-semibold text-red-200 hover:text-white underline shrink-0"
                        >
                          Tentar novamente
                        </button>
                      </div>
                    </div>
                  )}

                  {indicadoresImoveis.map((ind) => (
                    <LinhaIndicador
                      key={ind.chave}
                      indicador={ind}
                      expandido={expandidos.has(ind.chave)}
                      onToggleInfo={toggleInfo}
                      carregando={carregando}
                      onClick={() => router.push(construirUrl(ind.navegacao))}
                    />
                  ))}

                </LinhaModulo>

                <LinhaModulo
                  titulo="Contratos"
                  resumo={resumoContratosTexto}
                  icone={FileText}
                  expansivel
                  aberto={contratosAberto}
                  onToggle={() => setContratosAberto((v) => !v)}
                >

                  {erroContratos && (
                    <div className="px-6 pb-4 pt-1">
                      <div className="flex items-center justify-between gap-3 flex-wrap rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                        <span className="text-xs text-red-300">{erroContratos}</span>
                        <button
                          onClick={carregar}
                          className="text-xs font-semibold text-red-200 hover:text-white underline shrink-0"
                        >
                          Tentar novamente
                        </button>
                      </div>
                    </div>
                  )}

                  {indicadoresContratos.map((ind) => (
                    <LinhaIndicador
                      key={ind.chave}
                      indicador={ind}
                      expandido={expandidos.has(ind.chave)}
                      onToggleInfo={toggleInfo}
                      carregando={carregando}
                      onClick={() => router.push(construirUrl(ind.navegacao))}
                    />
                  ))}

                </LinhaModulo>

                <LinhaModulo
                  titulo="Solicitações e Vistorias"
                  resumo={resumoSolicVistTexto}
                  icone={ClipboardList}
                  expansivel
                  aberto={solicVistAberto}
                  onToggle={() => setSolicVistAberto((v) => !v)}
                >

                  {erroSolicVist && (
                    <div className="px-6 pb-4 pt-1">
                      <div className="flex items-center justify-between gap-3 flex-wrap rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                        <span className="text-xs text-red-300">{erroSolicVist}</span>
                        <button
                          onClick={carregar}
                          className="text-xs font-semibold text-red-200 hover:text-white underline shrink-0"
                        >
                          Tentar novamente
                        </button>
                      </div>
                    </div>
                  )}

                  {indicadoresSolicVist.map((ind) => (
                    <LinhaIndicador
                      key={ind.chave}
                      indicador={ind}
                      expandido={expandidos.has(ind.chave)}
                      onToggleInfo={toggleInfo}
                      carregando={carregando}
                      onClick={() => router.push(construirUrl(ind.navegacao))}
                    />
                  ))}

                </LinhaModulo>

              </div>

            </div>
          </FadeIn>

          {resumo?.geradoEm && (
            <FadeIn delay={0.26}>
              <p className="text-center text-xs text-[var(--text-muted)] mt-6">
                Última atualização: {new Date(resumo.geradoEm).toLocaleString("pt-BR")}
              </p>
            </FadeIn>
          )}

          </>
          )}

        </PageContainer>

      </Page>

    </MainLayout>

  );

}
