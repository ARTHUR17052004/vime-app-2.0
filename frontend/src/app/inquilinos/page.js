"use client";

import { useEffect, useMemo, useState, useCallback } from "react";

import MainLayout from "../components/layout/MainLayout";

import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import PageHeader from "../components/ui/PageHeader";
import PageSection from "../components/ui/PageSection";
import Button from "../components/ui/Button";
import FadeIn from "../components/ui/FadeIn";

import SearchInput from "../components/common/SearchInput";

import InquilinoStats from "../components/inquilinos/InquilinoStats";
import InquilinoTable from "../components/inquilinos/InquilinoTable";
import InquilinoModal from "../components/inquilinos/InquilinoModal";
import InquilinoForm from "../components/inquilinos/InquilinoForm";
import ExplicacaoInquilinoModal from "../components/inquilinos/ExplicacaoInquilinoModal";
import ContratoDemonstrativoModal from "../components/contratos/ContratoDemonstrativoModal";
import SemPermissao from "../components/ui/SemPermissao";

import { InquilinoService } from "../../services/inquilinos.service";
import ResidenciaFiltro from "../components/common/ResidenciaFiltro";
import { usePermissao } from "../../hooks/usePermissao";

export default function InquilinosPage() {

  const podeVisualizar = usePermissao("inquilinos.visualizar");
  const podeCriar = usePermissao("inquilinos.criar");

  const [modalOpen, setModalOpen] = useState(false);

  const [explicacaoOpen, setExplicacaoOpen] = useState(false);

  const [inquilinos, setInquilinos] = useState([]);

  const [inquilinoEditando, setInquilinoEditando] =
    useState(null);

  const [gerarContratoAutomatico, setGerarContratoAutomatico] =
    useState(true);

  const [salvandoInquilino, setSalvandoInquilino] =
    useState(false);

  const [demonstrativoContratoId, setDemonstrativoContratoId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [erro, setErro] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [residenciaSelecionada, setResidenciaSelecionada] =
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

    if (salvandoInquilino) return;

    setSalvandoInquilino(true);

    try {

      if (inquilinoEditando) {

        await InquilinoService.atualizar(

          inquilinoEditando.id,

          dados

        );

      } else {

        const resposta = await InquilinoService.criar({

          ...dados,

          gerarContratoAutomatico,

        });

        const dadosResposta = resposta?.data || resposta;

        if (dadosResposta?.avisoContrato) {
          alert(dadosResposta.avisoContrato);
        } else if (dadosResposta?.contratoId) {
          setDemonstrativoContratoId(dadosResposta.contratoId);
        }

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

    } finally {

      setSalvandoInquilino(false);

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

  const abrirExplicacao = () => {

    setInquilinoEditando(null);

    setExplicacaoOpen(true);

  };

  const novoInquilino = () => {

    setExplicacaoOpen(false);

    setInquilinoEditando(null);

    setGerarContratoAutomatico(true);

    setModalOpen(true);

  };

  const adicionarInquilino = () => {

    setExplicacaoOpen(false);

    setInquilinoEditando(null);

    setGerarContratoAutomatico(false);

    setModalOpen(true);

  };

  /* ==========================================
     FILTRO
  ========================================== */

  const inquilinosFiltrados = useMemo(() => {

    const termo = search.toLowerCase();

    return inquilinos.filter((inquilino) => {

      const correspondeTexto =

        inquilino.nome?.toLowerCase().includes(termo) ||

        inquilino.email?.toLowerCase().includes(termo) ||

        inquilino.telefone?.toLowerCase().includes(termo) ||

        inquilino.cpf?.toLowerCase().includes(termo);

      if (!correspondeTexto) return false;

      if (
        residenciaSelecionada &&
        inquilino.kitnet?.unidadeId !== residenciaSelecionada
      )
        return false;

      return true;

    });

  }, [inquilinos, search, residenciaSelecionada]);

  /* ==========================================
     PERMISSAO
  ========================================== */

  if (!podeVisualizar) {
    return <SemPermissao />;
  }

  /* ==========================================
     LOADING
  ========================================== */

  if (loading) {

    return (

      <MainLayout>

        <Page>

          <PageContainer>

            <div className="flex justify-center items-center py-32">

              <p className="text-[var(--text-subtle)] text-lg">

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

          <FadeIn>

            <PageHeader
              title="Inquilinos"
              subtitle="Gerencie todos os inquilinos cadastrados."
              count={inquilinos.length}
              countLabel="inquilino(s) cadastrado(s)"
              actions={
                podeCriar && (
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={abrirExplicacao}
                    >
                      + Adicionar Inquilino
                    </Button>

                    <Button onClick={abrirExplicacao}>
                      + Novo Inquilino
                    </Button>
                  </div>
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
                placeholder="Pesquisar inquilino..."
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

              <InquilinoStats
                total={inquilinos.length}
              />

            </PageSection>

          </FadeIn>

          <FadeIn delay={0.30}>

            <PageSection>

              <InquilinoTable
                inquilinos={inquilinosFiltrados}
                onDelete={excluirInquilino}
                onEdit={editarInquilino}
              />

            </PageSection>

          </FadeIn>

          <ExplicacaoInquilinoModal
            isOpen={explicacaoOpen}
            onClose={() => setExplicacaoOpen(false)}
            onEscolherNovo={novoInquilino}
            onEscolherAdicionar={adicionarInquilino}
          />

          <InquilinoModal
            isOpen={modalOpen}
            onClose={() => {

              setModalOpen(false);

              setInquilinoEditando(null);

            }}
          >

            {!inquilinoEditando && (

              <p
                className={`
                  mb-4 rounded-xl border px-4 py-3 text-sm
                  ${
                    gerarContratoAutomatico
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                      : "border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text-subtle)]"
                  }
                `}
              >
                {gerarContratoAutomatico
                  ? "O contrato será gerado automaticamente ao salvar. Você vai poder conferir o demonstrativo antes de enviar para assinatura."
                  : "Este cadastro não vai gerar contrato automático."}
              </p>

            )}

            <InquilinoForm
              onSave={salvarInquilino}
              inquilino={inquilinoEditando}
              salvando={salvandoInquilino}
            />

          </InquilinoModal>

          <ContratoDemonstrativoModal
            open={!!demonstrativoContratoId}
            contratoId={demonstrativoContratoId}
            onClose={() => setDemonstrativoContratoId(null)}
          />

        </PageContainer>

      </Page>

    </MainLayout>

  );

}