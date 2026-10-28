/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import MainLayout from "../components/layout/MainLayout";

import { ReceitaService, DespesaService } from "@/services/financeiro.service";
import { UnidadeService } from "@/services/unidades.service";

import FadeIn from "../components/ui/FadeIn";

import FinanceiroModal from "../components/financeiro/FinanceiroModal";

import ReceitaForm from "../components/financeiro/ReceitaForm";
import DespesaForm from "../components/financeiro/DespesaForm";

import FinanceiroRelatorios from "../components/financeiro/FinanceiroRelatorios";
import FinanceiroDashboard from "../components/financeiro/FinanceiroDashboard";
import FinanceiroInadimplencia from "../components/financeiro/FinanceiroInadimplencia";
import FinanceiroFluxoCaixa from "../components/financeiro/FinanceiroFluxoCaixa";
import FinanceiroProximosVencimentos from "../components/financeiro/FinanceiroProximosVencimentos";
import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";

import FinanceiroStats from "../components/financeiro/FinanceiroStats";
import FinanceiroFilters from "../components/financeiro/FinanceiroFilters";
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

  const [dataDe, setDataDe] = useState("");

  const [dataAte, setDataAte] = useState("");

  const [statusFiltro, setStatusFiltro] = useState("");

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

    } catch (err) {

      console.error("Erro ao carregar dados financeiros:", err);

    } finally {

      setCarregado(true);

    }

  }, []);

  useEffect(() => {

    carregar();

    // Receita pode mudar de status sozinha (banco confirmando
    // pagamento, job de vencimento) sem ninguém mexer nesta tela --
    // sem isso, só aparecia atualizado depois de dar F5.
    function aoAtualizar(evento) {
      if (evento?.tipo === "receita") {
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

  const excluirReceita = async (id) => {

    if (!window.confirm("Excluir receita?"))
      return;

    try {

      await ReceitaService.excluir(id);

      await carregar();

    } catch (err) {

      alert(err.message || "Erro ao excluir receita.");

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
  };

  const ordenarFinanceiro = COMPARADORES_FINANCEIRO[ordenacao] || COMPARADORES_FINANCEIRO["vencimento-proximo"];

  const receitasFiltradas = receitas.filter((item) => {

    const texto = `
      ${item.descricao || ""}
      ${item.inquilino || ""}
      ${item.unidade || ""}
      ${item.kitnet || ""}
    `.toLowerCase();

    if (!texto.includes(search.toLowerCase())) return false;

    if (
      residenciaSelecionada &&
      item.contrato?.unidadeId !== residenciaSelecionada
    )
      return false;

    if (statusFiltro && item.status !== statusFiltro) return false;

    if (!dentroDoIntervalo(item.vencimento)) return false;

    return true;

  }).sort(
    (a, b) => (b.fixado ? 1 : 0) - (a.fixado ? 1 : 0) || ordenarFinanceiro(a, b)
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
  const receitaPrevista =
    receitasFiltradas.reduce(
      (total, item) =>
        total + Number(item.valor || 0),
      0
    );

  const totalDespesas =
    despesasFiltradas.reduce(
      (total, item) =>
        total + Number(item.valor || 0),
      0
    );

  // Diferente de "Receita Prevista" (que soma tudo, pago ou não) --
  // isso aqui é o que REALMENTE entrou/saiu da conta: só receita
  // já PAGA (e no valor líquido, depois da taxa de boleto -- não é
  // lucro o que o banco descontou) menos só despesa já PAGA. Pendente,
  // atrasada e taxa de boleto não contam, de propósito.
  const lucroLiquido =
    receitasFiltradas
      .filter((item) => item.status === "PAGO" || item.status === "PAGA")
      .reduce((total, item) => total + Number(item.valorLiquido ?? item.valor ?? 0), 0)
    -
    despesasFiltradas
      .filter((item) => item.status === "PAGO" || item.status === "PAGA")
      .reduce((total, item) => total + Number(item.valor || 0), 0);

  const estaVencido = (item) =>
    item.vencimento &&
    item.vencimento.slice(0, 10) < new Date().toISOString().split("T")[0] &&
    item.status !== "PAGO" &&
    item.status !== "PAGA";

  const vencidos =
    [...receitasFiltradas, ...despesasFiltradas]
      .filter(estaVencido)
      .reduce((total, item) => total + Number(item.valor || 0), 0);

  // Só das pagas -- taxa de boleto de uma cobrança ainda pendente
  // nunca "aconteceu" de verdade (pode nem chegar a ser paga, cair
  // vencida, etc). Sem valorLiquido preenchido, não entra na conta
  // (nunca assume uma taxa que não foi calculada).
  const taxasBoleto = Math.round(
    receitasFiltradas
      .filter((item) => (item.status === "PAGO" || item.status === "PAGA") && item.valorLiquido != null)
      .reduce((total, item) => total + (Number(item.valor) - Number(item.valorLiquido)), 0) * 100
  ) / 100;

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

    <FadeIn delay={0.10}>
      <FinanceiroStats
        receitaPrevista={receitaPrevista}
        totalDespesas={totalDespesas}
        vencidos={vencidos}
        lucroLiquido={lucroLiquido}
        taxasBoleto={taxasBoleto}
      />
    </FadeIn>

    <FadeIn delay={0.20}>
      <FinanceiroFilters
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="mt-4 flex flex-col md:flex-row gap-4">

        <div className="flex-1">
          <ResidenciaFiltro
            value={residenciaSelecionada}
            onChange={setResidenciaSelecionada}
          />
        </div>

        <div className="flex items-center gap-3">

          <div>
            <label className="block text-xs text-[var(--text-faint)] mb-1.5">
              Data de
            </label>
            <input
              type="date"
              value={dataDe}
              onChange={(e) => setDataDe(e.target.value)}
              className="border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl p-3"
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
              className="border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-xl p-3"
            />
          </div>

          {(dataDe || dataAte) && (
            <button
              type="button"
              onClick={() => {
                setDataDe("");
                setDataAte("");
              }}
              className="mt-6 text-xs text-[var(--text-faint)] hover:text-[var(--text)] underline"
            >
              Limpar
            </button>
          )}

        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-[var(--text-subtle)] whitespace-nowrap">
            Status
          </label>
          <select
            value={statusFiltro}
            onChange={(e) => setStatusFiltro(e.target.value)}
            className="border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-lg px-3 py-2 text-sm"
          >
            <option value="" className="bg-[#1b2430]">Todos</option>
            <option value="PENDENTE" className="bg-[#1b2430]">Pendente</option>
            <option value="ATRASADA" className="bg-[#1b2430]">Atrasada</option>
            <option value="PAGA" className="bg-[#1b2430]">Paga</option>
            <option value="CANCELADA" className="bg-[#1b2430]">Cancelada</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-[var(--text-subtle)] whitespace-nowrap">
            Organizar por
          </label>
          <select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-lg px-3 py-2 text-sm"
          >
            <option value="vencimento-proximo" className="bg-[#1b2430]">Vencimento (mais próximo)</option>
            <option value="vencimento-distante" className="bg-[#1b2430]">Vencimento (mais distante)</option>
            <option value="valor-maior" className="bg-[#1b2430]">Valor (maior)</option>
            <option value="valor-menor" className="bg-[#1b2430]">Valor (menor)</option>
            <option value="status" className="bg-[#1b2430]">Status</option>
          </select>
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

        <FinanceiroDashboard
          receitas={receitasFiltradas}
          despesas={despesasFiltradas}
        />

        <FinanceiroReceitas
          receitas={receitasFiltradas}
          onDelete={excluirReceita}
          onUpdate={atualizarReceita}
          onMarcarPago={marcarReceitaComoPaga}
          onFixar={fixarReceita}
          onToggleRecorrente={toggleRecorrenteReceita}
          onNovo={() => {
            setTipoModal("receita");
            setModalOpen(true);
          }}
        />

        <FinanceiroDespesas
          despesas={despesasFiltradas}
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
        receitas={receitasFiltradas}
        onDelete={excluirReceita}
        onUpdate={atualizarReceita}
        onMarcarPago={marcarReceitaComoPaga}
        onFixar={fixarReceita}
        onToggleRecorrente={toggleRecorrenteReceita}
        onNovo={() => {
          setTipoModal("receita");
          setModalOpen(true);
        }}
      />
    )}

    {abaSelecionada === "despesas" && (
      <FinanceiroDespesas
        despesas={despesasFiltradas}
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