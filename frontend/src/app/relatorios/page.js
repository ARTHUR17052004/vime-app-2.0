"use client";

import { useMemo, useState } from "react";

import MainLayout from "../components/layout/MainLayout";

import ResumoGeral from "../components/relatorios/ResumoGeral";
import RelatorioCards from "../components/relatorios/RelatorioCards";
import RelatorioFiltros from "../components/relatorios/RelatorioFiltros";
import RelatorioExportar from "../components/relatorios/RelatorioExportar";

export default function RelatoriosPage() {

  const [pesquisa, setPesquisa] =
    useState("");

  const modulos = [

    "Unidades",

    "Kitnets",

    "Locadores",

    "Inquilinos",

    "Contratos",

    "Solicitações",

    "Vistorias",

    "Financeiro",

  ];

  const resultados =
    useMemo(() => {

      return modulos.filter(

        (item) =>

          item
            .toLowerCase()
            .includes(
              pesquisa.toLowerCase()
            )

      );

    }, [pesquisa]);

  return (

    <MainLayout>

      <div className="space-y-8">

        <div>

          <h1 className="text-4xl font-bold text-gray-900">

            Relatórios

          </h1>

          <p className="text-gray-600 mt-2">

            Central de relatórios do VIME 2.0

          </p>

        </div>

        <ResumoGeral />

        <RelatorioFiltros
          pesquisa={pesquisa}
          setPesquisa={setPesquisa}
        />

        {

          pesquisa && (

            <div className="bg-white rounded-3xl shadow border p-6">

              <h2 className="text-xl font-bold mb-4">

                Resultado da Pesquisa

              </h2>

              <div className="flex flex-wrap gap-3">

                {

                  resultados.length > 0 ? (

                    resultados.map((item) => (

                      <span
                        key={item}
                        className="
                          bg-green-100
                          text-green-700
                          px-4
                          py-2
                          rounded-full
                        "
                      >

                        {item}

                      </span>

                    ))

                  ) : (

                    <span className="text-gray-500">

                      Nenhum módulo encontrado.

                    </span>

                  )

                }

              </div>

            </div>

          )

        }

        <RelatorioCards />

        <RelatorioExportar />

      </div>

    </MainLayout>

  );

}