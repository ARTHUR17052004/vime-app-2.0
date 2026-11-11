/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import MainLayout from "../components/layout/MainLayout";

import { ReceitaService, DespesaService } from "@/services/financeiro.service";
import { AsaasService } from "@/services/asaas.service";
import { UnidadeService } from "@/services/unidades.service";
import { ContaPagamentoService } from "@/services/contaPagamento.service";

import FadeIn from "../components/ui/FadeIn";

import FinanceiroModal from "../components/financeiro/FinanceiroModal";

import ReceitaForm from "../components/financeiro/ReceitaForm";
import DespesaForm from "../components/financeiro/DespesaForm";

import FinanceiroRelatorios from "../components/financeiro/FinanceiroRelatorios";
import FinanceiroInadimplencia from "../components/financeiro/FinanceiroInadimplencia";
import FinanceiroFluxoCaixa from "../components/financeiro/FinanceiroFluxoCaixa";
import FinanceiroProximosVencimentos from "../components/financeiro/FinanceiroProximosVencimentos";
import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";

import FinanceiroStats from "../components/financeiro/FinanceiroStats";
import FinanceiroTabs from "../components/financeiro/FinanceiroTabs";
import FinanceiroReceitas from "../components/financeiro/FinanceiroReceitas";
import FinanceiroDespesas from "../components/financeiro/FinanceiroDespesas";
import FinanceiroAsaas from "../components/financeiro/FinanceiroAsaas";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import SemPermissao from "../components/ui/SemPermissao";
import ResidenciaFiltro from "../components/common/ResidenciaFiltro";

import { usePermissao } from "../../hooks/usePermissao";
import { socket } from "../../services/socket";
import { statusExibidoReceita } from "../../utils/statusReceita";
import { arredondarCentavos } from "../../utils/dinheiro";

export default function FinanceiroPage() {
  return (
    <Suspense fallback={null}>
      <FinanceiroPageConteudo />
    </Suspense>
  );
}

