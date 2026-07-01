"use client";

import { useState, useEffect } from "react";

import MainLayout from "../components/layout/MainLayout";
import InquilinoModal from "../components/inquilinos/InquilinoModal";
import InquilinoForm from "../components/inquilinos/InquilinoForm";
import InquilinoTable from "../components/inquilinos/InquilinoTable";

export default function InquilinosPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const [inquilinos, setInquilinos] = useState([]);

  const [inquilinoEditando, setInquilinoEditando] =
    useState(null);

  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    const dados = JSON.parse(
      localStorage.getItem("vime-inquilinos") || "[]"
    );

    setInquilinos(dados);

    setCarregado(true);
  }, []);

  useEffect(() => {
    if (!carregado) return;

    localStorage.setItem(
      "vime-inquilinos",
      JSON.stringify(inquilinos)
    );
  }, [inquilinos, carregado]);

  const salvarInquilino = (dados) => {
    if (inquilinoEditando) {
      setInquilinos((prev) =>
        prev.map((item) =>
          item.id === inquilinoEditando.id
            ? {
                ...item,
                ...dados,
              }
            : item
        )
      );

      setInquilinoEditando(null);
      setModalOpen(false);

      return;
    }

    const novoInquilino = {
      id: Date.now(),
      ...dados,
    };

    setInquilinos((prev) => [
      ...prev,
      novoInquilino,
    ]);

    const kitnets = JSON.parse(
      localStorage.getItem("vime-kitnets") || "[]"
    );

    const kitnetsAtualizadas = kitnets.map(
      (kitnet) => {
        if (
          String(kitnet.id) ===
          String(dados.kitnetId)
        ) {
          return {
            ...kitnet,
            status: "Ocupada",
            inquilinoId: novoInquilino.id,
            inquilinoNome: novoInquilino.nome,
          };
        }

        return kitnet;
      }
    );

    localStorage.setItem(
      "vime-kitnets",
      JSON.stringify(kitnetsAtualizadas)
    );

    setModalOpen(false);
  };

  const editarInquilino = (inquilino) => {
    setInquilinoEditando(inquilino);

    setModalOpen(true);
  };

  const excluirInquilino = (id) => {
    const confirmar = window.confirm(
      "Deseja realmente excluir este inquilino?"
    );

    if (!confirmar) return;

    const inquilino = inquilinos.find(
      (item) => item.id === id
    );

    if (inquilino?.kitnetId) {
      const kitnets = JSON.parse(
        localStorage.getItem("vime-kitnets") || "[]"
      );

      const kitnetsAtualizadas = kitnets.map(
        (kitnet) => {
          if (
            String(kitnet.id) ===
            String(inquilino.kitnetId)
          ) {
            return {
              ...kitnet,
              status: "Disponível",
              inquilinoId: null,
              inquilinoNome: null,
            };
          }

          return kitnet;
        }
      );

      localStorage.setItem(
        "vime-kitnets",
        JSON.stringify(kitnetsAtualizadas)
      );
    }

    setInquilinos((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const novoInquilino = () => {
    setInquilinoEditando(null);

    setModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            Inquilinos
          </h1>

          <p className="text-gray-500 mt-2">
            Gestão de moradores
          </p>

          <p className="text-sm text-green-600 mt-1">
            {inquilinos.length} inquilino(s) cadastrado(s)
          </p>
        </div>

        <button
          onClick={novoInquilino}
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
          + Novo Inquilino
        </button>
      </div>

      <InquilinoTable
        inquilinos={inquilinos}
        onDelete={excluirInquilino}
        onEdit={editarInquilino}
      />

      <InquilinoModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setInquilinoEditando(null);
        }}
      >
        <InquilinoForm
          onSave={salvarInquilino}
          inquilino={inquilinoEditando}
        />
      </InquilinoModal>
    </MainLayout>
  );
}