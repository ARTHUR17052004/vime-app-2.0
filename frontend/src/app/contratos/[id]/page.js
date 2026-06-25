/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import MainLayout from "../../components/layout/MainLayout";
import ContratoHistoricoFinanceiro from "../../components/contratos/ContratoHistoricoFinanceiro";
import ContratoHistoricoEventos from "../../components/contratos/ContratoHistoricoEventos";
import ContratoFinanceiroResumo from "../../components/contratos/ContratoFinanceiroResumo";
import ContratoHistoricoCard from "../../components/contratos/ContratoHistoricoCard";

export default function DetalhesContratoPage() {
  const params = useParams();

  const [contrato, setContrato] =
    useState(null);

  useEffect(() => {
    const contratos = JSON.parse(
      localStorage.getItem(
        "vime-contratos"
      ) || "[]"
    );

    const encontrado =
      contratos.find(
        (item) =>
          String(item.id) ===
          String(params.id)
      );

    setContrato(encontrado);
  }, [params.id]);

  if (!contrato) {
    return (
      <MainLayout>
        <div className="bg-white rounded-3xl shadow p-10">
          Contrato não encontrado.
        </div>
      </MainLayout>
    );
  }

  return (
  <MainLayout>

    <div className="space-y-8">

      <ContratoFinanceiroResumo
        contrato={contrato}
      />

      <div className="bg-white rounded-3xl shadow p-10">

        <h1 className="text-4xl font-bold text-gray-800">
          Contrato
        </h1>

        <p className="text-gray-500 mb-10">
          Detalhes do contrato
        </p>

        <div className="grid md:grid-cols-2 gap-8">

          <div>
            <p className="text-gray-500">
              Inquilino
            </p>

            <h2 className="font-bold text-2xl">
              {contrato.inquilinoNome}
            </h2>
          </div>

          <div>
            <p className="text-gray-500">
              Unidade
            </p>

            <h2 className="font-bold text-2xl">
              {contrato.unidadeNome}
            </h2>
          </div>

          <div>
            <p className="text-gray-500">
              Kitnet
            </p>

            <h2 className="font-bold text-2xl">
              {contrato.kitnetNome}
            </h2>
          </div>

          <div>
            <p className="text-gray-500">
              Valor do aluguel
            </p>

            <h2 className="font-bold text-2xl text-green-700">
              R$ {contrato.valorAluguel}
            </h2>
          </div>

          <div>
            <p className="text-gray-500">
              Data início
            </p>

            <h2 className="font-bold text-2xl">
              {contrato.dataInicio}
            </h2>
          </div>

          <div>
            <p className="text-gray-500">
              Data fim
            </p>

            <h2 className="font-bold text-2xl">
              {contrato.dataFim}
            </h2>
          </div>

          <div>
            <p className="text-gray-500">
              Garantia
            </p>

            <h2 className="font-bold text-2xl">
              {contrato.tipoGarantia}
            </h2>
          </div>

          <div>
            <p className="text-gray-500">
              Caução
            </p>

            <h2 className="font-bold text-2xl">
              R$ {contrato.valorCaucao}
            </h2>
          </div>

          <div>
            <p className="text-gray-500">
              Reajuste
            </p>

            <h2 className="font-bold text-2xl">
              {contrato.indiceReajuste}
            </h2>
          </div>

          <div>
            <p className="text-gray-500">
              Dia vencimento
            </p>

            <h2 className="font-bold text-2xl">
              Dia {contrato.diaVencimento}
            </h2>
          </div>

          <div>
            <p className="text-gray-500">
              Status
            </p>

            <span
              className={`px-4 py-2 rounded-xl text-sm font-medium ${
                contrato.status === "ATIVO"
                  ? "bg-green-100 text-green-700"
                  : contrato.status === "ENCERRADO"
                  ? "bg-gray-100 text-gray-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {contrato.status}
            </span>

          </div>

        </div>

      </div>

      <ContratoHistoricoCard
        contrato={contrato}
      />

      <ContratoHistoricoFinanceiro
        contratoId={contrato.id}
      />

      <ContratoHistoricoEventos
        contrato={contrato}
      />

      <div className="bg-white rounded-3xl shadow p-8">

        <p className="text-gray-500 mb-4">
          Observações
        </p>

        <div className="bg-gray-50 border rounded-2xl p-6">

          {
            contrato.observacoes ||
            "Nenhuma observação cadastrada."
          }

        </div>

      </div>

    </div>

  </MainLayout>
)}