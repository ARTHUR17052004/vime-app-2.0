"use client";

import { useState, useEffect } from "react";

import MainLayout from "../components/layout/MainLayout";
import UnitModal from "../components/unidades/UnitModal";
import UnitForm from "../components/unidades/UnitForm";
import UnitTable from "../components/unidades/UnitTable";

export default function UnidadesPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const [editingUnit, setEditingUnit] = useState(null);

  const [search, setSearch] = useState("");

  const [unidades, setUnidades] = useState(() => {
    if (typeof window !== "undefined") {
      const dados = localStorage.getItem("vime-unidades");
      return dados ? JSON.parse(dados) : [];
    }

    return [];
  });

  useEffect(() => {
    localStorage.setItem(
      "vime-unidades",
      JSON.stringify(unidades)
    );
  }, [unidades]);

  const adicionarUnidade = (dados) => {
    if (editingUnit) {
      setUnidades((prev) =>
        prev.map((item) =>
          item.id === editingUnit.id
            ? { ...item, ...dados }
            : item
        )
      );

      setEditingUnit(null);
    } else {
      setUnidades((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...dados,
        },
      ]);
    }

    setModalOpen(false);
  };

  const editarUnidade = (unidade) => {
    setEditingUnit(unidade);
    setModalOpen(true);
  };

  const excluirUnidade = (id) => {
    const confirmar = window.confirm(
      "Deseja realmente excluir esta unidade?"
    );

    if (!confirmar) return;

    setUnidades((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const unidadesFiltradas = unidades.filter((unidade) =>
    unidade.nome
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            Unidades
          </h1>

          <p className="text-gray-500 mt-2">
            Gerenciamento de propriedades cadastradas.
          </p>

          <p className="text-sm text-green-600 mt-1">
            {unidades.length} unidade(s) cadastrada(s)
          </p>
        </div>

        <button
          onClick={() => {
            setEditingUnit(null);
            setModalOpen(true);
          }}
          className="bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 transition"
        >
          Nova Unidade
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Buscar unidade..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg p-3"
        />
      </div>

      <UnitTable
        unidades={unidadesFiltradas}
        onEdit={editarUnidade}
        onDelete={excluirUnidade}
      />

      <UnitModal
        isOpen={modalOpen}
        onClose={() => {
          setEditingUnit(null);
          setModalOpen(false);
        }}
      >
        <UnitForm
          unidade={editingUnit}
          onSave={adicionarUnidade}
          onCancel={() => {
            setEditingUnit(null);
            setModalOpen(false);
          }}
        />
      </UnitModal>
    </MainLayout>
  );
}