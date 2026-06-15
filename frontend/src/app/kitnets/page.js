"use client";

import { useState, useEffect } from "react";

import MainLayout from "../components/layout/MainLayout";
import KitnetModal from "../components/kitnets/KitnetModal";
import KitnetForm from "../components/kitnets/KitnetForm";
import KitnetTable from "../components/kitnets/KitnetTable";

export default function KitnetsPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const [kitnets, setKitnets] = useState([]);
  const [carregado, setCarregado] = useState(false);

  const [kitnetEditando, setKitnetEditando] =
    useState(null);

  useEffect(() => {
    const dados = JSON.parse(
      localStorage.getItem("vime-kitnets") || "[]"
    );

    setKitnets(dados);
    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;

    localStorage.setItem(
      "vime-kitnets",
      JSON.stringify(kitnets)
    );
  }, [kitnets, carregado]);

  const salvarKitnet = (dados) => {
    if (kitnetEditando) {
      setKitnets((prev) =>
        prev.map((item) =>
          item.id === kitnetEditando.id
            ? {
                ...item,
                ...dados,
              }
            : item
        )
      );
    } else {
      const novaKitnet = {
        id: Date.now(),
        ...dados,
      };

      setKitnets((prev) => [
        ...prev,
        novaKitnet,
      ]);
    }

    setKitnetEditando(null);
    setModalOpen(false);
  };

  const editarKitnet = (kitnet) => {
    setKitnetEditando(kitnet);
    setModalOpen(true);
  };

  const excluirKitnet = (id) => {
    const confirmar = window.confirm(
      "Deseja realmente excluir esta kitnet?"
    );

    if (!confirmar) return;

    setKitnets((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const novaKitnet = () => {
    setKitnetEditando(null);
    setModalOpen(true);
  };

  const totalKitnets = kitnets.length;

  const disponiveis = kitnets.filter(
    (k) => k.status === "Disponível"
  ).length;

  const ocupadas = kitnets.filter(
    (k) => k.status === "Ocupada"
  ).length;

  const manutencao = kitnets.filter(
    (k) => k.status === "Manutenção"
  ).length;

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            Kitnets
          </h1>

          <p className="text-gray-500 mt-2">
            Gestão de kitnets e ocupação
          </p>

          <p className="text-sm text-green-600 mt-1">
            {kitnets.length} kitnet(s) cadastrada(s)
          </p>
        </div>

        <button
          onClick={novaKitnet}
          className="
            bg-green-700
            text-white
            px-6
            py-3
            rounded-lg
            hover:bg-green-800
            transition
          "
        >
          + Nova Kitnet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500 text-sm">
            Total
          </p>

          <h2 className="text-3xl font-bold text-gray-800">
            {totalKitnets}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500 text-sm">
            Disponíveis
          </p>

          <h2 className="text-3xl font-bold text-green-600">
            {disponiveis}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500 text-sm">
            Ocupadas
          </p>

          <h2 className="text-3xl font-bold text-blue-600">
            {ocupadas}
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          <p className="text-gray-500 text-sm">
            Manutenção
          </p>

          <h2 className="text-3xl font-bold text-yellow-600">
            {manutencao}
          </h2>
        </div>
      </div>

      <KitnetTable
        kitnets={kitnets}
        onEdit={editarKitnet}
        onDelete={excluirKitnet}
      />

      <KitnetModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setKitnetEditando(null);
        }}
      >
        <KitnetForm
          kitnet={kitnetEditando}
          onSave={salvarKitnet}
        />
      </KitnetModal>
    </MainLayout>
  );
}