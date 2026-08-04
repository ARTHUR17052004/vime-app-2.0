"use client";

import { useCallback, useEffect, useState } from "react";

import MainLayout from "../components/layout/MainLayout";

import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";

import SearchInput from "../components/common/SearchInput";

import LocadorModal from "../components/locadores/LocadorModal";
import LocadorForm from "../components/locadores/LocadorForm";
import LocadorCard from "../components/locadores/LocadorCard";

import { LocadorService } from "@/services/locadores.service";

export default function LocadoresPage() {

  const [modalOpen, setModalOpen] = useState(false);

  const [locadores, setLocadores] = useState([]);

  const [locadorEditando, setLocadorEditando] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const carregarLocadores = useCallback(async () => {

    try {

      setLoading(true);

      setError("");

      const response = await LocadorService.listar();

      setLocadores(response.data || response);

    } catch (err) {

      console.error(err);

      setError("Não foi possível carregar os locadores.");

    } finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {

    carregarLocadores();

  }, [carregarLocadores]);

  async function salvarLocador(dados) {

    try {

      if (locadorEditando) {

        await LocadorService.atualizar(

          locadorEditando.id,

          dados

        );

      } else {

        await LocadorService.criar(dados);

      }

      await carregarLocadores();

      setLocadorEditando(null);

      setModalOpen(false);

    } catch (err) {

      console.error(err);

      alert("Erro ao salvar locador.");

    }

  }

  async function excluirLocador(id) {

    const confirmar = window.confirm(
      "Deseja excluir este locador?"
    );

    if (!confirmar) return;

    try {

      await LocadorService.excluir(id);

      await carregarLocadores();

    } catch (err) {

      console.error(err);

      alert("Erro ao excluir locador.");

    }

  }

  function editarLocador(locador) {

    setLocadorEditando(locador);

    setModalOpen(true);

  }

  function novoLocador() {

    setLocadorEditando(null);

    setModalOpen(true);

  }

  const locadoresFiltrados = locadores.filter((locador) => {

    const termo = search.toLowerCase();

    return (

      locador.nome
        ?.toLowerCase()
        .includes(termo)

      ||

      locador.email
        ?.toLowerCase()
        .includes(termo)

      ||

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
          count={locadores.length}
          countLabel="locador(es) cadastrado(s)"
          actions={
            <Button onClick={novoLocador}>
              + Novo Locador
            </Button>
          }
        />

        {loading && (

          <div className="mt-10 text-center text-gray-400">

            Carregando locadores...

          </div>

        )}

        {error && (

          <div className="mt-10 text-center text-red-400">

            {error}

          </div>

        )}

        {!loading && !error && (

          <>

            <div className="mt-8">

              <SearchInput
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Pesquisar locador..."
              />

            </div>

            <div className="mt-8">

              <LocadorCard
                locadores={locadoresFiltrados}
                onDelete={excluirLocador}
                onEdit={editarLocador}
              />

            </div>

          </>

        )}

        <LocadorModal
          isOpen={modalOpen}
          onClose={() => {

            setModalOpen(false);

            setLocadorEditando(null);

          }}
        >

          <LocadorForm
            onSave={salvarLocador}
            locadorEditando={locadorEditando}
          />

        </LocadorModal>

      </PageContainer>

    </Page>

  </MainLayout>

);
}