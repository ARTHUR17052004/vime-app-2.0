"use client";

import { useState, useEffect } from "react";

import MainLayout from "../components/layout/MainLayout";
import UnitModal from "../components/unidades/UnitModal";
import UnitForm from "../components/unidades/UnitForm";
import UnitCardList from "../components/unidades/UnitCardList";

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

  const visualizarUnidade = (unidade) => {
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

  const unidadesFiltradas = unidades.filter((unidade) => {
    const termo = search.toLowerCase();

    return (
      unidade.nome?.toLowerCase().includes(termo) ||
      unidade.cidade?.toLowerCase().includes(termo) ||
      unidade.logradouro?.toLowerCase().includes(termo)
    );
  });

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="
              text-6xl
              font-black
              tracking-tight
              text-white
            "
          >
            Unidades
          </h1>

          <p
            className="
              mt-2
              text-2xl
              text-gray-300
            "
          >
            Gerencie todas as unidades cadastradas.
          </p>

          <p
            className="
              mt-1
              text-sm
              font-semibold
              text-emerald-400
            "
          >
            {unidades.length} unidade(s) cadastrada(s)
          </p>
        </div>

        <button
          onClick={() => {
            setEditingUnit(null);
            setModalOpen(true);
          }}
          className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition"
        >
          + Nova Unidade
        </button>
      </div>

        <div className="mb-8">
       <input
        type="text"
        placeholder="🔎 Buscar por nome, endereço ou cidade..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="
          w-full
          h-14

          rounded-2xl

          bg-white/5
          backdrop-blur-xl

          border
          border-white/10

          px-5

          text-white
          placeholder:text-gray-500

          transition-all

          focus:outline-none
          focus:border-emerald-500/40
          focus:ring-2
          focus:ring-emerald-500/20
        "
      />
      </div>

      <UnitCardList
        unidades={unidadesFiltradas}
        onView={visualizarUnidade}
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