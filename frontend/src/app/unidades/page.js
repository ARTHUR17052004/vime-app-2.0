"use client";

import { useState, useEffect } from "react";

import MainLayout from "../components/layout/MainLayout";

import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";

import SearchInput from "../components/common/SearchInput";

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

      <Page>

        <PageContainer>

          <PageHeader
            title="Unidades"
            subtitle="Gerencie todas as unidades cadastradas."
            count={unidades.length}
            countLabel="unidade(s) cadastrada(s)"
            actions={
              <Button
                onClick={() => {
                  setEditingUnit(null);
                  setModalOpen(true);
                }}
              >
                + Nova Unidade
              </Button>
            }
          />

          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, endereço ou cidade..."
          />

          <div className="mt-8">

            <UnitCardList
              unidades={unidadesFiltradas}
              onView={visualizarUnidade}
              onEdit={editarUnidade}
              onDelete={excluirUnidade}
            />

          </div>

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

        </PageContainer>

      </Page>

    </MainLayout>
  );
}