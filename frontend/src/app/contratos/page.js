"use client";

import { useEffect, useState } from "react";

import MainLayout from "../components/layout/MainLayout";

import FadeIn from "../components/ui/FadeIn";
import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import PageSection from "../components/ui/PageSection";

import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";

import SearchInput from "../components/common/SearchInput";

import ContratoTabs from "../components/contratos/ContratoTabs";
import ContratoDashboard from "../components/contratos/ContratoDashboard";
import ContratoProximosVencimentos from "../components/contratos/ContratoProximosVencimentos";
import ContratoRelatorios from "../components/contratos/ContratoRelatorios";
import ContratoModal from "../components/contratos/ContratoModal";
import ContratoForm from "../components/contratos/ContratoForm";
import ContratoStats from "../components/contratos/ContratoStats";
import ContratoFilters from "../components/contratos/ContratoFilters";
import ContratoCardList from "../components/contratos/ContratoCardList";

export default function ContratosPage() {

  const [modalOpen, setModalOpen] =
    useState(false);

  const [abaSelecionada, setAbaSelecionada] =
    useState("visao-geral");

  const [filtroSelecionado, setFiltroSelecionado] =
    useState("Todos");

  const [contratos, setContratos] =
    useState([]);

  const [contratoEditando, setContratoEditando] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [carregado, setCarregado] =
    useState(false);

  useEffect(() => {

    const dados = JSON.parse(
      localStorage.getItem(
        "vime-contratos"
      ) || "[]"
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContratos(dados);

    setCarregado(true);

  }, []);

  useEffect(() => {

    if (!carregado) return;

    localStorage.setItem(
      "vime-contratos",
      JSON.stringify(contratos)
    );

  }, [contratos, carregado]);

  const novoContrato = () => {

    setContratoEditando(null);

    setModalOpen(true);

  };
  const salvarContrato = (dados) => {

  if (contratoEditando) {

    setContratos((prev) =>
      prev.map((item) =>
        item.id === contratoEditando.id
          ? {
              ...item,
              ...dados,
            }
          : item
      )
    );

  } else {

    setContratos((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...dados,
      },
    ]);

  }

  setContratoEditando(null);

  setModalOpen(false);

};

const editarContrato = (contrato) => {

  setContratoEditando(contrato);

  setModalOpen(true);

};

const excluirContrato = (id) => {

  const confirmar = window.confirm(
    "Deseja realmente excluir este contrato?"
  );

  if (!confirmar) return;

  setContratos((prev) =>
    prev.filter((item) => item.id !== id)
  );

};

const contratosFiltrados = contratos.filter((contrato) => {

  const termo = search.toLowerCase();

  const busca =

    contrato.inquilino
      ?.toLowerCase()
      .includes(termo) ||

    contrato.locador
      ?.toLowerCase()
      .includes(termo) ||

    contrato.unidade
      ?.toLowerCase()
      .includes(termo) ||

    contrato.kitnet
      ?.toLowerCase()
      .includes(termo);

  if (!busca) return false;

  if (filtroSelecionado === "Todos")
    return true;

  return (
    contrato.status ===
    filtroSelecionado
  );

});

const totalContratos =
  contratos.length;

const ativos =
  contratos.filter(
    (c) => c.status === "Ativo"
  ).length;

const encerrados =
  contratos.filter(
    (c) => c.status === "Encerrado"
  ).length;

const vencendo =
  contratos.filter(
    (c) => c.status === "Vencendo"
  ).length;
  return (

  <MainLayout>

    <Page>

      <PageContainer>

        <FadeIn>

          <PageHeader
            title="Contratos"
            subtitle="Gerencie todos os contratos do sistema."
            count={totalContratos}
            countLabel="contrato(s) cadastrado(s)"
            actions={
              <Button onClick={novoContrato}>
                + Novo Contrato
              </Button>
            }
          />

        </FadeIn>

        <FadeIn delay={0.10}>

          <PageSection>

            <SearchInput
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Pesquisar contrato..."
            />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.15}>

          <PageSection>

            <ContratoStats
              total={totalContratos}
              ativos={ativos}
              encerrados={encerrados}
              vencendo={vencendo}
            />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.20}>

          <PageSection>

            <ContratoFilters
              filtroSelecionado={filtroSelecionado}
              setFiltroSelecionado={
                setFiltroSelecionado
              }
            />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.25}>

          <PageSection>

            <ContratoTabs
              abaSelecionada={abaSelecionada}
              setAbaSelecionada={
                setAbaSelecionada
              }
            />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.30}>

          <PageSection>

            {abaSelecionada ===
            "visao-geral" ? (

              <ContratoDashboard
                contratos={contratosFiltrados}
              />

            ) : abaSelecionada ===
              "contratos" ? (

              <ContratoCardList
                contratos={contratosFiltrados}
                onEdit={editarContrato}
                onDelete={excluirContrato}
              />

            ) : abaSelecionada ===
              "vencimentos" ? (

              <ContratoProximosVencimentos
                contratos={contratos}
              />

            ) : (

              <ContratoRelatorios
                contratos={contratos}
              />

            )}

          </PageSection>

        </FadeIn>
                <ContratoModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setContratoEditando(null);
          }}
        >
          <ContratoForm
            contrato={contratoEditando}
            onSave={salvarContrato}
            onCancel={() => {
              setModalOpen(false);
              setContratoEditando(null);
            }}
          />
        </ContratoModal>

      </PageContainer>

    </Page>

  </MainLayout>

);
}