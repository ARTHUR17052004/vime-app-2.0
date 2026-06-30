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

        <div className="bg-white rounded-3xl shadow border p-10">

          <h1 className="text-3xl font-bold text-gray-900">

            Solicitação não encontrada

          </h1>

        </div>

      </MainLayout>

    );

  }

 return (

  <MainLayout>

    <div className="space-y-8">

      <div className="bg-white rounded-3xl shadow border p-10">

        <h1 className="text-4xl font-bold text-gray-900">

          {solicitacao.titulo}

        </h1>

        <p className="text-gray-600 mt-2">

          Visualização completa da solicitação

        </p>

      </div>

      <div className="bg-white rounded-3xl shadow border p-8">

        <h2 className="text-2xl font-bold text-gray-900 mb-6">

          Dados Gerais

        </h2>

        <div className="grid md:grid-cols-3 gap-6">

          <div>

            <p className="text-gray-500">
              Número
            </p>

            <h3 className="font-semibold">
              {solicitacao.numero}
            </h3>

          </div>

          <div>

            <p className="text-gray-500">
              Categoria
            </p>

            <h3 className="font-semibold">
              {solicitacao.categoria}
            </h3>

          </div>

          <div>

            <p className="text-gray-500">
              Prioridade
            </p>

            <h3 className="font-semibold">
              {solicitacao.prioridade}
            </h3>

          </div>

          <div>

            <p className="text-gray-500">
              Status
            </p>

            <h3 className="font-semibold text-green-700">
              {solicitacao.status}
            </h3>

          </div>

          <div>

            <p className="text-gray-500">
              Data de abertura
            </p>

            <h3 className="font-semibold">
              {solicitacao.data}
            </h3>

          </div>

          <div>

            <p className="text-gray-500">
              Prazo
            </p>

            <h3 className="font-semibold">
              {solicitacao.prazo || "-"}
            </h3>

          </div>

          <div>

            <p className="text-gray-500">
              Unidade
            </p>

            <h3 className="font-semibold">
              {solicitacao.unidadeNome}
            </h3>

          </div>

          <div>

            <p className="text-gray-500">
              Kitnet
            </p>

            <h3 className="font-semibold">
              {solicitacao.kitnetNome}
            </h3>

          </div>

          <div>

            <p className="text-gray-500">
              Inquilino
            </p>

            <h3 className="font-semibold">
              {solicitacao.inquilino}
            </h3>

          </div>

          <div>

            <p className="text-gray-500">
              Locador
            </p>

            <h3 className="font-semibold">
              {solicitacao.locador || "-"}
            </h3>

          </div>

          <div>

            <p className="text-gray-500">
              Responsável
            </p>

            <h3 className="font-semibold">
              {solicitacao.responsavel}
            </h3>

          </div>

        </div>

      </div>

      <div className="bg-white rounded-3xl shadow border p-8">

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Descrição
        </h2>

        <div className="bg-gray-100 rounded-2xl p-6 text-gray-900">

          {solicitacao.descricao ||
            "Nenhuma descrição cadastrada."}

        </div>

      </div>

      <div className="bg-white rounded-3xl shadow border p-8">

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Observações
        </h2>

        <div className="bg-gray-100 rounded-2xl p-6 text-gray-900">

          {solicitacao.observacoes ||
            "Nenhuma observação cadastrada."}

        </div>

      </div>

      <div className="bg-white rounded-3xl shadow border p-8">

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Resposta
        </h2>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-gray-900">

          {solicitacao.resposta ||
            "Nenhuma resposta enviada."}

        </div>

      </div>

      <div className="bg-white rounded-3xl shadow border p-8">

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
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
                    bg-gray-50
                    rounded-r-2xl
                    p-5
                  "
                >

                  <div className="font-semibold text-gray-900">
                    {item.descricao}
                  </div>

                  <div className="text-sm text-gray-600 mt-2">
                    {item.data}
                  </div>

                </div>

              ))

          ) : (

            <div className="border rounded-2xl p-5">

              <div className="text-gray-700">
                Nenhuma movimentação registrada.
              </div>

            </div>

          )}

        </div>

      </div>

      {

        solicitacao.anexos?.length > 0 && (

          <div className="bg-white rounded-3xl shadow border p-8">

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
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
                        rounded-2xl
                        p-6
                        hover:bg-gray-50
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