"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MainLayout from "../../components/layout/MainLayout";

import { UnidadeService } from "@/services/unidades.service";

export default function UnidadeDetalhesPage() {
  const params = useParams();

  const [unidade, setUnidade] = useState(null);

  const [loading, setLoading] = useState(true);

  const [erro, setErro] = useState("");

  useEffect(() => {

    async function carregarUnidade() {

      try {

        setLoading(true);

        setErro("");

        const resposta = await UnidadeService.listar();

        const lista = Array.isArray(resposta)
          ? resposta
          : resposta.data || [];

        const encontrada = lista.find(
          (item) => String(item.id) === String(params.id)
        );

        setUnidade(encontrada || null);

        if (!encontrada) {
          setErro("Residência não encontrada.");
        }

      } catch (err) {

        console.error(err);

        setErro(
          err.message || "Erro ao carregar residência."
        );

      } finally {

        setLoading(false);

      }

    }

    if (params.id) {
      carregarUnidade();
    }

  }, [params.id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] text-gray-200 rounded-2xl p-8">
          Carregando residência...
        </div>
      </MainLayout>
    );
  }

  if (erro || !unidade) {
    return (
      <MainLayout>
        <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] text-red-300 rounded-2xl p-8">
          {erro || "Residência não encontrada."}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">

        <div>
          <h1 className="text-4xl font-bold text-white">
            {unidade.nome}
          </h1>

          <p className="text-gray-400 mt-2">
            Detalhes completos da residência
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Informações Gerais
            </h2>

            <div className="space-y-3 text-gray-200">
              <p>
                <strong>Status:</strong>{" "}
                {unidade.status || "-"}
              </p>

              <p>
                <strong>Locador:</strong>{" "}
                {unidade.locador || "-"}
              </p>

              <p>
                <strong>Kitnets:</strong>{" "}
                {unidade.kitnets || 0}
              </p>

              <p>
                <strong>Vencimento:</strong>{" "}
                Dia {unidade.vencimento || "-"}
              </p>

              <p>
                <strong>Valor Aluguel:</strong>{" "}
                R$ {unidade.aluguel || "0,00"}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-white mb-4">
              Endereço
            </h2>

            <div className="space-y-3 text-gray-200">
              <p>
                {unidade.logradouro || "-"}{" "}
                {unidade.numero || ""}
              </p>

              <p>
                {unidade.bairro || "-"}
              </p>

              <p>
                {unidade.cidade || "-"} -{" "}
                {unidade.uf || "-"}
              </p>

              <p>
                CEP: {unidade.cep || "-"}
              </p>

              {unidade.complemento && (
                <p>
                  Complemento: {unidade.complemento}
                </p>
              )}
            </div>
          </div>

        </div>

        <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Observações
          </h2>

          <p className="text-gray-200">
            {unidade.observacoes ||
              "Nenhuma observação cadastrada."}
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#202a36]/95 via-[#1b2430]/96 to-[#151c25]/96 backdrop-blur-xl border border-white/[0.07] rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Kitnets
          </h2>

          <p className="text-gray-400">
            Módulo será integrado na próxima etapa.
          </p>
        </div>

      </div>
    </MainLayout>
  );
}