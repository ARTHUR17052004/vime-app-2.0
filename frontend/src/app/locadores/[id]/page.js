"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import MainLayout from "../../components/layout/MainLayout";

import { LocadorService } from "@/services/locadores.service";
import { UnidadeService } from "@/services/unidades.service";

export default function DetalhesLocadorPage() {
  const params = useParams();

  const [locador, setLocador] = useState(null);
  const [totalUnidades, setTotalUnidades] =
    useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function carregarLocador() {

      try {

        setLoading(true);

        const [respostaLocadores, respostaUnidades] =
          await Promise.all([
            LocadorService.listar(),
            UnidadeService.listar(),
          ]);

        const locadores = Array.isArray(respostaLocadores)
          ? respostaLocadores
          : respostaLocadores.data || [];

        const unidades = Array.isArray(respostaUnidades)
          ? respostaUnidades
          : respostaUnidades.data || [];

        const encontrado = locadores.find(
          (item) =>
            String(item.id) ===
            String(params.id)
        );

        setLocador(encontrado || null);

        if (encontrado) {
          const quantidade =
            unidades.filter(
              (u) =>
                String(u.locadorId) ===
                String(encontrado.id)
            ).length;

          setTotalUnidades(quantidade);
        }

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }

    }

    if (params.id) {
      carregarLocador();
    }

  }, [params.id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] text-gray-200 rounded-3xl p-10">
          Carregando locador...
        </div>
      </MainLayout>
    );
  }

  if (!locador) {
    return (
      <MainLayout>
        <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] text-gray-200 rounded-3xl p-10">
          Locador não encontrado.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-10">

        <h1 className="text-4xl font-bold text-white mb-2">
          {locador.nome}
        </h1>

        <p className="text-gray-400 mb-10">
          Detalhes do Locador
        </p>

        <div className="grid md:grid-cols-2 gap-10">

          <div>
            <p className="text-gray-400">
              Tipo
            </p>

            <h2 className="font-bold text-2xl text-white">
              {locador.tipoPessoa === "PJ"
                ? "Pessoa Jurídica"
                : "Pessoa Física"}
            </h2>
          </div>

          <div>
            <p className="text-gray-400">
              Documento
            </p>

            <h2 className="font-bold text-2xl text-white">
              {locador.documento || "-"}
            </h2>
          </div>

          <div>
            <p className="text-gray-400">
              E-mail
            </p>

            <h2 className="font-bold text-2xl text-white">
              {locador.email || "-"}
            </h2>
          </div>

          <div>
            <p className="text-gray-400">
              Telefone
            </p>

            <h2 className="font-bold text-2xl text-white">
              {locador.telefone || "-"}
            </h2>
          </div>

          <div>
            <p className="text-gray-400">
              Banco
            </p>

            <h2 className="font-bold text-2xl text-white">
              {locador.banco || "-"}
            </h2>
          </div>

          <div>
            <p className="text-gray-400">
              Agência
            </p>

            <h2 className="font-bold text-2xl text-white">
              {locador.agencia || "-"}
            </h2>
          </div>

          <div>
            <p className="text-gray-400">
              Conta
            </p>

            <h2 className="font-bold text-2xl text-white">
              {locador.conta || "-"}
            </h2>
          </div>

          <div>
            <p className="text-gray-400">
              Chave PIX
            </p>

            <h2 className="font-bold text-2xl text-white">
              {locador.pix || "-"}
            </h2>
          </div>

          <div>
            <p className="text-gray-400">
              Taxa Administração
            </p>

            <h2 className="font-bold text-2xl text-white">
              {locador.taxaAdministracao || 0}%
            </h2>
          </div>

          <div>
            <p className="text-gray-400">
              Multa
            </p>

            <h2 className="font-bold text-2xl text-white">
              {locador.multa || 0}%
            </h2>
          </div>

          <div>
            <p className="text-gray-400">
              Juros
            </p>

            <h2 className="font-bold text-2xl text-white">
              {locador.juros || 0}% a.m.
            </h2>
          </div>

          <div>
            <p className="text-gray-400">
              Unidades Vinculadas
            </p>

            <h2 className="font-bold text-2xl text-white">
              {totalUnidades}
            </h2>
          </div>

        </div>

        <div className="mt-10">
          <p className="text-gray-400 mb-2">
            Observações
          </p>

          <div className="bg-white/5 border border-white/10 text-gray-200 rounded-2xl p-6">
            {locador.observacoes ||
              "Nenhuma observação cadastrada."}
          </div>
        </div>

      </div>
    </MainLayout>
  );
}