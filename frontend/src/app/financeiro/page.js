/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useCallback, useEffect, useState } from "react";

import MainLayout from "../components/layout/MainLayout";

import { ReceitaService, DespesaService } from "@/services/financeiro.service";

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
import ResidenciaFiltro from "../components/common/ResidenciaFiltro";


export default function FinanceiroPage() {
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
        status: "PAGO",
        dataPagamento: new Date().toISOString(),
      });

      await carregar();

    } catch (err) {

      alert(err.message || "Erro ao marcar receita como paga.");

    }

  };

  const receitaPrevista =
    receitas.reduce(
      (total, item) =>
        total + Number(item.valor || 0),
      0
    );

  const totalDespesas =
    despesas.reduce(
      (total, item) =>
        total + Number(item.valor || 0),
      0
    );

  const lucroLiquido =
    receitaPrevista - totalDespesas;

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

    return true;

  }).sort(
    (a, b) => (b.fixado ? 1 : 0) - (a.fixado ? 1 : 0)
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

    return true;

  }).sort(
    (a, b) => (b.fixado ? 1 : 0) - (a.fixado ? 1 : 0)
  );

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
        }
      />
    </FadeIn>

    <FadeIn delay={0.10}>
      <FinanceiroStats
        receitaPrevista={receitaPrevista}
        totalDespesas={totalDespesas}
        lucroLiquido={lucroLiquido}
      />
    </FadeIn>

    <FadeIn delay={0.20}>
      <FinanceiroFilters
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="mt-4">
        <ResidenciaFiltro
          value={residenciaSelecionada}
          onChange={setResidenciaSelecionada}
        />
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
          receitas={receitas}
        />

        <FinanceiroInadimplencia
          receitas={receitas}
        />

        <FinanceiroRelatorios
          receitas={receitas}
          despesas={despesas}
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
        receitas={receitas}
        despesas={despesas}
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