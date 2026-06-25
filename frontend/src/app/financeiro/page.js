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
import FinanceiroResumo from "../components/financeiro/FinanceiroResumo";
import FinanceiroFiltros from "../components/financeiro/FinanceiroFiltros";
import FinanceiroTabs from "../components/financeiro/FinanceiroTabs";
import FinanceiroReceitas from "../components/financeiro/FinanceiroReceitas";
import FinanceiroDespesas from "../components/financeiro/FinanceiroDespesas";
import FinanceiroAsaas from "../components/financeiro/FinanceiroAsaas";

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

  const [filtroSelecionado, setFiltroSelecionado] =
    useState("Este Mês");

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

 return (
  <MainLayout>

    <div className="flex items-center justify-between mb-8">

      <div>
        <h1 className="text-4xl font-bold text-gray-800">
          Financeiro
        </h1>

        <p className="text-gray-500 mt-2">
          Controle financeiro
        </p>
      </div>

      <div className="flex gap-3">

        <button
          onClick={() => {
            setTipoModal("receita");
            setModalOpen(true);
          }}
          className="
            bg-green-700
            text-white
            px-6
            py-3
            rounded-xl
          "
        >
          + Nova Receita
        </button>

        <button
          onClick={() => {
            setTipoModal("despesa");
            setModalOpen(true);
          }}
          className="
            bg-white
            border
            px-6
            py-3
            rounded-xl
          "
        >
          + Nova Despesa
        </button>

      </div>

    </div>

    <FinanceiroResumo
      receitaPrevista={receitaPrevista}
      totalDespesas={totalDespesas}
      lucroLiquido={lucroLiquido}
    />

    <FinanceiroFiltros
      filtroSelecionado={filtroSelecionado}
      setFiltroSelecionado={setFiltroSelecionado}
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

  </MainLayout>
)}