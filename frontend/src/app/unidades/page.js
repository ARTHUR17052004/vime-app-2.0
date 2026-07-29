"use client";

import { useState, useEffect, useCallback } from "react";

import MainLayout from "../components/layout/MainLayout";

import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";

import SearchInput from "../components/common/SearchInput";

import UnitModal from "../components/unidades/UnitModal";
import UnitForm from "../components/unidades/UnitForm";
import UnitCardList from "../components/unidades/UnitCardList";

import { UnidadeService } from "../../services/unidades.service";

export default function UnidadesPage() {

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

      console.log(
        "Resposta da API:",
        resposta
      );

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
          "Erro ao carregar unidades."
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
          "Erro ao salvar unidade."
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
      "Deseja realmente excluir esta unidade?"
    );

    if (!confirmar) return;

    try {

      await UnidadeService.excluir(id);

      await carregarUnidades();

    } catch (err) {

      console.error(err);

      alert(
        err.message ||
        "Erro ao excluir unidade."
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
     LOADING
  =================================================== */

  if (loading) {

    return (

      <MainLayout>

        <Page>

          <PageContainer>

            <div className="flex justify-center items-center py-32">

              <p className="text-gray-400 text-lg">

                Carregando unidades...

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
            onChange={(e) =>
              setSearch(e.target.value)
            }
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