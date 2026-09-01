"use client";

import { useCallback, useEffect, useState } from "react";

import MainLayout from "../components/layout/MainLayout";

import { ChamadoService } from "@/services/chamado.service";

import PageHeader from "../components/ui/PageHeader";
import SearchInput from "../components/common/SearchInput";

import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import PageSection from "../components/ui/PageSection";
import FadeIn from "../components/ui/FadeIn";

import Button from "../components/ui/Button";
import SemPermissao from "../components/ui/SemPermissao";
import Modal from "../components/ui/Modal";

import ChamadoCard from "../components/suporte/ChamadoCard";
import ChamadoForm from "../components/suporte/ChamadoForm";

import { usePermissao } from "../../hooks/usePermissao";

const ABAS = [
  { chave: "todos", rotulo: "Todos" },
  { chave: "ABERTO", rotulo: "Abertos" },
  { chave: "EM_ANDAMENTO", rotulo: "Em Andamento" },
  { chave: "RESOLVIDO", rotulo: "Resolvidos" },
  { chave: "FECHADO", rotulo: "Fechados" },
];

export default function SuportePage() {

  const podeVisualizar = usePermissao("suporte.visualizar");
  const podeCriar = usePermissao("suporte.criar");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [chamados, setChamados] =
    useState([]);

  const [carregado, setCarregado] =
    useState(false);

  const [abaSelecionada, setAbaSelecionada] =
    useState("todos");

  const [pesquisa, setPesquisa] =
    useState("");

  const carregar = useCallback(async () => {

    try {

      const resposta = await ChamadoService.listar();

      setChamados(
        Array.isArray(resposta) ? resposta : resposta.data || []
      );

    } catch (err) {

      console.error("Erro ao carregar chamados:", err);

    } finally {

      setCarregado(true);

    }

  }, []);

  useEffect(() => {

    carregar();

  }, [carregar]);

  async function salvarChamado(dados) {

    const payload = {
      numero: dados.numero,
      titulo: dados.titulo,
      descricao: dados.descricao,
      categoria: dados.categoria,
      criticidade: dados.criticidade,
    };

    try {

      const criado = await ChamadoService.criar(payload);

      const chamadoCriado = criado.data || criado;

      if (dados.anexo) {

        await ChamadoService.enviarMensagem(
          chamadoCriado.id,
          {
            texto: null,
            anexoNome: dados.anexo.nome,
            anexoTipo: dados.anexo.tipo,
            anexoDados: dados.anexo.dados,
          }
        );

      }

      await carregar();

      setModalOpen(false);

    } catch (err) {

      alert(err.message || "Erro ao abrir chamado.");

    }

  }

  async function excluirChamado(id) {

    const confirmar =
      window.confirm(
        "Deseja excluir este chamado?"
      );

    if (!confirmar)
      return;

    try {

      await ChamadoService.excluir(id);

      await carregar();

    } catch (err) {

      alert(err.message || "Erro ao excluir chamado.");

    }

  }

  const chamadosFiltrados = chamados.filter((item) => {

    const texto = `
      ${item.numero || ""}
      ${item.titulo || ""}
      ${item.descricao || ""}
      ${item.criadoPorNome || ""}
    `.toLowerCase();

    if (
      pesquisa &&
      !texto.includes(
        pesquisa.toLowerCase()
      )
    ) {
      return false;
    }

    if (abaSelecionada === "todos") return true;

    return item.status === abaSelecionada;

  });

  if (!podeVisualizar) {
    return <SemPermissao />;
  }

  if (!carregado) {
    return (
      <MainLayout>
        <div className="py-32 text-center text-[var(--text-subtle)]">
          Carregando chamados...
        </div>
      </MainLayout>
    );
  }

  return (

    <MainLayout>

      <Page>

        <PageContainer>

          <FadeIn>

            <PageHeader
              title="Suporte Técnico"
              subtitle="Abra chamados para relatar problemas do sistema e acompanhe as respostas."
              count={chamados.length}
              countLabel="chamado(s) aberto(s)"
              actions={
                podeCriar && (
                  <Button onClick={() => setModalOpen(true)}>
                    + Novo Chamado
                  </Button>
                )
              }
            >

              <SearchInput
                placeholder="Pesquisar chamado..."
                value={pesquisa}
                onChange={(e) =>
                  setPesquisa(e.target.value)
                }
              />

            </PageHeader>

          </FadeIn>

          <FadeIn delay={0.15}>

            <PageSection spacing="lg">

              <div className="flex flex-wrap gap-2">

                {ABAS.map((aba) => (

                  <button
                    key={aba.chave}
                    onClick={() => setAbaSelecionada(aba.chave)}
                    className={`
                      rounded-full
                      px-5
                      py-2.5
                      text-sm
                      font-semibold
                      border
                      transition
                      ${
                        abaSelecionada === aba.chave
                          ? "bg-emerald-600 border-emerald-500 text-white"
                          : "bg-[var(--surface-2)] border-[var(--border-token)] text-[var(--text-muted)] hover:bg-[var(--surface-3)]"
                      }
                    `}
                  >
                    {aba.rotulo}
                  </button>

                ))}

              </div>

            </PageSection>

          </FadeIn>

          <FadeIn delay={0.20}>

            <PageSection spacing="xxl">

              <ChamadoCard
                chamados={chamadosFiltrados}
                onDelete={excluirChamado}
              />

            </PageSection>

          </FadeIn>

          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Novo Chamado"
            subtitle="Conte o que está acontecendo -- quanto mais detalhe, mais rápido a gente resolve."
            size="xl"
            closeOnOverlay={false}
          >

            <ChamadoForm
              onSave={salvarChamado}
            />

          </Modal>

        </PageContainer>

      </Page>

    </MainLayout>

  );

}
