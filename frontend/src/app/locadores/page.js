"use client";

import { useEffect, useState } from "react";

import MainLayout from "../components/layout/MainLayout";

import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";

import PageHeader from "../components/common/PageHeader";
import SearchInput from "../components/common/SearchInput";
import PrimaryButton from "../components/common/PrimaryButton";
import StatCounter from "../components/common/StatCounter";

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

  const [search, setSearch] =
    useState("");

  useEffect(() => {
    const dados = JSON.parse(
      localStorage.getItem(
        "vime-locadores"
      ) || "[]"
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
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

  const locadoresFiltrados =
    locadores.filter((locador) => {

      const termo =
        search.toLowerCase();

      return (
        locador.nome
          ?.toLowerCase()
          .includes(termo) ||

        locador.email
          ?.toLowerCase()
          .includes(termo) ||

        locador.documento
          ?.toLowerCase()
          .includes(termo)
      );
    });

  return (
    <MainLayout>

      <Page>

        <PageContainer>

          <PageHeader
            title="Locadores"
            subtitle="Gerencie todos os proprietários cadastrados."
          >

            <PrimaryButton
              onClick={novoLocador}
            >
              Novo Locador
            </PrimaryButton>

          </PageHeader>

          <StatCounter
            total={locadores.length}
            label="locador(es) cadastrado(s)"
          />

          <div className="mt-8 mb-8">

            <SearchInput
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Pesquisar locador..."
            />

          </div>

          <LocadorCard
            locadores={locadoresFiltrados}
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

        </PageContainer>

      </Page>

    </MainLayout>
  );
}