"use client";

import { useEffect, useMemo, useState, useCallback } from "react";

import MainLayout from "../components/layout/MainLayout";

import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";

import SearchInput from "../components/common/SearchInput";

import InquilinoStats from "../components/inquilinos/InquilinoStats";
import InquilinoTable from "../components/inquilinos/InquilinoTable";
import InquilinoModal from "../components/inquilinos/InquilinoModal";
import InquilinoForm from "../components/inquilinos/InquilinoForm";

import { InquilinoService } from "../../services/inquilinos.service";

export default function InquilinosPage() {

  const [modalOpen, setModalOpen] = useState(false);

  const [inquilinos, setInquilinos] = useState([]);

  const [inquilinoEditando, setInquilinoEditando] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [erro, setErro] =
    useState("");

  const [search, setSearch] =
    useState("");

  /* ==========================================
     CARREGAR DADOS
  ========================================== */

  const carregarInquilinos = useCallback(async () => {

    try {

      setLoading(true);

      setErro("");

      const resposta =
        await InquilinoService.listar();

      const lista = Array.isArray(resposta)

        ? resposta

        : resposta.data || [];

      setInquilinos(lista);

    } catch (err) {

      console.error(err);

      setErro(

        err.message ||

        "Erro ao carregar inquilinos."

      );

    } finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {

    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarInquilinos();

  }, [carregarInquilinos]);

  /* ==========================================
     CRUD
  ========================================== */

  const salvarInquilino = async (dados) => {

    try {

      if (inquilinoEditando) {

        await InquilinoService.atualizar(

          inquilinoEditando.id,

          dados

        );

      } else {

        await InquilinoService.criar(

          dados

        );

      }

      await carregarInquilinos();

      setModalOpen(false);

      setInquilinoEditando(null);

    } catch (err) {

      console.error(err);

      alert(

        err.message ||

        "Erro ao salvar inquilino."

      );

    }

  };

  const editarInquilino = (inquilino) => {

    setInquilinoEditando(inquilino);

    setModalOpen(true);

  };

  const excluirInquilino = async (id) => {

    const confirmar = window.confirm(

      "Deseja realmente excluir este inquilino?"

    );

    if (!confirmar) return;

    try {

      await InquilinoService.excluir(id);

      await carregarInquilinos();

    } catch (err) {

      console.error(err);

      alert(

        err.message ||

        "Erro ao excluir inquilino."

      );

    }

  };

  const novoInquilino = () => {

    setInquilinoEditando(null);

    setModalOpen(true);

  };

  /* ==========================================
     FILTRO
  ========================================== */

  const inquilinosFiltrados = useMemo(() => {

    const termo = search.toLowerCase();

    return inquilinos.filter((inquilino) => (

      inquilino.nome?.toLowerCase().includes(termo) ||

      inquilino.email?.toLowerCase().includes(termo) ||

      inquilino.telefone?.toLowerCase().includes(termo) ||

      inquilino.cpf?.toLowerCase().includes(termo)

    ));

  }, [inquilinos, search]);

  /* ==========================================
     LOADING
  ========================================== */

  if (loading) {

    return (

      <MainLayout>

        <Page>

          <PageContainer>

            <div className="flex justify-center items-center py-32">

              <p className="text-gray-400 text-lg">

                Carregando inquilinos...

              </p>

            </div>

          </PageContainer>

        </Page>

      </MainLayout>

    );

  }

  return (

    <MainLayout>

      <Page>

        <PageContainer>

          {erro && (

            <div
              className="
                mb-6
                rounded-2xl
                border
                border-red-500/20
                bg-red-500/10
                px-5
                py-4
                text-red-300
              "
            >

              {erro}

            </div>

          )}

          <PageHeader
            title="Inquilinos"
            subtitle="Gerencie todos os inquilinos cadastrados."
            count={inquilinos.length}
            countLabel="inquilino(s) cadastrado(s)"
            actions={
              <Button onClick={novoInquilino}>
                + Novo Inquilino
              </Button>
            }
          />

          <div className="mt-8">

            <SearchInput
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Pesquisar inquilino..."
            />

          </div>

          <div className="mt-8">

            <InquilinoStats
              total={inquilinos.length}
            />

          </div>

          <div className="mt-8">

            <InquilinoTable
              inquilinos={inquilinosFiltrados}
              onDelete={excluirInquilino}
              onEdit={editarInquilino}
            />

          </div>

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

        </PageContainer>

      </Page>

    </MainLayout>

  );

}