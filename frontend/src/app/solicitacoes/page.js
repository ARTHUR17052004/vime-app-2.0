/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useEffect, useState } from "react";

import MainLayout from "../components/layout/MainLayout";

import SolicitacaoResumo from "../components/solicitacoes/SolicitacaoResumo";
import SolicitacaoTabs from "../components/solicitacoes/SolicitacaoTabs";
import SolicitacaoFiltros from "../components/solicitacoes/SolicitacaoFiltros";
import SolicitacaoCard from "../components/solicitacoes/SolicitacaoCard";
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

  }  const solicitacoesFiltradas =
  solicitacoes.filter(
    (item) => {

      const texto = `

        ${item.numero || ""}
        ${item.titulo || ""}
        ${item.descricao || ""}
        ${item.observacoes || ""}
        ${item.responsavel || ""}

      `
        .toLowerCase();

      if (

        pesquisa &&
        !texto.includes(
          pesquisa.toLowerCase()
        )

      ) {

        return false;

      }

      if (

        filtroStatus !==
          "Todos" &&
        item.status !==
          filtroStatus

      ) {

        return false;

      }

    
      if (abaSelecionada === "solicitadas") {
        return item.status === "SOLICITADA";
        }

      if (abaSelecionada === "cotacao") {
        return item.status === "EM COTAÇÃO";
        }

      if (abaSelecionada === "compra") {
        return item.status === "AGUARDANDO COMPRA";
        }

      if (abaSelecionada === "atendidas") {
        return item.status === "ATENDIDA";
        }

      if (abaSelecionada === "rejeitadas") {
        return item.status === "REJEITADA";
        }

      return true;

    }
  );
  
  return (

    <MainLayout>

      <div
        className="
          flex
          items-center
          justify-between
          mb-8
        "
      >

        <div>

          <h1 className="text-4xl font-bold text-gray-900">
            Solicitações
          </h1>

          <p className="text-gray-700 mt-2">
            Gestão de solicitações do sistema.
          </p>

          <p className="text-sm text-green-700 mt-1">
            {solicitacoes.length} solicitação(ões) cadastrada(s)
          </p>

        </div>

        <button
          onClick={
            novaSolicitacao
          }
          className="
            bg-green-700
            text-white
            px-6
            py-3
            rounded-2xl
            hover:bg-green-800
          "
        >
          + Nova Solicitação
        </button>

      </div>

      <SolicitacaoResumo
        solicitacoes={
          solicitacoes
        }
      />

      <SolicitacaoFiltros
        pesquisa={pesquisa}
        setPesquisa={setPesquisa}
        filtroStatus={filtroStatus}
        setFiltroStatus={setFiltroStatus}
        />

      <SolicitacaoTabs
        abaSelecionada={
          abaSelecionada
        }
        setAbaSelecionada={
          setAbaSelecionada
        }
      />      <SolicitacaoCard
                solicitacoes={
                  solicitacoesFiltradas
                }
                onEdit={
                  editarSolicitacao
                }
                onDelete={
                  excluirSolicitacao
                }
                onAlterarStatus={
                  alterarStatus
                }
                 onResponder={
                  responderSolicitacao
                }
              />


      <SolicitacaoRelatorios
        solicitacoes={
          solicitacoes
        }
      />

      <SolicitacaoModal
        isOpen={modalOpen}
        onClose={() => {

          setModalOpen(false);

          setSolicitacaoEditando(
            null
          );

        }}
        title={
          solicitacaoEditando
            ? "Editar Solicitação"
            : "Nova Solicitação"
        }
      >

        <SolicitacaoForm
          onSave={
            salvarSolicitacao
          }
          solicitacaoEditando={
            solicitacaoEditando
          }
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
    </MainLayout>

  );

}