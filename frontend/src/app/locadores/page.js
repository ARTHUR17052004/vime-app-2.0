"use client";

import { useCallback, useEffect, useState } from "react";

import MainLayout from "../components/layout/MainLayout";

import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import PageHeader from "../components/ui/PageHeader";
import PageSection from "../components/ui/PageSection";
import Button from "../components/ui/Button";
import FadeIn from "../components/ui/FadeIn";

import SearchInput from "../components/common/SearchInput";

import LocadorModal from "../components/locadores/LocadorModal";
import LocadorForm from "../components/locadores/LocadorForm";
import LocadorCardList from "../components/locadores/LocadorCardList";
import SemPermissao from "../components/ui/SemPermissao";

import { LocadorService } from "@/services/locadores.service";
import ResidenciaFiltro from "../components/common/ResidenciaFiltro";
import { usePermissao } from "../../hooks/usePermissao";

export default function LocadoresPage() {

  const podeVisualizar = usePermissao("locadores.visualizar");
  const podeCriar = usePermissao("locadores.criar");

  const [modalOpen, setModalOpen] = useState(false);

  const [locadores, setLocadores] = useState([]);

  const [locadorEditando, setLocadorEditando] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [residenciaSelecionada, setResidenciaSelecionada] = useState("");

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

    const correspondeTexto = (

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

    if (!correspondeTexto) return false;

    if (
      residenciaSelecionada &&
      !locador.unidades?.some(
        (unidade) => unidade.id === residenciaSelecionada
      )
    )
      return false;

    return true;

  });

  if (!podeVisualizar) {
    return <SemPermissao />;
  }

  return (

  <MainLayout>

    <Page>

      <PageContainer>

        <FadeIn>

          <PageHeader
            title="Locadores"
            subtitle="Gerencie todos os proprietários cadastrados."
            count={locadores.length}
            countLabel="locador(es) cadastrado(s)"
            actions={
              podeCriar && (
                <Button onClick={novoLocador}>
                  + Novo Locador
                </Button>
              )
            }
          />

        </FadeIn>

        {loading && (

          <div className="mt-10 text-center text-[var(--text-subtle)]">

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

            <FadeIn delay={0.10}>

              <PageSection>

                <SearchInput
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Pesquisar locador..."
                />

                <div className="mt-4">
                  <ResidenciaFiltro
                    value={residenciaSelecionada}
                    onChange={setResidenciaSelecionada}
                  />
                </div>

              </PageSection>

            </FadeIn>

            <FadeIn delay={0.20}>

              <PageSection>

                <LocadorCardList
                  locadores={locadoresFiltrados}
                  onDelete={excluirLocador}
                  onEdit={editarLocador}
                />

              </PageSection>

            </FadeIn>

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