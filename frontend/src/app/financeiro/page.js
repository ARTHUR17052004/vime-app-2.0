"use client";

import { useEffect, useState } from "react";

import MainLayout from "../components/layout/MainLayout";

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
import PageHeader from "../components/common/PageHeader";


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

  useEffect(() => {
    const receitasSalvas = JSON.parse(
      localStorage.getItem(
        "vime-receitas"
      ) || "[]"
    );

    const despesasSalvas = JSON.parse(
      localStorage.getItem(
        "vime-despesas"
      ) || "[]"
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReceitas(receitasSalvas);
    setDespesas(despesasSalvas);

    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;

    localStorage.setItem(
      "vime-receitas",
      JSON.stringify(receitas)
    );

    localStorage.setItem(
      "vime-despesas",
      JSON.stringify(despesas)
    );
  }, [receitas, despesas, carregado]);

  const salvarReceita = (dados) => {
    setReceitas((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...dados,
      },
    ]);

    setModalOpen(false);
  };

  const salvarDespesa = (dados) => {
    setDespesas((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...dados,
      },
    ]);

    setModalOpen(false);
  };

  const excluirReceita = (id) => {
  if (!window.confirm("Excluir receita?"))
    return;

  setReceitas((prev) =>
    prev.filter((item) => item.id !== id)
  );
};

  const excluirDespesa = (id) => {
    if (!window.confirm("Excluir despesa?"))
      return;

    setDespesas((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const atualizarReceita = (
    id,
    novosDados
  ) => {
    setReceitas((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...novosDados,
            }
          : item
      )
    );
  };

  const atualizarDespesa = (
    id,
    novosDados
  ) => {
    setDespesas((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...novosDados,
            }
          : item
      )
    );
  };

  const marcarReceitaComoPaga = (id) => {
    setReceitas((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Pago",
            }
          : item
      )
    );
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

    return texto.includes(
      search.toLowerCase()
    );

  });

  const despesasFiltradas = despesas.filter((item) => {

    const texto = `
      ${item.descricao || ""}
      ${item.categoria || ""}
      ${item.fornecedor || ""}
    `.toLowerCase();

    return texto.includes(
      search.toLowerCase()
    );

  });

 return (
  <MainLayout>

    <Page>

  <PageContainer>

    <PageHeader
      total={receitas.length}
      onNovaReceita={() => {
        setTipoModal("receita");
        setModalOpen(true);
      }}
      onNovaDespesa={() => {
        setTipoModal("despesa");
        setModalOpen(true);
      }}
    />

    <FinanceiroStats
      receitaPrevista={receitaPrevista}
      totalDespesas={totalDespesas}
      lucroLiquido={lucroLiquido}
    />

    <FinanceiroFilters
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />

    <FinanceiroTabs
      abaSelecionada={abaSelecionada}
      setAbaSelecionada={setAbaSelecionada}
    />

    {abaSelecionada === "visao-geral" && (
      <div className="space-y-8">

        <FinanceiroDashboard
          receitas={receitas}
          despesas={despesas}
        />

        <FinanceiroReceitas
          receitas={receitas}
          onDelete={excluirReceita}
          onUpdate={atualizarReceita}
          onMarcarPago={marcarReceitaComoPaga}
        />

        <FinanceiroDespesas
          despesas={despesas}
          onDelete={excluirDespesa}
          onUpdate={atualizarDespesa}
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
        receitas={receitas}
        onDelete={excluirReceita}
        onUpdate={atualizarReceita}
        onMarcarPago={marcarReceitaComoPaga}
      />
    )}

    {abaSelecionada === "despesas" && (
      <FinanceiroDespesas
        despesas={despesas}
        onDelete={excluirDespesa}
        onUpdate={atualizarDespesa}
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