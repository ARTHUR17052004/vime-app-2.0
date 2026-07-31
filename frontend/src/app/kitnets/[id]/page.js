"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import MainLayout from "../../components/layout/MainLayout";

import { KitnetService } from "../../../services/kitnets.service";

export default function KitnetDetalhesPage() {

  const params = useParams();

  const [kitnet, setKitnet] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function carregarKitnet() {

      try {

        const resposta = await KitnetService.listar();

        const lista = Array.isArray(resposta)
          ? resposta
          : resposta.data || [];

        const encontrada = lista.find(
          (item) => String(item.id) === params.id
        );

        setKitnet(encontrada || null);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }

    }

    if (params.id) {

      carregarKitnet();

    }

  }, [params.id]);

  if (loading) {

    return (

      <MainLayout>

        <div className="p-8">

          <h1 className="text-2xl font-bold text-gray-900">

            Carregando...

          </h1>

        </div>

      </MainLayout>

    );

  }

  if (!kitnet) {

    return (

      <MainLayout>

        <div className="p-8">

          <h1 className="text-2xl font-bold text-gray-900">

            Kitnet não encontrada

          </h1>

        </div>

      </MainLayout>

    );

  }

  return (

    <MainLayout>

      <div className="max-w-6xl mx-auto">

        <div className="bg-white rounded-2xl shadow p-8">

          <h1 className="text-4xl font-bold text-gray-900 mb-2">

            {kitnet.nome}

          </h1>

          <p className="text-gray-500 mb-8">

            Detalhes da Kitnet

          </p>

          <div className="grid md:grid-cols-2 gap-8">

            <div className="bg-gray-50 rounded-xl p-5">

              <p className="text-sm text-gray-500 mb-2">

                Unidade

              </p>

              <p className="font-semibold text-xl text-gray-900">

                {kitnet.unidadeNome}

              </p>

            </div>

            <div className="bg-gray-50 rounded-xl p-5">

              <p className="text-sm text-gray-500 mb-2">

                Número

              </p>

              <p className="font-semibold text-xl text-gray-900">

                {kitnet.numero}

              </p>

            </div>

            <div className="bg-gray-50 rounded-xl p-5">

              <p className="text-sm text-gray-500 mb-2">

                Metragem

              </p>

              <p className="font-semibold text-xl text-gray-900">

                {kitnet.metragem} m²

              </p>

            </div>

            <div className="bg-gray-50 rounded-xl p-5">

              <p className="text-sm text-gray-500 mb-2">

                Valor do Aluguel

              </p>

              <p className="font-semibold text-xl text-green-700">

                R$ {kitnet.aluguel}

              </p>

            </div>

            <div className="bg-gray-50 rounded-xl p-5 md:col-span-2">

              <p className="text-sm text-gray-500 mb-2">

                Status

              </p>

              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  kitnet.status === "Disponível"
                    ? "bg-green-100 text-green-700"
                    : kitnet.status === "Ocupada"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >

                {kitnet.status}

              </span>

            </div>

          </div>

        </div>

      </div>

    </MainLayout>

  );

}