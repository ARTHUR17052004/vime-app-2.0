"use client";

import { useEffect, useState } from "react";

import MainLayout from "../components/layout/MainLayout";
import LocadorModal from "../components/locadores/LocadorModal";
import LocadorForm from "../components/locadores/LocadorForm";
import LocadorCard from "../components/locadores/LocadorCard";

export default function LocadoresPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const [locadores, setLocadores] = useState([]);

  const [locadorEditando, setLocadorEditando] =
    useState(null);

  const [carregado, setCarregado] =
    useState(false);

  useEffect(() => {
    const dados = JSON.parse(
      localStorage.getItem(
        "vime-locadores"
      ) || "[]"
    );

    setLocadores(dados);

    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;

    localStorage.setItem(
      "vime-locadores",
      JSON.stringify(locadores)
    );
  }, [locadores, carregado]);

  const salvarLocador = (dados) => {
    if (locadorEditando) {
      const listaAtualizada =
        locadores.map((item) =>
          item.id === locadorEditando.id
            ? {
                ...item,
                ...dados,
              }
            : item
        );

      setLocadores(listaAtualizada);

      setLocadorEditando(null);

      setModalOpen(false);

      return;
    }

    const novoLocador = {
      id: Date.now(),
      ...dados,
    };

    setLocadores((prev) => [
      ...prev,
      novoLocador,
    ]);

    setModalOpen(false);
  };

  const editarLocador = (locador) => {
    setLocadorEditando(locador);

    setModalOpen(true);
  };

  const excluirLocador = (id) => {
    const confirmar = window.confirm(
      "Deseja excluir este locador?"
    );

    if (!confirmar) return;

    setLocadores((prev) =>
      prev.filter(
        (locador) =>
          locador.id !== id
      )
    );
  };

  const novoLocador = () => {
    setLocadorEditando(null);

    setModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            Locadores
          </h1>

          <p className="text-gray-500 mt-2">
            Gestão de proprietários
          </p>

          <p className="text-sm text-green-600 mt-1">
            {locadores.length} locador(es)
            cadastrado(s)
          </p>
        </div>

        <button
          onClick={novoLocador}
          className="
            bg-green-700
            text-white
            px-6
            py-3
            rounded-lg
            hover:bg-green-800
          "
        >
          + Novo Locador
        </button>
      </div>

      <LocadorCard
        locadores={locadores}
        onDelete={excluirLocador}
        onEdit={editarLocador}
      />

      <LocadorModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setLocadorEditando(null);
        }}
      >
        <LocadorForm
          onSave={salvarLocador}
          locadorEditando={
            locadorEditando
          }
        />
      </LocadorModal>
    </MainLayout>
  );
}