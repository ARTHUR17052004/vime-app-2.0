"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import MainLayout from "../../components/layout/MainLayout";

export default function DetalhesLocadorPage() {
  const params = useParams();

  const [locador, setLocador] = useState(null);
  const [totalUnidades, setTotalUnidades] =
    useState(0);

  useEffect(() => {
    const locadores = JSON.parse(
      localStorage.getItem(
        "vime-locadores"
      ) || "[]"
    );

    const unidades = JSON.parse(
      localStorage.getItem(
        "vime-unidades"
      ) || "[]"
    );

    const encontrado = locadores.find(
      (item) =>
        String(item.id) ===
        String(params.id)
    );

    setLocador(encontrado);

    if (encontrado) {
      const quantidade =
        unidades.filter(
          (u) =>
            String(u.locadorId) ===
            String(encontrado.id)
        ).length;

      setTotalUnidades(quantidade);
    }
  }, [params.id]);

  if (!locador) {
    return (
      <MainLayout>
        <div className="bg-white rounded-3xl shadow p-10">
          Locador não encontrado.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-white rounded-3xl shadow p-10">

        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          {locador.nome}
        </h1>

        <p className="text-gray-500 mb-10">
          Detalhes do Locador
        </p>

        <div className="grid md:grid-cols-2 gap-10">

          <div>
            <p className="text-gray-500">
              Tipo
            </p>

            <h2 className="font-bold text-2xl">
              {locador.tipoPessoa === "PJ"
                ? "Pessoa Jurídica"
                : "Pessoa Física"}
            </h2>
          </div>

          <div>
            <p className="text-gray-500">
              Documento
            </p>

            <h2 className="font-bold text-2xl">
              {locador.documento || "-"}
            </h2>
          </div>

          <div>
            <p className="text-gray-500">
              E-mail
            </p>

            <h2 className="font-bold text-2xl">
              {locador.email || "-"}
            </h2>
          </div>

          <div>
            <p className="text-gray-500">
              Telefone
            </p>

            <h2 className="font-bold text-2xl">
              {locador.telefone || "-"}
            </h2>
          </div>

          <div>
            <p className="text-gray-500">
              Banco
            </p>

            <h2 className="font-bold text-2xl">
              {locador.banco || "-"}
            </h2>
          </div>

          <div>
            <p className="text-gray-500">
              Agência
            </p>

            <h2 className="font-bold text-2xl">
              {locador.agencia || "-"}
            </h2>
          </div>

          <div>
            <p className="text-gray-500">
              Conta
            </p>

            <h2 className="font-bold text-2xl">
              {locador.conta || "-"}
            </h2>
          </div>

          <div>
            <p className="text-gray-500">
              Chave PIX
            </p>

            <h2 className="font-bold text-2xl">
              {locador.pix || "-"}
            </h2>
          </div>

          <div>
            <p className="text-gray-500">
              Taxa Administração
            </p>

            <h2 className="font-bold text-2xl">
              {locador.taxaAdministracao || 0}%
            </h2>
          </div>

          <div>
            <p className="text-gray-500">
              Multa
            </p>

            <h2 className="font-bold text-2xl">
              {locador.multa || 0}%
            </h2>
          </div>

          <div>
            <p className="text-gray-500">
              Juros
            </p>

            <h2 className="font-bold text-2xl">
              {locador.juros || 0}% a.m.
            </h2>
          </div>

          <div>
            <p className="text-gray-500">
              Unidades Vinculadas
            </p>

            <h2 className="font-bold text-2xl">
              {totalUnidades}
            </h2>
          </div>

        </div>

        <div className="mt-10">
          <p className="text-gray-500 mb-2">
            Observações
          </p>

          <div className="bg-gray-50 border rounded-2xl p-6">
            {locador.observacoes ||
              "Nenhuma observação cadastrada."}
          </div>
        </div>

      </div>
    </MainLayout>
  );
}