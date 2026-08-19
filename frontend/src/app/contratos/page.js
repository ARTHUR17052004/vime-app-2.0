/* eslint-disable react-hooks/set-state-in-effect */

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
import ContratoTable from "../components/contratos/ContratoTable";
import ContratoClicksignOrfaos from "../components/contratos/ContratoClicksignOrfaos";
import ResidenciaFiltro from "../components/common/ResidenciaFiltro";

import { ContratoService } from "@/services/contratos.service";

export default function ContratosPage() {

  const [modalOpen, setModalOpen] =
    useState(false);

  const [abaSelecionada, setAbaSelecionada] =
    useState("visao-geral");

  const [filtroSelecionado, setFiltroSelecionado] =
    useState("Todos");

  const [residenciaSelecionada, setResidenciaSelecionada] =
    useState("");

  const [contratos, setContratos] =
    useState([]);

  const [contratoEditando, setContratoEditando] =
    useState(null);

  const [search, setSearch] =
    useState("");

  async function carregarContratos() {

    try {

      const resposta =
        await ContratoService.listar();

      const lista = Array.isArray(resposta)
        ? resposta
        : resposta.data || [];

      setContratos(lista);

    } catch (error) {

      console.error(
        "Erro ao carregar contratos:",
        error
      );

    }

  }

  useEffect(() => {

    carregarContratos();

  }, []);

  function novoContrato() {

    setContratoEditando(null);

    setModalOpen(true);

  }

  async function salvarContrato(dados) {

    try {

      if (contratoEditando) {

        await ContratoService.atualizar(

          contratoEditando.id,

          dados

        );

      } else {

        const criado = await ContratoService.criar(dados);

        const contratoCriado = criado.data || criado;

        gerarPdfContrato(contratoCriado.id);

      }

      await carregarContratos();

      setContratoEditando(null);

      setModalOpen(false);

    } catch (error) {

      console.error(
        "Erro ao salvar contrato:",
        error
      );

      alert(
        error.message ||
        "Erro ao salvar contrato."
      );

      throw error;

    }

  }

  async function gerarPdfContrato(contratoId) {

    try {

      const blob = await ContratoService.baixarPdf(contratoId);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `contrato-${contratoId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {

      console.error("Erro ao gerar PDF do contrato:", err);

      alert(err.message || "Erro ao gerar PDF do contrato.");

    }

  }

  function editarContrato(contrato) {

    setContratoEditando(contrato);

    setModalOpen(true);

  }

  async function excluirContrato(id) {

    const confirmar = window.confirm(
      "Deseja realmente excluir este contrato?"
    );

    if (!confirmar) return;

    try {

      await ContratoService.excluir(id);

      await carregarContratos();

    } catch (error) {

      console.error(
        "Erro ao excluir contrato:",
        error
      );

      alert("Erro ao excluir contrato.");

    }

  }
    const contratosFiltrados = contratos.filter(
    (contrato) => {

      const termo =
        search.toLowerCase();

      const nomeInquilino = (
        contrato.inquilino?.nome ||
        contrato.inquilinoNome ||
        ""
      ).toLowerCase();

      const nomeLocador = (
        contrato.locador?.nome ||
        contrato.locadorNome ||
        ""
      ).toLowerCase();

      const nomeUnidade = (
        contrato.unidade?.nome ||
        contrato.unidadeNome ||
        ""
      ).toLowerCase();

      const nomeKitnet = (
        contrato.kitnet?.nome ||
        contrato.kitnetNome ||
        ""
      ).toLowerCase();

      const busca =
        !termo ||
        nomeInquilino.includes(termo) ||
        nomeLocador.includes(termo) ||
        nomeUnidade.includes(termo) ||
        nomeKitnet.includes(termo);

      if (!busca) return false;

      if (
        residenciaSelecionada &&
        contrato.unidadeId !== residenciaSelecionada
      )
        return false;

      if (
        filtroSelecionado ===
        "Todos"
      )
        return true;

      return (
        contrato.status ===
        filtroSelecionado
      );

    }
  );

  const totalContratos =
    contratos.length;

  const ativos =
    contratos.filter(
      (c) => c.status === "ATIVO"
    ).length;

  const encerrados =
    contratos.filter(
      (c) => c.status === "ENCERRADO"
    ).length;

  const vencendo =
    contratos.filter(
      (c) => c.status === "VENCENDO"
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

              <Button
                onClick={novoContrato}
              >

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

        <FadeIn delay={0.20}>

          <PageSection>

            <ContratoFilters
              filtroSelecionado={
                filtroSelecionado
              }
              setFiltroSelecionado={
                setFiltroSelecionado
              }
            />

            <div className="mt-4">
              <ResidenciaFiltro
                value={residenciaSelecionada}
                onChange={setResidenciaSelecionada}
              />
            </div>

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.25}>

          <PageSection>

            <ContratoTabs
              abaSelecionada={
                abaSelecionada
              }
              setAbaSelecionada={
                setAbaSelecionada
              }
            />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.30}>

          <PageSection>

            {abaSelecionada === "visao-geral" ? (

              <ContratoDashboard
                contratos={contratosFiltrados}
              />

            ) : abaSelecionada === "contratos" ? (

              <>
                <ContratoTable
                  contratos={contratosFiltrados}
                  onEdit={editarContrato}
                  onDelete={excluirContrato}
                  onBaixarPdf={gerarPdfContrato}
                />

                <ContratoClicksignOrfaos contratosLocais={contratos} />
              </>

            ) : abaSelecionada === "vencimentos" ? (

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