"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import MainLayout from "../../components/layout/MainLayout";
import ContratoHistoricoFinanceiro from "../../components/contratos/ContratoHistoricoFinanceiro";
import ContratoHistoricoEventos from "../../components/contratos/ContratoHistoricoEventos";
import ContratoFinanceiroResumo from "../../components/contratos/ContratoFinanceiroResumo";
import ContratoHistoricoCard from "../../components/contratos/ContratoHistoricoCard";
import SemPermissao from "../../components/ui/SemPermissao";

import { ContratoService } from "@/services/contratos.service";
import { usePermissao } from "../../../hooks/usePermissao";

export default function DetalhesContratoPage() {
  const params = useParams();

  const podeVisualizar = usePermissao("contratos.visualizar");

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

  if (!podeVisualizar) {
    return <SemPermissao />;
  }

  if (carregando) {
    return (
      <MainLayout>
        <div className="py-32 text-center text-[var(--text-subtle)]">
          Carregando...
        </div>
      </MainLayout>
    );
  }

  if (!contrato) {
    return (
      <MainLayout>
        <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] text-[var(--text-1)] rounded-3xl p-10">
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

      <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-10">

        <h1 className="text-4xl font-bold text-[var(--text)]">
          Contrato
        </h1>

        <p className="text-[var(--text-subtle)] mb-10">
          Detalhes do contrato
        </p>

        <div className="grid md:grid-cols-2 gap-8">

          <div>
            <p className="text-[var(--text-subtle)]">
              Inquilino
            </p>

            <h2 className="font-bold text-2xl text-[var(--text)]">
              {contrato.inquilino?.nome || contrato.inquilinoNome}
            </h2>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Residência
            </p>

            <h2 className="font-bold text-2xl text-[var(--text)]">
              {contrato.unidade?.nome || contrato.unidadeNome}
            </h2>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Kitnet
            </p>

            <h2 className="font-bold text-2xl text-[var(--text)]">
              {contrato.kitnet?.nome || contrato.kitnetNome}
            </h2>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Valor do aluguel
            </p>

            <h2 className="font-bold text-2xl text-green-400">
              R$ {contrato.valorAluguel}
            </h2>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Data início
            </p>

            <h2 className="font-bold text-2xl text-[var(--text)]">
              {contrato.dataInicio
                ? new Date(contrato.dataInicio).toLocaleDateString("pt-BR")
                : "-"}
            </h2>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Data fim
            </p>

            <h2 className="font-bold text-2xl text-[var(--text)]">
              {contrato.dataFim
                ? new Date(contrato.dataFim).toLocaleDateString("pt-BR")
                : "Indeterminado"}
            </h2>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Garantia
            </p>

            <h2 className="font-bold text-2xl text-[var(--text)]">
              {contrato.tipoGarantia}
            </h2>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Caução
            </p>

            <h2 className="font-bold text-2xl text-[var(--text)]">
              R$ {contrato.valorCaucao}
            </h2>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Reajuste
            </p>

            <h2 className="font-bold text-2xl text-[var(--text)]">
              {contrato.indiceReajuste}
            </h2>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
              Dia vencimento
            </p>

            <h2 className="font-bold text-2xl text-[var(--text)]">
              Dia {contrato.diaVencimento}
            </h2>
          </div>

          <div>
            <p className="text-[var(--text-subtle)]">
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

      <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--border-token)] rounded-3xl p-8">

        <p className="text-[var(--text-subtle)] mb-4">
          Observações
        </p>

        <div className="bg-[var(--surface-2)] border border-[var(--border-token)] text-[var(--text-1)] rounded-2xl p-6">

          {
            contrato.observacoes ||
            "Nenhuma observação cadastrada."
          }

        </div>

      </div>

    </div>

  </MainLayout>
)}