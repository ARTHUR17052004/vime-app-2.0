/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import { useCallback, useEffect, useState } from "react";

import MainLayout from "../components/layout/MainLayout";

import { VistoriaService } from "@/services/vistoria.service";

import VistoriaTabs from "../components/vistorias/VistoriaTabs";
import VistoriaModal from "../components/vistorias/VistoriaModal";
import VistoriaForm from "../components/vistorias/VistoriaForm";
import VistoriaConcluirModal from "../components/vistorias/VistoriaConcluirModal";
import VistoriaRelatorios from "../components/vistorias/VistoriaRelatorios";
import VistoriaProximasVistorias from "../components/vistorias/VistoriaProximasVistorias";
import OcorrenciaCard from "../components/vistorias/OcorrenciaCard";
import FadeIn from "../components/ui/FadeIn";
import PageSection from "../components/ui/PageSection";
import Button from "../components/ui/Button";
import PageHeader from "../components/ui/PageHeader";
import SearchInput from "../components/common/SearchInput";

import VistoriaStats from "../components/vistorias/VistoriaStats";
import VistoriaFilters from "../components/vistorias/VistoriaFilters";
import VistoriaCardList from "../components/vistorias/VistoriaCardList";
import ResidenciaFiltro from "../components/common/ResidenciaFiltro";
export default function VistoriasPage() {

  const [modalOpen, setModalOpen] =
    useState(false);

  const [abaSelecionada, setAbaSelecionada] =
    useState("visao-geral");

  const [filtroSelecionado, setFiltroSelecionado] =
    useState("Todos");

  const [residenciaSelecionada, setResidenciaSelecionada] =
    useState("");

  const [search, setSearch] =
    useState("");
  
  const [vistorias, setVistorias] =
    useState([]);

  const [vistoriaEditando, setVistoriaEditando] =
    useState(null);

  const [concluirModalOpen, setConcluirModalOpen] =
    useState(false);

  const [vistoriaParaConcluir, setVistoriaParaConcluir] =
    useState(null);

  const [carregado, setCarregado] =
    useState(false);

  const carregar = useCallback(async () => {

    try {

      const resposta = await VistoriaService.listar();

      const dados = Array.isArray(resposta)
        ? resposta
        : resposta.data || [];

      const hoje = new Date().toISOString().split("T")[0];

      const atualizadas = dados.map((vistoria) => {

        const dataProxima = vistoria.dataProxima
          ? new Date(vistoria.dataProxima).toISOString().split("T")[0]
          : "";

        const dataUltima = vistoria.dataUltima
          ? new Date(vistoria.dataUltima).toISOString().split("T")[0]
          : "";

        const normalizada = {
          ...vistoria,
          nomeVistoria: vistoria.titulo,
          unidadeNome: vistoria.unidade?.nome || "",
          kitnetNome: vistoria.kitnet?.nome || vistoria.kitnet?.numero || "",
          dataUltima,
          dataProxima,
        };

        if (
          normalizada.status === "PROGRAMADA" &&
          dataProxima &&
          dataProxima < hoje
        ) {

          normalizada.status = "ATRASADA";

        }

        return normalizada;

      });

      setVistorias(atualizadas);

    } catch (err) {

      console.error("Erro ao carregar vistorias:", err);

    } finally {

      setCarregado(true);

    }

  }, []);

  useEffect(() => {

    carregar();

  }, [carregar]);

 const salvarVistoria = async (
  dados
) => {

  const payload = {
    titulo: dados.nomeVistoria || dados.titulo,
    unidadeId: dados.unidadeId || null,
    kitnetId: dados.kitnetId || null,
    categoria: dados.categoria,
    criticidade: dados.criticidade,
    periodicidade: dados.periodicidade,
    responsavel: dados.responsavel,
    dataUltima: dados.dataUltima || null,
    dataProxima: dados.dataProxima || null,
    status: dados.status,
    checklist: dados.checklist,
    fotos: dados.fotos,
    observacoes: dados.observacoes,
  };

  try {

    if (vistoriaEditando) {

      await VistoriaService.atualizar(
        vistoriaEditando.id,
        payload
      );

    } else {

      await VistoriaService.criar(payload);

    }

    await carregar();

    setVistoriaEditando(null);

    setModalOpen(false);

  } catch (err) {

    alert(err.message || "Erro ao salvar vistoria.");

  }

};

  const editarVistoria = (
    vistoria
  ) => {

    setVistoriaEditando({
      ...vistoria,
      nomeVistoria: vistoria.titulo,
      unidadeId: vistoria.unidadeId || "",
      kitnetId: vistoria.kitnetId || "",
      dataUltima: vistoria.dataUltima
        ? new Date(vistoria.dataUltima).toISOString().split("T")[0]
        : "",
      dataProxima: vistoria.dataProxima
        ? new Date(vistoria.dataProxima).toISOString().split("T")[0]
        : "",
    });

    setModalOpen(true);

  };

  const excluirVistoria = async (
    id
  ) => {

    const confirmar =
      window.confirm(
        "Deseja excluir esta vistoria?"
      );

    if (!confirmar) return;

    try {

      await VistoriaService.excluir(id);

      await carregar();

    } catch (err) {

      alert(err.message || "Erro ao excluir vistoria.");

    }

  };

const abrirConcluirVistoria = (id) => {

  const vistoria = vistorias.find(
    (item) => item.id === id
  );

  setVistoriaParaConcluir(vistoria);
  setConcluirModalOpen(true);

};

const confirmarConcluirVistoria = async (
  { dataUltima, fotosConclusao }
) => {

  const vistoria = vistoriaParaConcluir;

  if (!vistoria) return;

  const dataEscolhida = dataUltima
    ? new Date(dataUltima)
    : new Date();

  const proximaData = new Date(dataEscolhida);

  let recorrente = true;

  switch (vistoria?.periodicidade) {

    case "Semanal":
      proximaData.setDate(proximaData.getDate() + 7);
      break;

    case "Quinzenal":
      proximaData.setDate(proximaData.getDate() + 15);
      break;

    case "Mensal":
      proximaData.setMonth(proximaData.getMonth() + 1);
      break;

    case "Bimestral":
      proximaData.setMonth(proximaData.getMonth() + 2);
      break;

    case "Trimestral":
      proximaData.setMonth(proximaData.getMonth() + 3);
      break;

    case "Semestral":
      proximaData.setMonth(proximaData.getMonth() + 6);
      break;

    case "Anual":
      proximaData.setFullYear(proximaData.getFullYear() + 1);
      break;

    default:
      recorrente = false;
      break;

  }

  try {

    await VistoriaService.atualizar(vistoria.id, {
      status: recorrente ? "PROGRAMADA" : "REALIZADA",
      dataUltima: dataEscolhida.toISOString(),
      dataProxima: recorrente ? proximaData.toISOString() : null,
      concluidaEm: new Date().toISOString(),
      fotosConclusao,
    });

    await carregar();

    setConcluirModalOpen(false);
    setVistoriaParaConcluir(null);

  } catch (err) {

    alert(err.message || "Erro ao concluir vistoria.");

  }

};

const fixarVistoria = async (id, fixado) => {

  try {

    await VistoriaService.atualizar(id, { fixado });

    await carregar();

  } catch (err) {

    alert(err.message || "Erro ao fixar vistoria.");

  }

};

  const cancelarVistoria = async (
  id
) => {

  try {

    await VistoriaService.atualizar(id, {
      status: "CANCELADA",
    });

    await carregar();

  } catch (err) {

    alert(err.message || "Erro ao cancelar vistoria.");

  }

};

  const novaVistoria = () => {

    setVistoriaEditando(
      null
    );

    setModalOpen(true);

  };
     const vistoriasFiltradas = vistorias.filter((vistoria) => {

  const texto = `
    ${vistoria.titulo || ""}
    ${vistoria.categoria || ""}
    ${vistoria.unidadeNome || ""}
    ${vistoria.kitnetNome || ""}
    ${vistoria.responsavel || ""}
  `.toLowerCase();

  if (
    search &&
    !texto.includes(search.toLowerCase())
  ) {
    return false;
  }

  if (
    filtroSelecionado !== "Todos" &&
    vistoria.categoria !== filtroSelecionado
  ) {
    return false;
  }

  if (
    residenciaSelecionada &&
    vistoria.unidadeId !== residenciaSelecionada
  ) {
    return false;
  }

  switch (abaSelecionada) {

    case "agendadas":
      return vistoria.status === "PROGRAMADA";

    case "realizadas":
      return vistoria.status === "REALIZADA";

    case "pendentes":
      return vistoria.status === "PENDENTE";

    default:
      return true;

  }

}).sort(
  (a, b) => (b.fixado ? 1 : 0) - (a.fixado ? 1 : 0)
);

  if (!carregado) {
    return (
      <MainLayout>
        <div className="py-32 text-center text-[var(--text-subtle)]">
          Carregando vistorias...
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
            title="Vistorias"
            subtitle="Gerencie todas as vistorias cadastradas."
            count={vistorias.length}
            countLabel="vistoria(s) cadastrada(s)"
            actions={
              <Button onClick={novaVistoria}>
                + Nova Vistoria
              </Button>
            }
          >

            <SearchInput
              placeholder="Pesquisar vistoria..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </PageHeader>

        </FadeIn>

        <FadeIn delay={0.10}>

          <PageSection spacing="xl">

            <VistoriaStats
              vistorias={vistorias}
            />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.15}>

          <PageSection spacing="lg">

            <VistoriaFilters
              filtroSelecionado={filtroSelecionado}
              setFiltroSelecionado={setFiltroSelecionado}
            />

            <div className="mt-4">
              <ResidenciaFiltro
                value={residenciaSelecionada}
                onChange={setResidenciaSelecionada}
              />
            </div>

            <VistoriaTabs
              abaSelecionada={abaSelecionada}
              setAbaSelecionada={setAbaSelecionada}
            />

          </PageSection>

        </FadeIn>

        {abaSelecionada === "ocorrencias" ? (

          <FadeIn delay={0.20}>

            <PageSection spacing="xxl">

              <OcorrenciaCard />

            </PageSection>

          </FadeIn>

        ) : (

          <>

            <FadeIn delay={0.20}>

              <PageSection spacing="xxl">

                <VistoriaCardList
                  vistorias={vistoriasFiltradas}
                  onEdit={editarVistoria}
                  onDelete={excluirVistoria}
                  onConcluir={abrirConcluirVistoria}
                  onCancelar={cancelarVistoria}
                  onFixar={fixarVistoria}
                />

              </PageSection>

            </FadeIn>

            <FadeIn delay={0.30}>

              <PageSection spacing="xxl">

                <VistoriaProximasVistorias
                  vistorias={vistorias}
                />

              </PageSection>

            </FadeIn>

            <FadeIn delay={0.40}>

              <PageSection spacing="xxl">

                <VistoriaRelatorios
                  vistorias={vistorias}
                />

              </PageSection>

            </FadeIn>

          </>

        )}

        <VistoriaModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setVistoriaEditando(null);
          }}
        >

          <VistoriaForm
            onSave={salvarVistoria}
            vistoriaEditando={vistoriaEditando}
          />

        </VistoriaModal>

        <VistoriaConcluirModal
          isOpen={concluirModalOpen}
          onClose={() => {
            setConcluirModalOpen(false);
            setVistoriaParaConcluir(null);
          }}
          vistoria={vistoriaParaConcluir}
          onConfirm={confirmarConcluirVistoria}
        />

      </PageContainer>

    </Page>

  </MainLayout>

  );
}