// useSearchParams() (lido aqui pra pré-aplicar o filtro que vem do
// VIME Insights) só funciona dentro de um Suspense -- sem isso o build
// de produção do Next recusa gerar a página.
function FinanceiroPageConteudo() {
  const podeVisualizar = usePermissao("financeiro.visualizar");
  const podeEditar = usePermissao("financeiro.editar");

  const [receitas, setReceitas] = useState([]);
  const [despesas, setDespesas] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);

  const [tipoModal, setTipoModal] =
    useState("receita");

  const [carregado, setCarregado] =
    useState(false);

  // Sem isso, uma falha ao buscar (ex.: soluço de conexão com o banco)
  // deixava a tela inteira zerada sem nenhum aviso -- parecia que o
  // locador não tinha receita nenhuma cadastrada (ver bug de 10/11/2026).
  const [erroCarregamento, setErroCarregamento] =
    useState(false);

  const [abaSelecionada, setAbaSelecionada] =
    useState("visao-geral");

  const [search, setSearch] =
    useState("");

  const [residenciaSelecionada, setResidenciaSelecionada] =
    useState("");

  // Só pro título do relatório (PDF/Excel) -- ResidenciaFiltro busca a
  // própria lista internamente e não a expõe, então busca de novo aqui
  // só pra resolver o id escolhido num nome.
  const [residencias, setResidencias] =
    useState([]);

  useEffect(() => {

    async function carregarResidencias() {
      try {
        const resposta = await UnidadeService.listar();
        setResidencias(Array.isArray(resposta) ? resposta : resposta.data || []);
      } catch (err) {
        console.error("Erro ao carregar residências:", err);
      }
    }

    carregarResidencias();

  }, []);

  const nomeResidenciaSelecionada = residencias.find(
    (r) => r.id === residenciaSelecionada
  )?.nome;

  const [ordenacao, setOrdenacao] =
    useState("vencimento-proximo");

  // Por padrão, sempre o mês atual inteiro (dia 1 até o último dia) --
  // recalculado toda vez que a tela abre, então troca sozinho quando o
  // mês vira. Usuário ainda pode mudar (ou "Limpar") pra ver outro
  // período. SEM o "até" aqui, uma cobrança já emitida de antemão pro
  // mês seguinte (ex.: recorrência gerada com alguns dias de
  // antecedência) entrava nos cards de totais do mês atual antes da
  // hora -- só deve contar no mês do vencimento dela.
  const [dataDe, setDataDe] = useState(() => {
    const agora = new Date();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    return `${agora.getFullYear()}-${mes}-01`;
  });

  const [dataAte, setDataAte] = useState(() => {
    const agora = new Date();
    const ultimoDia = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);
    const mes = String(ultimoDia.getMonth() + 1).padStart(2, "0");
    const dia = String(ultimoDia.getDate()).padStart(2, "0");
    return `${ultimoDia.getFullYear()}-${mes}-${dia}`;
  });

  const [statusFiltro, setStatusFiltro] = useState("");

  const [contas, setContas] = useState([]);
  const [contaFiltro, setContaFiltro] = useState("");

  useEffect(() => {

    async function carregarContas() {
      try {
        const resposta = await ContaPagamentoService.listar();
        setContas(Array.isArray(resposta) ? resposta : resposta.data || []);
      } catch (err) {
        console.error("Erro ao carregar contas:", err);
      }
    }

    carregarContas();

  }, []);

  // Chegou aqui vindo do VIME Insights (ex.: "12 cobranças atrasadas"
  // -> clica -> abre direto filtrado)? Lê os parâmetros da URL uma vez,
  // na entrada, e já pré-aplica aba/status/período -- sem isso o clique
  // no indicador levaria só até a tela, sem o filtro de verdade.
  const searchParams = useSearchParams();

  useEffect(() => {

    const aba = searchParams.get("aba");
    const status = searchParams.get("status");
    const de = searchParams.get("de");
    const ate = searchParams.get("ate");

    if (aba) setAbaSelecionada(aba);
    if (status) setStatusFiltro(status);
    if (de) setDataDe(de);
    if (ate) setDataAte(ate);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregar = useCallback(async () => {

    try {

      const [receitasResp, despesasResp] = await Promise.all([
        ReceitaService.listar(),
        DespesaService.listar(),
      ]);

      setReceitas(
        Array.isArray(receitasResp) ? receitasResp : receitasResp.data || []
      );

      setDespesas(
        Array.isArray(despesasResp) ? despesasResp : despesasResp.data || []
      );

      setErroCarregamento(false);

    } catch (err) {

      console.error("Erro ao carregar dados financeiros:", err);

      setErroCarregamento(true);

    } finally {

      setCarregado(true);

    }

  }, []);

  useEffect(() => {

    carregar();

    // Receita/despesa pode mudar sozinha (banco confirmando pagamento,
    // job de vencimento, OU outra guia/usuário criando e editando) sem
    // ninguém mexer nesta tela -- sem isso, só aparecia atualizado
    // depois de dar F5.
    function aoAtualizar(evento) {
      if (evento?.tipo === "receita" || evento?.tipo === "despesa") {
        carregar();
      }
    }

    socket.on("dados:atualizados", aoAtualizar);

    return () => {
      socket.off("dados:atualizados", aoAtualizar);
    };

  }, [carregar]);

  const salvarReceita = async (dados) => {

    try {

      await ReceitaService.criar(dados);

      await carregar();

      setModalOpen(false);

    } catch (err) {

      alert(err.message || "Erro ao salvar receita.");

    }

  };

  const salvarDespesa = async (dados) => {

    try {

      await DespesaService.criar(dados);

      await carregar();

      setModalOpen(false);

    } catch (err) {

      alert(err.message || "Erro ao salvar despesa.");

    }

  };

  // Confirmação de verdade (motivo + senha) já acontece no
  // ReceitaExcluirModal antes de chamar isto aqui -- sem o
  // window.confirm de antes, que virou redundante. Precisa deixar o
  // erro subir (não só alert) pra ele ficar mostrado dentro do modal
  // em vez de fechar como se tivesse dado certo.
  const excluirReceita = async (id, dados) => {

    try {

      await ReceitaService.excluir(id, dados);

      await carregar();

    } catch (err) {

      throw err;

    }

  };

  const excluirDespesa = async (id) => {

    if (!window.confirm("Excluir despesa?"))
      return;

    try {

      await DespesaService.excluir(id);

      await carregar();

    } catch (err) {

      alert(err.message || "Erro ao excluir despesa.");

    }

  };

  const atualizarReceita = async (
    id,
    novosDados
  ) => {

    try {

      await ReceitaService.atualizar(id, novosDados);

      await carregar();

    } catch (err) {

      alert(err.message || "Erro ao atualizar receita.");

      // Repassa pra quem chamou (ex.: o modal de edição com a trava de
      // senha pra mudar o valor) saber que falhou e não fechar sozinho
      // como se tivesse dado certo.
      throw err;

    }

  };

  const atualizarDespesa = async (
    id,
    novosDados
  ) => {

    try {

      await DespesaService.atualizar(id, novosDados);

      await carregar();

    } catch (err) {

      alert(err.message || "Erro ao atualizar despesa.");

    }

  };

  const fixarReceita = async (id, fixado) => {

    try {

      await ReceitaService.atualizar(id, { fixado });

      await carregar();

    } catch (err) {

      alert(err.message || "Erro ao fixar receita.");

    }

  };

  const arquivarReceita = async (id, arquivadaNoHistorico) => {

    try {

      await ReceitaService.atualizar(id, { arquivadaNoHistorico });

      await carregar();

    } catch (err) {

      alert(err.message || "Erro ao mover receita pro histórico.");

    }

  };

  const toggleRecorrenteReceita = async (id, recorrente) => {

    try {

      await ReceitaService.atualizar(id, { recorrente });

      await carregar();

    } catch (err) {

      alert(err.message || "Erro ao atualizar a recorrência.");

    }

  };

  const fixarDespesa = async (id, fixado) => {

    try {

      await DespesaService.atualizar(id, { fixado });

      await carregar();

    } catch (err) {

      alert(err.message || "Erro ao fixar despesa.");

    }

  };

  const marcarReceitaComoPaga = async (id) => {

    try {

      await ReceitaService.atualizar(id, {
        status: "PAGA",
        dataPagamento: new Date().toISOString(),
      });

      await carregar();

    } catch (err) {

      alert(err.message || "Erro ao marcar receita como paga.");

    }

  };

  // A rota é "/asaas/transacoes/:id/enviar" por causa do nome antigo,
  // mas resolve o gateway certo pra cada receita (BB, EFI, BRB ou
  // Asaas, conforme a conta vinculada à kitnet/locador) -- é o mesmo
  // caminho de envio usado em todo o sistema.
  const enviarCobranca = async (id) => {

    try {

      await AsaasService.enviarCobranca(id);

      await carregar();

    } catch (err) {

      alert(err.message || "Erro ao enviar cobrança ao banco.");

    }

  };

  const dentroDoIntervalo = (data) => {

    if (!dataDe && !dataAte) return true;
    if (!data) return false;

    const valor = new Date(data).getTime();

    if (dataDe && valor < new Date(dataDe).getTime()) return false;
    if (dataAte && valor > new Date(dataAte).getTime() + 86399999) return false;

    return true;

  };

  const COMPARADORES_FINANCEIRO = {
    "vencimento-proximo": (a, b) => new Date(a.vencimento || 0) - new Date(b.vencimento || 0),
    "vencimento-distante": (a, b) => new Date(b.vencimento || 0) - new Date(a.vencimento || 0),
    "valor-maior": (a, b) => (b.valor || 0) - (a.valor || 0),
    "valor-menor": (a, b) => (a.valor || 0) - (b.valor || 0),
    "status": (a, b) => (a.status || "").localeCompare(b.status || "", "pt-BR"),
    // Kitnet.numero é string ("01", "02"...), por isso a comparação
    // numérica (localeCompare com numeric:true) -- senão "11" vem antes
    // de "3" (ordem de texto). Agrupa por Residência primeiro, pra não
    // misturar kitnet 3 da VIME I com kitnet 3 da VIME II quando o
    // filtro de Residência está em "Todas".
    "kitnet": (a, b) => {
      const unidadeA = a.contrato?.unidade?.nome || a.inquilino?.kitnet?.unidade?.nome || "";
      const unidadeB = b.contrato?.unidade?.nome || b.inquilino?.kitnet?.unidade?.nome || "";
      const porResidencia = unidadeA.localeCompare(unidadeB, "pt-BR");
      if (porResidencia !== 0) return porResidencia;

      const numeroA = a.contrato?.kitnet?.numero ?? a.inquilino?.kitnet?.numero ?? "";
      const numeroB = b.contrato?.kitnet?.numero ?? b.inquilino?.kitnet?.numero ?? "";
      return String(numeroA).localeCompare(String(numeroB), undefined, { numeric: true, sensitivity: "base" });
    },
  };

  const ordenarFinanceiro = COMPARADORES_FINANCEIRO[ordenacao] || COMPARADORES_FINANCEIRO["vencimento-proximo"];

  // Enviada pro histórico some só da LISTA de Receitas (ver abaixo,
  // receitasListaVisivel) -- continua contando nos cards de totais e
  // no Fluxo de Caixa/Relatórios normalmente, porque o dinheiro foi
  // emitido/pago de verdade nesse mês. "Histórico" é só organização da
  // lista, nunca deixa de contabilizar nada.
  const receitasHistorico = receitas.filter((item) => item.arquivadaNoHistorico);

  const receitasFiltradas = receitas.filter((item) => {

    // A maioria das receitas é lançada só com Inquilino, sem Contrato
    // nenhum vinculado (ver kitnetOcupacao/contratoService) -- olhar só
    // item.contrato escondia (quase) tudo ao filtrar por residência.
    const unidadeIdDaReceita = item.contrato?.unidadeId || item.inquilino?.kitnet?.unidadeId || null;
    const nomeUnidadeDaReceita = item.contrato?.unidade?.nome || item.inquilino?.kitnet?.unidade?.nome || "";
    const nomeKitnetDaReceita = item.contrato?.kitnet?.nome || item.inquilino?.kitnet?.nome || "";

    const texto = `
      ${item.descricao || ""}
      ${item.inquilino?.nome || item.contrato?.inquilino?.nome || item.pagadorNome || ""}
      ${nomeUnidadeDaReceita}
      ${nomeKitnetDaReceita}
    `.toLowerCase();

    if (!texto.includes(search.toLowerCase())) return false;

    if (
      residenciaSelecionada &&
      unidadeIdDaReceita !== residenciaSelecionada
    )
      return false;

    // "Não enviada ao banco" corta por fora do status normal (Pendente,
    // Atrasada...) -- é sobre ter sido mandada pro banco ou não, não
    // sobre vencimento. Mesmo critério do selo amarelo na lista.
    if (statusFiltro === "NAO_ENVIADA") {
      const naoEnviada =
        !item.gatewayReferencia &&
        item.status !== "PAGA" &&
        item.status !== "PAGO" &&
        item.status !== "CANCELADA";
      if (!naoEnviada) return false;
    } else if (
      // Mesmo critério usado pro selo na lista (statusExibidoReceita) --
      // senão filtrar por "Pendente" também trazia quem já estava "Em
      // Aberto" (PENDENTE por baixo, só mostrado diferente por já ter
      // sido enviada ao banco).
      statusFiltro && statusExibidoReceita(item).codigo !== statusFiltro
    ) return false;

    if (contaFiltro && item.contaPagamentoId !== contaFiltro) return false;

    if (!dentroDoIntervalo(item.vencimento)) return false;

    return true;

  }).sort(
    (a, b) => (b.fixado ? 1 : 0) - (a.fixado ? 1 : 0) || ordenarFinanceiro(a, b)
  );

  // Só pra exibição na lista de Receitas (Visão Geral e aba Receitas) --
  // os cards de totais e os outros painéis usam receitasFiltradas
  // direto, arquivada ou não. Cancelada também some da lista por
  // padrão (não polui a tela com cobrança que não vale mais, ex.:
  // duplicata cancelada depois do apagão de 11/2026) -- só aparece se
  // o usuário escolher "Cancelada" no filtro de Status de propósito.
  const receitasListaVisivel = receitasFiltradas.filter(
    (item) => !item.arquivadaNoHistorico && (statusFiltro === "CANCELADA" || item.status !== "CANCELADA")
  );

  const despesasFiltradas = despesas.filter((item) => {

    const texto = `
      ${item.descricao || ""}
      ${item.categoria || ""}
      ${item.fornecedor || ""}
    `.toLowerCase();

    if (!texto.includes(search.toLowerCase())) return false;

    if (
      residenciaSelecionada &&
      item.unidadeId !== residenciaSelecionada
    )
      return false;

    if (!dentroDoIntervalo(item.vencimento)) return false;

    return true;

  }).sort(
    (a, b) => (b.fixado ? 1 : 0) - (a.fixado ? 1 : 0) || ordenarFinanceiro(a, b)
  );

  // Os 4 cards do topo seguem o MESMO filtro da tabela abaixo (busca,
  // status, residência, período) -- antes somavam tudo que já foi
  // cadastrado, sem nenhum filtro, e dava a impressão de número
  // errado quando a tabela estava filtrada por um período menor.
  // CANCELADA nunca entra -- não é "receita prevista" nenhuma, é uma
  // cobrança que não vale mais (ex.: duplicata cancelada depois do
  // apagão de 11/2026).
  const receitaPrevista = arredondarCentavos(
    receitasFiltradas
      .filter((item) => item.status !== "CANCELADA")
      .reduce(
        (total, item) =>
          total + Number(item.valor || 0),
        0
      )
  );

  const totalDespesas = arredondarCentavos(
    despesasFiltradas.reduce(
      (total, item) =>
        total + Number(item.valor || 0),
      0
    )
  );

  // Diferente de "Receita Prevista" (que soma tudo, pago ou não) --
  // isso aqui é o que REALMENTE entrou/saiu da conta: só receita
  // já PAGA (e no valor líquido, depois da taxa de boleto -- não é
  // lucro o que o banco descontou) menos só despesa já PAGA. Pendente,
  // atrasada e taxa de boleto não contam, de propósito.
  const lucroLiquido = arredondarCentavos(
    receitasFiltradas
      .filter((item) => item.status === "PAGO" || item.status === "PAGA")
      .reduce((total, item) => total + Number(item.valorLiquido ?? item.valor ?? 0), 0)
    -
    despesasFiltradas
      .filter((item) => item.status === "PAGO" || item.status === "PAGA")
      .reduce((total, item) => total + Number(item.valor || 0), 0)
  );

  const estaVencido = (item) =>
    item.vencimento &&
    item.vencimento.slice(0, 10) < new Date().toISOString().split("T")[0] &&
    item.status !== "PAGO" &&
    item.status !== "PAGA" &&
    item.status !== "CANCELADA";

  const vencidos = arredondarCentavos(
    [...receitasFiltradas, ...despesasFiltradas]
      .filter(estaVencido)
      .reduce((total, item) => total + Number(item.valor || 0), 0)
  );

  // Independente dos filtros da tela (busca, período, status) --
  // sempre o mês corrente de verdade, por dataPagamento (não
  // vencimento), pra zerar sozinho todo dia 1. Usa `receitas` cru (não
  // `receitasFiltradas`), senão um filtro de período aplicado na tela
  // esconderia esse card também.
  const recebidoNoMes = (() => {

    const agora = new Date();
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
    const inicioProximoMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 1);

    return arredondarCentavos(
      receitas
        .filter((item) => (item.status === "PAGO" || item.status === "PAGA") && item.dataPagamento)
        .filter((item) => {
          const dataPagamento = new Date(item.dataPagamento);
          return dataPagamento >= inicioMes && dataPagamento < inicioProximoMes;
        })
        .reduce((total, item) => total + Number(item.valorLiquido ?? item.valor ?? 0), 0)
    );

  })();

  // Só das pagas -- taxa de boleto de uma cobrança ainda pendente
  // nunca "aconteceu" de verdade (pode nem chegar a ser paga, cair
  // vencida, etc). Sem valorLiquido preenchido, não entra na conta
  // (nunca assume uma taxa que não foi calculada).
  const taxasBoleto = arredondarCentavos(
    receitasFiltradas
      .filter((item) => (item.status === "PAGO" || item.status === "PAGA") && item.valorLiquido != null)
      .reduce((total, item) => total + (Number(item.valor) - Number(item.valorLiquido)), 0)
  );

  const limparFiltros = () => {
    setSearch("");
    setResidenciaSelecionada("");
    setDataDe("");
    setDataAte("");
    setStatusFiltro("");
    setContaFiltro("");
    setOrdenacao("vencimento-proximo");
  };

 if (!podeVisualizar) {
    return <SemPermissao />;
  }

 if (!carregado) {
    return (
      <MainLayout>
        <div className="py-32 text-center text-[var(--text-subtle)]">
          Carregando dados financeiros...
        </div>
      </MainLayout>
    );
  }

 return (
  <MainLayout>

    <Page>

  <PageContainer>

    <FadeIn>
      <PageHeader
        title="Financeiro"
        subtitle="Gerencie receitas, despesas e o fluxo de caixa do sistema."
        count={receitas.length}
        countLabel="receita(s) cadastrada(s)"
        actions={
          podeEditar && (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setTipoModal("despesa");
                  setModalOpen(true);
                }}
              >
                + Nova Despesa
              </Button>

              <Button
                onClick={() => {
                  setTipoModal("receita");
                  setModalOpen(true);
                }}
              >
                + Nova Receita
              </Button>
            </>
          )
        }
      />
    </FadeIn>

    {erroCarregamento && (
      <FadeIn>
        <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          Não foi possível carregar os dados financeiros agora (os números abaixo podem estar incompletos ou zerados). Tente recarregar a página em alguns instantes.
        </div>
      </FadeIn>
    )}

    <FadeIn delay={0.10}>
      <FinanceiroStats
        receitaPrevista={receitaPrevista}
        totalDespesas={totalDespesas}
        vencidos={vencidos}
        lucroLiquido={lucroLiquido}
        taxasBoleto={taxasBoleto}
        recebidoNoMes={recebidoNoMes}
      />
    </FadeIn>

    <FadeIn delay={0.20}>
      <div className="mt-8 bg-[var(--surface)] backdrop-blur-[24px] rounded-2xl border border-[var(--border-token)] p-6">

        <div className="mb-6">

          <h2 className="text-xl font-bold text-[var(--text)]">
            Filtros
          </h2>

          <p className="text-[var(--text-subtle)] mt-1">
            Localize rapidamente qualquer receita ou despesa.
          </p>

        </div>

        <div className="mb-5">
          <label className="block text-xs text-[var(--text-faint)] mb-1.5">
            Pesquisar
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Descrição, inquilino, kitnet..."
            className="w-full rounded-xl p-3 bg-[var(--surface-2)] border border-[var(--border-token)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">

          <div>
            <label className="block text-xs text-[var(--text-faint)] mb-1.5">
              Residência
            </label>
            <ResidenciaFiltro
              compact
              value={residenciaSelecionada}
              onChange={setResidenciaSelecionada}
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--text-faint)] mb-1.5">
              Data de
            </label>
            <input
              type="date"
              value={dataDe}
              onChange={(e) => setDataDe(e.target.value)}
              className="w-full h-11 border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl px-3 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--text-faint)] mb-1.5">
              até
            </label>
            <input
              type="date"
              value={dataAte}
              onChange={(e) => setDataAte(e.target.value)}
              className="w-full h-11 border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl px-3 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--text-faint)] mb-1.5">
              Status
            </label>
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="w-full h-11 border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl px-3 text-sm"
            >
              <option value="" className="bg-[#1b2430]">Todos</option>
              <option value="PENDENTE" className="bg-[#1b2430]">Pendente</option>
              <option value="EM_ABERTO" className="bg-[#1b2430]">Em Aberto</option>
              <option value="ATRASADA" className="bg-[#1b2430]">Atrasada</option>
              <option value="NAO_ENVIADA" className="bg-[#1b2430]">Não enviada ao banco</option>
              <option value="PAGA" className="bg-[#1b2430]">Paga</option>
              <option value="CANCELADA" className="bg-[#1b2430]">Cancelada</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-[var(--text-faint)] mb-1.5">
              Conta
            </label>
            <select
              value={contaFiltro}
              onChange={(e) => setContaFiltro(e.target.value)}
              className="w-full h-11 border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl px-3 text-sm"
            >
              <option value="" className="bg-[#1b2430]">Todas</option>
              {contas.map((conta) => (
                <option key={conta.id} value={conta.id} className="bg-[#1b2430]">
                  {conta.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={limparFiltros}
              className="
                w-full
                h-11
                border
                border-[var(--border-token)]
                text-[var(--text-1)]
                hover:bg-[var(--surface-2)]
                rounded-xl
                text-sm
              "
            >
              Limpar filtros
            </button>
          </div>

        </div>

      </div>
    </FadeIn>

    <FadeIn delay={0.25}>
      <FinanceiroTabs
        abaSelecionada={abaSelecionada}
        setAbaSelecionada={setAbaSelecionada}
      />
    </FadeIn>

    <FadeIn delay={0.30}>

    {abaSelecionada === "visao-geral" && (
      <div className="space-y-8">

        <FinanceiroReceitas
          receitas={receitasListaVisivel}
          contas={contas}
          ordenacao={ordenacao}
          onOrdenar={setOrdenacao}
          onDelete={excluirReceita}
          onUpdate={atualizarReceita}
          onMarcarPago={marcarReceitaComoPaga}
          onEnviarCobranca={enviarCobranca}
          onFixar={fixarReceita}
          onToggleRecorrente={toggleRecorrenteReceita}
          onArquivar={arquivarReceita}
          onNovo={() => {
            setTipoModal("receita");
            setModalOpen(true);
          }}
        />

        <FinanceiroDespesas
          despesas={despesasFiltradas}
          ordenacao={ordenacao}
          onOrdenar={setOrdenacao}
          onDelete={excluirDespesa}
          onUpdate={atualizarDespesa}
          onFixar={fixarDespesa}
          onNovo={() => {
            setTipoModal("despesa");
            setModalOpen(true);
          }}
        />

        <FinanceiroProximosVencimentos
          receitas={receitasFiltradas}
        />

        <FinanceiroInadimplencia
          receitas={receitasFiltradas}
        />

        <FinanceiroRelatorios
          receitas={receitasFiltradas}
          despesas={despesasFiltradas}
          nomeResidencia={nomeResidenciaSelecionada}
          dataDe={dataDe}
          dataAte={dataAte}
        />

      </div>
    )}

    {abaSelecionada === "receitas" && (
      <FinanceiroReceitas
        receitas={receitasListaVisivel}
        contas={contas}
        ordenacao={ordenacao}
        onOrdenar={setOrdenacao}
        onDelete={excluirReceita}
        onUpdate={atualizarReceita}
        onMarcarPago={marcarReceitaComoPaga}
        onEnviarCobranca={enviarCobranca}
        onFixar={fixarReceita}
        onToggleRecorrente={toggleRecorrenteReceita}
        onArquivar={arquivarReceita}
        onNovo={() => {
          setTipoModal("receita");
          setModalOpen(true);
        }}
      />
    )}

    {abaSelecionada === "historico" && (
      <FinanceiroReceitas
        receitas={receitasHistorico}
        contas={contas}
        ordenacao={ordenacao}
        onOrdenar={setOrdenacao}
        titulo="Histórico de Pagamentos"
        subtitulo="Receitas já pagas, enviadas pra cá pra não acumular na lista de Receitas."
        onDelete={excluirReceita}
        onUpdate={atualizarReceita}
        onMarcarPago={marcarReceitaComoPaga}
        onEnviarCobranca={enviarCobranca}
        onFixar={fixarReceita}
        onToggleRecorrente={toggleRecorrenteReceita}
        onArquivar={arquivarReceita}
        onNovo={() => {
          setTipoModal("receita");
          setModalOpen(true);
        }}
      />
    )}

    {abaSelecionada === "despesas" && (
      <FinanceiroDespesas
        despesas={despesasFiltradas}
        ordenacao={ordenacao}
        onOrdenar={setOrdenacao}
        onDelete={excluirDespesa}
        onUpdate={atualizarDespesa}
        onFixar={fixarDespesa}
        onNovo={() => {
          setTipoModal("despesa");
          setModalOpen(true);
        }}
      />
    )}

    {abaSelecionada === "fluxo-caixa" && (
      <FinanceiroFluxoCaixa
        receitas={receitasFiltradas}
        despesas={despesasFiltradas}
      />
    )}

    {abaSelecionada === "asaas" && (
      <FinanceiroAsaas />
    )}

    </FadeIn>

    <FinanceiroModal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
    >
      {tipoModal === "receita" ? (
        <ReceitaForm
          onSave={salvarReceita}
        />
      ) : (
        <DespesaForm
          onSave={salvarDespesa}
        />
      )}
    </FinanceiroModal>

      </PageContainer>

    </Page>
    
  </MainLayout>
)}