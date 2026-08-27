"use client";

import { useState, useEffect, useCallback } from "react";

import MainLayout from "../components/layout/MainLayout";

import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import PageHeader from "../components/ui/PageHeader";
import PageSection from "../components/ui/PageSection";
import Button from "../components/ui/Button";
import FadeIn from "../components/ui/FadeIn";

import SearchInput from "../components/common/SearchInput";

import UnitModal from "../components/unidades/UnitModal";
import UnitForm from "../components/unidades/UnitForm";
import UnitCardList from "../components/unidades/UnitCardList";
import SemPermissao from "../components/ui/SemPermissao";

import { UnidadeService } from "@/services/unidades.service";
import { usePermissao } from "../../hooks/usePermissao";

export default function UnidadesPage() {

  const podeVisualizar = usePermissao("unidades.visualizar");
  const podeCriar = usePermissao("unidades.criar");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [erro, setErro] = useState("");

  const [unidades, setUnidades] = useState([]);

  /* ===================================================
     CARREGAR DADOS
  =================================================== */

  const carregarUnidades = useCallback(async () => {

    try {

      setLoading(true);

      setErro("");

      const resposta =
        await UnidadeService.listar();

      console.log(JSON.stringify(resposta, null, 2));

      const lista = Array.isArray(resposta)

        ? resposta

        : Array.isArray(resposta.data)

        ? resposta.data

        : [];

      setUnidades(lista);

    } catch (err) {

      console.error(err);

      setErro(
        err.message ||
          "Erro ao carregar residências."
      );

      setUnidades([]);

    } finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {

    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarUnidades();

  }, [carregarUnidades]);

  /* ===================================================
     SALVAR
  =================================================== */

  const adicionarUnidade = async (dados) => {

    try {

      const payload = {

        ...dados,

        kitnets: Number(
          dados.kitnets || 0
        ),

        aluguel:
          dados.aluguel !== ""
            ? Number(dados.aluguel)
            : null,

        vencimento:
          dados.vencimento !== ""
            ? Number(dados.vencimento)
            : null,

      };

      if (editingUnit) {

        await UnidadeService.atualizar(
          editingUnit.id,
          payload
        );

      } else {

        await UnidadeService.criar(
          payload
        );

      }

      await carregarUnidades();

      setEditingUnit(null);

      setModalOpen(false);

    } catch (err) {

      console.error(err);

      alert(
        err.message ||
          "Erro ao salvar residência."
      );

    }

  };
    /* ===================================================
     EDITAR
  =================================================== */

  const editarUnidade = (unidade) => {

    setEditingUnit(unidade);

    setModalOpen(true);

  };

  /* ===================================================
     VISUALIZAR
  =================================================== */

  const visualizarUnidade = (unidade) => {

    setEditingUnit(unidade);

    setModalOpen(true);

  };

  /* ===================================================
     EXCLUIR
  =================================================== */

  const excluirUnidade = async (id) => {

    const confirmar = window.confirm(
      "Deseja realmente excluir esta residência?"
    );

    if (!confirmar) return;

    try {

      await UnidadeService.excluir(id);

      await carregarUnidades();

    } catch (err) {

      console.error(err);

      alert(
        err.message ||
        "Erro ao excluir residência."
      );

    }

  };

  /* ===================================================
     FILTRO
  =================================================== */

  const unidadesFiltradas = unidades.filter(
    (unidade) => {

      const termo = search.toLowerCase();

      return (

        unidade.nome
          ?.toLowerCase()
          .includes(termo)

        ||

        unidade.cidade
          ?.toLowerCase()
          .includes(termo)

        ||

        unidade.logradouro
          ?.toLowerCase()
          .includes(termo)

      );

    }
  );

  /* ===================================================
     PERMISSAO
  =================================================== */

  if (!podeVisualizar) {
    return <SemPermissao />;
  }

  /* ===================================================
     LOADING
  =================================================== */

  if (loading) {

    return (

      <MainLayout>

        <Page>

          <PageContainer>

            <div className="flex justify-center items-center py-32">

              <p className="text-[var(--text-subtle)] text-lg">

                Carregando residências...

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

          <FadeIn delay={0}>

            <PageHeader
              title="Residências"
              subtitle="Gerencie todas as residências cadastradas."
              count={unidades.length}
              countLabel="residência(s) cadastrada(s)"
              actions={

                podeCriar && (
                  <Button
                    onClick={() => {

                      setEditingUnit(null);

                      setModalOpen(true);

                    }}
                  >

                    + Nova Residência

                  </Button>
                )

              }
            />

          </FadeIn>

          <FadeIn delay={0.10}>

            <PageSection>

              <SearchInput
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Buscar por nome, endereço ou cidade..."
              />

            </PageSection>

          </FadeIn>

          <FadeIn delay={0.20}>

            <PageSection>

              <UnitCardList
                unidades={unidadesFiltradas}
                onView={visualizarUnidade}
                onEdit={editarUnidade}
                onDelete={excluirUnidade}
              />

            </PageSection>

          </FadeIn>
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