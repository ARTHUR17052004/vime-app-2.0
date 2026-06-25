/* eslint-disable @next/next/no-img-element */
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import MainLayout from "../../components/layout/MainLayout";

export default function DetalhesVistoriaPage() {

  const params = useParams();

  const [vistoria, setVistoria] =
    useState(null);

  useEffect(() => {

    const vistorias = JSON.parse(
      localStorage.getItem(
        "vime-vistorias"
      ) || "[]"
    );

    const encontrada =
      vistorias.find(
        (item) =>
          String(item.id) ===
          String(params.id)
      );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVistoria(encontrada);

  }, [params.id]);

  if (!vistoria) {

    return (

      <MainLayout>

        <div className="bg-white rounded-3xl shadow p-10">

          <h1 className="text-3xl font-bold text-gray-900">
            Vistoria não encontrada
          </h1>

        </div>

      </MainLayout>

    );

  }

  return (

    <MainLayout>

      <div className="space-y-8">

        <div className="bg-white rounded-3xl shadow p-10">

          <h1 className="text-4xl font-bold text-gray-900">
            {vistoria.nomeVistoria}
          </h1>

          <p className="text-gray-700 mt-2">
            Informações completas da vistoria
          </p>

        </div>

        <div className="bg-white rounded-3xl shadow p-8">

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Dados da Vistoria
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            <div>
              <p className="text-gray-500">Nome</p>
              <h3 className="font-semibold text-gray-900">
                {vistoria.nomeVistoria}
              </h3>
            </div>

            <div>
              <p className="text-gray-500">Categoria</p>
              <h3 className="font-semibold text-gray-900">
                {vistoria.categoria}
              </h3>
            </div>

            <div>
              <p className="text-gray-500">Criticidade</p>
              <h3 className="font-semibold text-gray-900">
                {vistoria.criticidade}
              </h3>
            </div>

            <div>
              <p className="text-gray-500">Responsável</p>
              <h3 className="font-semibold text-gray-900">
                {vistoria.responsavel}
              </h3>
            </div>

            <div>
              <p className="text-gray-500">Periodicidade</p>
              <h3 className="font-semibold text-gray-900">
                {vistoria.periodicidade}
              </h3>
            </div>

            <div>
              <p className="text-gray-500">Status</p>
              <h3 className="font-semibold text-green-700">
                {vistoria.status}
              </h3>
            </div>

            <div>
              <p className="text-gray-500">Última Execução</p>
              <h3 className="font-semibold text-gray-900">
                {vistoria.dataUltima || "Ainda não executada"}
              </h3>
            </div>

            <div>
              <p className="text-gray-500">Próxima Execução</p>
              <h3 className="font-semibold text-gray-900">
                {vistoria.dataProxima}
              </h3>
            </div>

            <div>
              <p className="text-gray-500">Unidade</p>
              <h3 className="font-semibold text-gray-900">
                {vistoria.unidadeNome}
              </h3>
            </div>

            <div>
              <p className="text-gray-500">Kitnet</p>
              <h3 className="font-semibold text-gray-900">
                {vistoria.kitnetNome}
              </h3>
            </div>

          </div>

        </div>

        <div className="bg-white rounded-3xl shadow p-8">

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Observações
          </h2>

          <div className="bg-gray-100 rounded-2xl p-6 text-gray-900">

            {vistoria.observacoes ||
              "Nenhuma observação cadastrada."}

          </div>

        </div>

        {vistoria.fotos?.length > 0 && (

          <div className="bg-white rounded-3xl shadow p-8">

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Fotos da Vistoria
            </h2>

            <div className="grid md:grid-cols-3 gap-4">

              {vistoria.fotos.map((foto, index) => (

                <a
                  key={index}
                  href={foto}
                  target="_blank"
                  rel="noreferrer"
                  download={`vistoria-${index + 1}.png`}
                >

                  <img
                    src={foto}
                    alt={`Foto ${index + 1}`}
                    className="
                      w-full
                      h-52
                      object-cover
                      rounded-2xl
                      border
                      cursor-pointer
                      hover:scale-105
                      transition
                    "
                  />

                </a>

              ))}

            </div>

          </div>

        )}

        <div className="bg-white rounded-3xl shadow p-8">

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Histórico de Movimentações
          </h2>

          <div className="space-y-4">

            {vistoria.historico?.length ? (

              vistoria.historico
                .slice()
                .reverse()
                .map((item, index) => (

                  <div
                    key={index}
                    className="
                      border-l-4
                      border-green-600
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

      </div>

    </MainLayout>

  );

}