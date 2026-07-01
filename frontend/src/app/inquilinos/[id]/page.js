"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import MainLayout from "../../components/layout/MainLayout";

export default function InquilinoDetalhesPage() {
  const params = useParams();

  const [inquilino, setInquilino] =
    useState(null);

  useEffect(() => {
    const inquilinos = JSON.parse(
      localStorage.getItem("vime-inquilinos") ||
        "[]"
    );

    const encontrado = inquilinos.find(
      (item) =>
        String(item.id) === String(params.id)
    );

    setInquilino(encontrado);
  }, [params.id]);

  if (!inquilino) {
    return (
      <MainLayout>
        <div className="p-8">
          <h1 className="text-2xl font-bold">
            Inquilino não encontrado
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
            {inquilino.nome}
          </h1>

          <p className="text-gray-500 mb-8">
            Detalhes do Inquilino
          </p>

          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <p className="text-sm text-gray-500">
                Nome
              </p>

              <p className="font-semibold text-lg text-gray-900">
                {inquilino.nome}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                CPF
              </p>

              <p className="font-semibold text-lg text-gray-900">
                {inquilino.cpf}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                E-mail
              </p>

              <p className="font-semibold text-lg text-gray-900">
                {inquilino.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Telefone
              </p>

              <p className="font-semibold text-lg text-gray-900">
                {inquilino.telefone}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Kitnet
              </p>

              <p className="font-semibold text-lg text-gray-900">
                {inquilino.kitnetNome || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Unidade
              </p>

              <p className="font-semibold text-lg text-gray-900">
                {inquilino.unidadeNome || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Início do Contrato
              </p>

              <p className="font-semibold text-lg text-gray-900">
                {inquilino.dataInicioContrato ||
                  "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Fim do Contrato
              </p>

              <p className="font-semibold text-lg text-gray-900">
                {inquilino.dataFimContrato ||
                  "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Status
              </p>

              <p className="font-semibold text-lg text-gray-900">
                {inquilino.ativo
                  ? "Ativo"
                  : "Inativo"}
              </p>
            </div>

          </div>

        </div>

      </div>
    </MainLayout>
  );
}