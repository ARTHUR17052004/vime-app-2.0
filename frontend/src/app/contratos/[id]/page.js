"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import MainLayout from "../../components/layout/MainLayout";
import ContratoHistoricoFinanceiro from "../../components/contratos/ContratoHistoricoFinanceiro";
import ContratoHistoricoEventos from "../../components/contratos/ContratoHistoricoEventos";
import ContratoFinanceiroResumo from "../../components/contratos/ContratoFinanceiroResumo";
import ContratoHistoricoCard from "../../components/contratos/ContratoHistoricoCard";

import { ContratoService } from "@/services/contratos.service";

export default function DetalhesContratoPage() {
  const params = useParams();

  const [contrato, setContrato] =
    useState(null);

  const [carregando, setCarregando] =
    useState(true);

  useEffect(() => {

    async function carregar() {

      try {

        const resposta = await ContratoService.buscar(params.id);

        setContrato(resposta.data || resposta);

      } catch (err) {

        console.error("Erro ao carregar contrato:", err);

      } finally {

        setCarregando(false);

      }

    }

    carregar();

  }, [params.id]);

  if (carregando) {
    return (
      <MainLayout>
        <div className="py-32 text-center text-gray-400">
          Carregando...
        </div>
      </MainLayout>
    );
  }

  if (!contrato) {
    return (
      <MainLayout>
        <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] text-gray-200 rounded-3xl p-10">
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

      <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-10">

        <h1 className="text-4xl font-bold text-white">
          Contrato
        </h1>

        <p className="text-gray-400 mb-10">
          Detalhes do contrato
        </p>

        <div className="grid md:grid-cols-2 gap-8">

          <div>
            <p className="text-gray-400">
              Inquilino
            </p>

            <h2 className="font-bold text-2xl text-white">
              {contrato.inquilino?.nome || contrato.inquilinoNome}
            </h2>
          </div>

          <div>
            <p className="text-gray-400">
              Unidade
            </p>

            <h2 className="font-bold text-2xl text-white">
              {contrato.unidade?.nome || contrato.unidadeNome}
            </h2>
          </div>

          <div>
            <p className="text-gray-400">
              Kitnet
            </p>

            <h2 className="font-bold text-2xl text-white">
              {contrato.kitnet?.nome || contrato.kitnetNome}
            </h2>
          </div>

          <div>
            <p className="text-gray-400">
              Valor do aluguel
            </p>

            <h2 className="font-bold text-2xl text-green-400">
              R$ {contrato.valorAluguel}
            </h2>
          </div>

          <div>
            <p className="text-gray-400">
              Data início
            </p>

            <h2 className="font-bold text-2xl text-white">
              {contrato.dataInicio
                ? new Date(contrato.dataInicio).toLocaleDateString("pt-BR")
                : "-"}
            </h2>
          </div>

          <div>
            <p className="text-gray-400">
              Data fim
            </p>

            <h2 className="font-bold text-2xl text-white">
              {contrato.dataFim
                ? new Date(contrato.dataFim).toLocaleDateString("pt-BR")
                : "Indeterminado"}
            </h2>
          </div>

          <div>
            <p className="text-gray-400">
              Garantia
            </p>

            <h2 className="font-bold text-2xl text-white">
              {contrato.tipoGarantia}
            </h2>
          </div>

          <div>
            <p className="text-gray-400">
              Caução
            </p>

            <h2 className="font-bold text-2xl text-white">
              R$ {contrato.valorCaucao}
            </h2>
          </div>

          <div>
            <p className="text-gray-400">
              Reajuste
            </p>

            <h2 className="font-bold text-2xl text-white">
              {contrato.indiceReajuste}
            </h2>
          </div>

          <div>
            <p className="text-gray-400">
              Dia vencimento
            </p>

            <h2 className="font-bold text-2xl text-white">
              Dia {contrato.diaVencimento}
            </h2>
          </div>

          <div>
            <p className="text-gray-400">
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

      <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-8">

        <p className="text-gray-400 mb-4">
          Observações
        </p>

        <div className="bg-white/5 border border-white/10 text-gray-200 rounded-2xl p-6">

          {
            contrato.observacoes ||
            "Nenhuma observação cadastrada."
          }

        </div>

      </div>

    </div>

  </MainLayout>
)}