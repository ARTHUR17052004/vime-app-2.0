/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import MainLayout from "../../components/layout/MainLayout";

export default function DetalhesSolicitacaoPage() {

  const params = useParams();

  const [solicitacao, setSolicitacao] =
    useState(null);

  useEffect(() => {

    const solicitacoes = JSON.parse(

      localStorage.getItem(
        "vime-solicitacoes"
      ) || "[]"

    );

    const encontrada =
      solicitacoes.find(

        (item) =>

          String(item.id) ===
          String(params.id)

      );

    setSolicitacao(
      encontrada
    );

  }, [params.id]);

  if (!solicitacao) {

    return (

      <MainLayout>

        <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-10">

          <h1 className="text-3xl font-bold text-white">

            Solicitação não encontrada

          </h1>

        </div>

      </MainLayout>

    );

  }

 return (

  <MainLayout>

    <div className="space-y-8">

      <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-10">

        <h1 className="text-4xl font-bold text-white">

          {solicitacao.titulo}

        </h1>

        <p className="text-gray-400 mt-2">

          Visualização completa da solicitação

        </p>

      </div>

      <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-8">

        <h2 className="text-2xl font-bold text-white mb-6">

          Dados Gerais

        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div>

            <p className="text-gray-400">
              Número
            </p>

            <h3 className="font-semibold text-white">
              {solicitacao.numero}
            </h3>

          </div>

          <div>

            <p className="text-gray-400">
              Categoria
            </p>

            <h3 className="font-semibold text-white">
              {solicitacao.categoria}
            </h3>

          </div>

          <div>

            <p className="text-gray-400">
              Prioridade
            </p>

            <h3 className="font-semibold text-white">
              {solicitacao.prioridade}
            </h3>

          </div>

          <div>

            <p className="text-gray-400">
              Status
            </p>

            <h3 className="font-semibold text-emerald-400">
              {solicitacao.status}
            </h3>

          </div>

          <div>

            <p className="text-gray-400">
              Data de abertura
            </p>

            <h3 className="font-semibold text-white">
              {solicitacao.data}
            </h3>

          </div>

          <div>

            <p className="text-gray-400">
              Prazo
            </p>

            <h3 className="font-semibold text-white">
              {solicitacao.prazo || "-"}
            </h3>

          </div>

          <div>

            <p className="text-gray-400">
              Unidade
            </p>

            <h3 className="font-semibold text-white">
              {solicitacao.unidadeNome}
            </h3>

          </div>

          <div>

            <p className="text-gray-400">
              Kitnet
            </p>

            <h3 className="font-semibold text-white">
              {solicitacao.kitnetNome}
            </h3>

          </div>

          <div>

            <p className="text-gray-400">
              Inquilino
            </p>

            <h3 className="font-semibold text-white">
              {solicitacao.inquilino}
            </h3>

          </div>

          <div>

            <p className="text-gray-400">
              Locador
            </p>

            <h3 className="font-semibold text-white">
              {solicitacao.locador || "-"}
            </h3>

          </div>

          <div>

            <p className="text-gray-400">
              Responsável
            </p>

            <h3 className="font-semibold text-white">
              {solicitacao.responsavel}
            </h3>

          </div>

        </div>

      </div>

      <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-8">

        <h2 className="text-2xl font-bold text-white mb-4">
          Descrição
        </h2>

        <div className="bg-white/5 rounded-2xl p-6 text-gray-200">

          {solicitacao.descricao ||
            "Nenhuma descrição cadastrada."}

        </div>

      </div>

      <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-8">

        <h2 className="text-2xl font-bold text-white mb-4">
          Observações
        </h2>

        <div className="bg-white/5 rounded-2xl p-6 text-gray-200">

          {solicitacao.observacoes ||
            "Nenhuma observação cadastrada."}

        </div>

      </div>

      <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-8">

        <h2 className="text-2xl font-bold text-white mb-4">
          Resposta
        </h2>

        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-gray-200">

          {solicitacao.resposta ||
            "Nenhuma resposta enviada."}

        </div>

      </div>

      <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-8">

        <h2 className="text-2xl font-bold text-white mb-6">
          Histórico
        </h2>

        <div className="space-y-4">

          {solicitacao.historico?.length ? (

            solicitacao.historico
              .slice()
              .reverse()
              .map((item, index) => (

                <div
                  key={index}
                  className="
                    border-l-4
                    border-green-700
                    bg-white/5
                    rounded-r-2xl
                    p-5
                  "
                >

                  <div className="font-semibold text-white">
                    {item.descricao}
                  </div>

                  <div className="text-sm text-gray-400 mt-2">
                    {item.data}
                  </div>

                </div>

              ))

          ) : (

            <div className="border border-white/10 rounded-2xl p-5">

              <div className="text-gray-300">
                Nenhuma movimentação registrada.
              </div>

            </div>

          )}

        </div>

      </div>

      {

        solicitacao.anexos?.length > 0 && (

          <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-8">

            <h2 className="text-2xl font-bold text-white mb-6">
              Anexos
            </h2>

            <div className="grid md:grid-cols-3 gap-4">

              {

                solicitacao.anexos.map(

                  (arquivo, index) => (

                    <a
                      key={index}
                      href={arquivo}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        border
                        border-white/10
                        text-gray-200
                        rounded-2xl
                        p-6
                        hover:bg-white/5
                        transition
                      "
                    >

                      Anexo {index + 1}

                    </a>

                  )

                )

              }

            </div>

          </div>

        )

      }

    </div>

  </MainLayout>

);

}