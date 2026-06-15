"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import MainLayout from "../../components/layout/MainLayout";

export default function UnidadeDetalhesPage() {
  const params = useParams();

  const [unidade, setUnidade] = useState(null);

  useEffect(() => {
    const unidades = JSON.parse(
      localStorage.getItem("vime-unidades") || "[]"
    );

    const encontrada = unidades.find(
      (item) => String(item.id) === String(params.id)
    );

    setUnidade(encontrada);
  }, [params.id]);

  if (!unidade) {
    return (
      <MainLayout>
        <div className="bg-white rounded-2xl shadow p-8">
          Carregando unidade...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">

        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            {unidade.nome}
          </h1>

          <p className="text-gray-600 mt-2">
            Detalhes completos da unidade
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informações Gerais
            </h2>

            <div className="space-y-3 text-gray-800">
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

          <div className="bg-white rounded-2xl shadow p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Endereço
            </h2>

            <div className="space-y-3 text-gray-800">
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

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Observações
          </h2>

          <p className="text-gray-700">
            {unidade.observacoes ||
              "Nenhuma observação cadastrada."}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Kitnets
          </h2>

          <p className="text-gray-600">
            Módulo será integrado na próxima etapa.
          </p>
        </div>

      </div>
    </MainLayout>
  );
}