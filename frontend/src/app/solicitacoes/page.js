/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useCallback, useEffect, useState } from "react";

import MainLayout from "../components/layout/MainLayout";

import { SolicitacaoService } from "@/services/solicitacao.service";


import PageHeader from "../components/ui/PageHeader";
import SearchInput from "../components/common/SearchInput";

import SolicitacaoTabs from "../components/solicitacoes/SolicitacaoTabs";
import SolicitacaoCardList from "../components/solicitacoes/SolicitacaoCardList";

import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import PageSection from "../components/ui/PageSection";
import FadeIn from "../components/ui/FadeIn";

import Button from "../components/ui/Button";

import SolicitacaoModal from "../components/solicitacoes/SolicitacaoModal";
import SolicitacaoForm from "../components/solicitacoes/SolicitacaoForm";
import SolicitacaoRelatorios from "../components/solicitacoes/SolicitacaoRelatorios";

export default function SolicitacoesPage() {

  const [modalOpen, setModalOpen] =
    useState(false);

  const [solicitacoes, setSolicitacoes] =
    useState([]);

  const [solicitacaoEditando, setSolicitacaoEditando] =
    useState(null);

  const [carregado, setCarregado] =
    useState(false);

  const [abaSelecionada, setAbaSelecionada] =
    useState("todas");

  const [pesquisa, setPesquisa] =
    useState("");

  const carregar = useCallback(async () => {

    try {

      const resposta = await SolicitacaoService.listar();

      setSolicitacoes(
        Array.isArray(resposta) ? resposta : resposta.data || []
      );

    } catch (err) {

      console.error("Erro ao carregar solicitações:", err);

    } finally {

      setCarregado(true);

    }

  }, []);

  useEffect(() => {

    carregar();

  }, [carregar]);

  async function salvarSolicitacao(
    dados
  ) {

    const payload = {
      numero: dados.numero,
      titulo: dados.titulo,
      descricao: dados.descricao,
      prazo: dados.prazo || null,
      observacoes: dados.observacoes,
    };

    try {

      if (solicitacaoEditando) {

        await SolicitacaoService.atualizar(
          solicitacaoEditando.id,
          payload
        );

      } else {

        const criada = await SolicitacaoService.criar(payload);

        const solicitacaoCriada = criada.data || criada;

        if (dados.anexo) {

          await SolicitacaoService.enviarMensagem(
            solicitacaoCriada.id,
            {
              texto: null,
              anexoNome: dados.anexo.nome,
              anexoTipo: dados.anexo.tipo,
              anexoDados: dados.anexo.dados,
            }
          );

        }

      }

      await carregar();

      setSolicitacaoEditando(null);

      setModalOpen(false);

    } catch (err) {

      alert(err.message || "Erro ao salvar solicitação.");

    }

  }

  function editarSolicitacao(
    solicitacao
  ) {

    setSolicitacaoEditando(
      solicitacao
    );

    setModalOpen(true);

  }

  async function excluirSolicitacao(
    id
  ) {

    const confirmar =
      window.confirm(
        "Deseja excluir esta solicitação?"
      );

    if (!confirmar)
      return;

    try {

      await SolicitacaoService.excluir(id);

      await carregar();

    } catch (err) {

      alert(err.message || "Erro ao excluir solicitação.");

    }

  }

  function novaSolicitacao() {

    setSolicitacaoEditando(
      null
    );

    setModalOpen(true);

  } const solicitacoesFiltradas = solicitacoes.filter((item) => {

    const texto = `
      ${item.numero || ""}
      ${item.titulo || ""}
      ${item.descricao || ""}
      ${item.observacoes || ""}
      ${item.responsavel || ""}
    `.toLowerCase();

    if (
      pesquisa &&
      !texto.includes(
        pesquisa.toLowerCase()
      )
    ) {
      return false;
    }

    switch (abaSelecionada) {

      case "solicitadas":
        return item.status === "SOLICITADA";

      case "cotacao":
        return item.status === "EM COTAÇÃO";

      case "compra":
        return item.status === "AGUARDANDO COMPRA";

      case "atendidas":
        return item.status === "ATENDIDA";

      case "rejeitadas":
        return item.status === "REJEITADA";

      default:
        return true;

    }

  });

  if (!carregado) {
    return (
      <MainLayout>
        <div className="py-32 text-center text-[var(--text-subtle)]">
          Carregando solicitações...
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
            title="Solicitações"
            subtitle="Gerencie todas as solicitações cadastradas."
            count={solicitacoes.length}
            countLabel="solicitação(ões) cadastrada(s)"
            actions={
              <Button onClick={novaSolicitacao}>
                + Nova Solicitação
              </Button>
            }
          >

            <SearchInput
              placeholder="Pesquisar solicitação..."
              value={pesquisa}
              onChange={(e) =>
                setPesquisa(e.target.value)
              }
            />

          </PageHeader>

        </FadeIn>

        <FadeIn delay={0.15}>

          <PageSection spacing="lg">

            <SolicitacaoTabs
              abaSelecionada={abaSelecionada}
              setAbaSelecionada={setAbaSelecionada}
            />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.20}>

          <PageSection spacing="xxl">

            <SolicitacaoCardList
              solicitacoes={solicitacoesFiltradas}
              onEdit={editarSolicitacao}
              onDelete={excluirSolicitacao}
              onAtualizado={carregar}
            />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.30}>

          <PageSection spacing="xxl">

            <SolicitacaoRelatorios
              solicitacoes={solicitacoes}
            />

          </PageSection>

        </FadeIn>

        <SolicitacaoModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSolicitacaoEditando(null);
          }}
          title={
            solicitacaoEditando
              ? "Editar Solicitação"
              : "Nova Solicitação"
          }
        >

          <SolicitacaoForm
            onSave={salvarSolicitacao}
            solicitacaoEditando={solicitacaoEditando}
          />

        </SolicitacaoModal>

      </PageContainer>

    </Page>

  </MainLayout>

);

}