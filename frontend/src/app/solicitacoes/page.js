/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useEffect, useState } from "react";

import MainLayout from "../components/layout/MainLayout";


import PageHeader from "../components/common/PageHeader";
import SearchInput from "../components/common/SearchInput";
import PrimaryButton from "../components/common/PrimaryButton";
import StatCounter from "../components/common/StatCounter";

import SolicitacaoStats from "../components/solicitacoes/SolicitacaoStats";
import SolicitacaoFilters from "../components/solicitacoes/SolicitacaoFilters";
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
import SolicitacaoRespostaModal from "../components/solicitacoes/SolicitacaoRespostaModal";

export default function SolicitacoesPage() {

  const [modalOpen, setModalOpen] =
    useState(false);

  const [solicitacoes, setSolicitacoes] =
    useState([]);

  const [solicitacaoEditando, setSolicitacaoEditando] =
    useState(null);

  const [modalRespostaOpen, setModalRespostaOpen] =
    useState(false);

  const [solicitacaoResposta, setSolicitacaoResposta] =
    useState(null);

  const [carregado, setCarregado] =
    useState(false);

  const [abaSelecionada, setAbaSelecionada] =
    useState("todas");

  const [filtroStatus, setFiltroStatus] =
    useState("Todos");

  const [pesquisa, setPesquisa] =
    useState("");

  useEffect(() => {

    const dados = JSON.parse(

      localStorage.getItem(
        "vime-solicitacoes"
      ) || "[]"

    );

    setSolicitacoes(
      dados
    );

    setCarregado(true);

  }, []);

  useEffect(() => {

    if (!carregado) return;

    localStorage.setItem(

      "vime-solicitacoes",

      JSON.stringify(
        solicitacoes
      )

    );

  }, [solicitacoes, carregado]);

  function salvarSolicitacao(
    dados
  ) {

    const agora =
      new Date()
        .toLocaleString(
          "pt-BR"
        );

    if (
      solicitacaoEditando
    ) {

      const lista =
        solicitacoes.map(
          (item) => {

            if (
              item.id !==
              solicitacaoEditando.id
            ) {

              return item;

            }

            return {

              ...item,

              ...dados,

              historico: [

                ...(item.historico || []),

                {

                  data: agora,

                  descricao:
                    "Solicitação editada",

                },

              ],

            };

          }
        );

      setSolicitacoes(
        lista
      );

      setSolicitacaoEditando(
        null
      );

      setModalOpen(false);

      return;

    }

    const nova = {

      id: Date.now(),

      ...dados,

      historico: [

        {

          data: agora,

          descricao:
            "Solicitação criada",

        },

      ],

    };

    setSolicitacoes(

      (prev) => [

        ...prev,

        nova,

      ]

    );

    setModalOpen(false);

  }

  function editarSolicitacao(
    solicitacao
  ) {

    setSolicitacaoEditando(
      solicitacao
    );

    setModalOpen(true);

  }

  function responderSolicitacao(
    solicitacao
  ) {

  setSolicitacaoResposta(
    solicitacao
  );

  setModalRespostaOpen(
    true
  );

}
  function salvarResposta({
  resposta,
  status,
}) {

  const agora =
    new Date().toLocaleString(
      "pt-BR"
    );

  setSolicitacoes((prev) =>

    prev.map((item) => {

      if (
        item.id !==
        solicitacaoResposta.id
      ) {

        return item;

      }

      return {

        ...item,

        resposta,

        status,

       historico: [

          ...(item.historico || []),

          {

            data: agora,

            descricao:
              "Resposta enviada",

          },

          {

            data: agora,

            descricao:
              `Status alterado para ${status}`,

          },

        ],

      };

    })
  );

setModalRespostaOpen(false);

setSolicitacaoResposta(null);

}
  function excluirSolicitacao(
    id
  ) {

    const confirmar =
      window.confirm(
        "Deseja excluir esta solicitação?"
      );

    if (!confirmar)
      return;

    setSolicitacoes(

      (prev) =>

        prev.filter(

          (item) =>
            item.id !== id

        )

    );

  }

  function alterarStatus(
  id,
  novoStatus
) {

  const agora =
    new Date().toLocaleString(
      "pt-BR"
    );

  setSolicitacoes((prev) =>

    prev.map((item) => {

      if (item.id !== id) {

        return item;

      }

      return {

        ...item,

        status: novoStatus,

        historico: [

          ...(item.historico || []),

          {

            data: agora,

            descricao:
              `Status alterado para ${novoStatus}`,

          },

        ],

      };

    })

  );

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

    if (
      filtroStatus !== "Todos" &&
      item.status !== filtroStatus
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

        <FadeIn delay={0.10}>

          <PageSection spacing="xl">

            <SolicitacaoStats
              solicitacoes={solicitacoes}
            />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.15}>

          <PageSection spacing="lg">

            <SolicitacaoFilters
              filtroStatus={filtroStatus}
              setFiltroStatus={setFiltroStatus}
            />

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
              onAlterarStatus={alterarStatus}
              onResponder={responderSolicitacao}
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

        <SolicitacaoRespostaModal
          isOpen={modalRespostaOpen}
          onClose={() => {
            setModalRespostaOpen(false);
            setSolicitacaoResposta(null);
          }}
          solicitacao={solicitacaoResposta}
          onSalvar={salvarResposta}
        />

      </PageContainer>

    </Page>

  </MainLayout>

);

}