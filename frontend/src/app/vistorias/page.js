/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import { useEffect, useState } from "react";

import MainLayout from "../components/layout/MainLayout";

import VistoriaTabs from "../components/vistorias/VistoriaTabs";
import VistoriaModal from "../components/vistorias/VistoriaModal";
import VistoriaForm from "../components/vistorias/VistoriaForm";
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
export default function VistoriasPage() {

  const [modalOpen, setModalOpen] =
    useState(false);

  const [abaSelecionada, setAbaSelecionada] =
    useState("visao-geral");

  const [filtroSelecionado, setFiltroSelecionado] =
    useState("Todos");

  const [search, setSearch] =
    useState("");
  
  const [vistorias, setVistorias] =
    useState([]);

  const [vistoriaEditando, setVistoriaEditando] =
    useState(null);

  const [carregado, setCarregado] =
    useState(false);

  useEffect(() => {
   
  const dados = JSON.parse(
    localStorage.getItem(
      "vime-vistorias"
    ) || "[]"
  );

  const hoje =
    new Date()
      .toISOString()
      .split("T")[0];

  const atualizadas =
    dados.map((vistoria) => {

      if (
        vistoria.status ===
          "PROGRAMADA" &&
        vistoria.dataProxima &&
        vistoria.dataProxima < hoje
      ) {

        return {
          ...vistoria,
          status:
            "ATRASADA",
        };

      }

      return vistoria;

    });

  setVistorias(
    atualizadas
  );

  setCarregado(true);

}, []);

  useEffect(() => {

    if (!carregado) return;

    localStorage.setItem(
      "vime-vistorias",
      JSON.stringify(vistorias)
    );

  }, [vistorias, carregado]);

 const salvarVistoria = (
  dados
) => {

  const agora =
    new Date().toLocaleString(
      "pt-BR"
    );

  if (vistoriaEditando) {

    const listaAtualizada =
      vistorias.map((item) => {

        if (
          item.id !==
          vistoriaEditando.id
        ) {
          return item;
        }

        return {

          ...item,

          ...dados,

          historico: [

            ...(item.historico || []),

            {
              data: agora,
              descricao:
                "Vistoria editada",
            },

          ],

        };

      });

    setVistorias(
      listaAtualizada
    );

    setVistoriaEditando(
      null
    );

    setModalOpen(false);

    return;

  }

  const novaVistoria = {

    id: Date.now(),

    ...dados,

    historico: [

      {
        data: agora,
        descricao:
          "Vistoria criada",
      },

    ],

  };

  setVistorias((prev) => [

    ...prev,

    novaVistoria,

  ]);

  setModalOpen(false);

};

  const editarVistoria = (
    vistoria
  ) => {

    setVistoriaEditando(
      vistoria
    );

    setModalOpen(true);

  };

  const excluirVistoria = (
    id
  ) => {

    const confirmar =
      window.confirm(
        "Deseja excluir esta vistoria?"
      );

    if (!confirmar) return;

    setVistorias((prev) =>
      prev.filter(
        (vistoria) =>
          vistoria.id !== id
      )
    );

  };

const concluirVistoria = (
  id
) => {

  setVistorias((prev) =>
    prev.map((vistoria) => {

      if (
        vistoria.id !== id
      ) {
        return vistoria;
      }

      const hoje =
        new Date();

      const proximaData =
        new Date(hoje);

      switch (
        vistoria.periodicidade
      ) {

        case "Semanal":
          proximaData.setDate(
            proximaData.getDate() + 7
          );
          break;

        case "Quinzenal":
          proximaData.setDate(
            proximaData.getDate() + 15
          );
          break;

        case "Mensal":
          proximaData.setMonth(
            proximaData.getMonth() + 1
          );
          break;

        case "Bimestral":
          proximaData.setMonth(
            proximaData.getMonth() + 2
          );
          break;

        case "Trimestral":
          proximaData.setMonth(
            proximaData.getMonth() + 3
          );
          break;

        case "Semestral":
          proximaData.setMonth(
            proximaData.getMonth() + 6
          );
          break;

        case "Anual":
          proximaData.setFullYear(
            proximaData.getFullYear() + 1
          );
          break;

        default:
          break;

      }

      const hojeFormatado =
        hoje
          .toISOString()
          .split("T")[0];

      const proximaFormatada =
        proximaData
          .toISOString()
          .split("T")[0];

      const agora =
        new Date()
          .toLocaleString(
            "pt-BR"
          );

      return {

        ...vistoria,

        status:
          "PROGRAMADA",

        dataUltima:
          hojeFormatado,

        dataProxima:
          proximaFormatada,

        historico: [

          ...(vistoria.historico || []),

          {
            data: agora,
            descricao:
              "Vistoria realizada",
          },

          {
            data: agora,
            descricao:
              `Próxima execução programada para ${proximaFormatada}`,
          },

        ],

      };

    })
  );

};

  const cancelarVistoria = (
  id
) => {

  setVistorias((prev) =>
    prev.map((vistoria) => {

      if (
        vistoria.id !== id
      ) {
        return vistoria;
      }

      const agora =
        new Date()
          .toLocaleString(
            "pt-BR"
          );

      return {

        ...vistoria,

        status:
          "CANCELADA",

        historico: [

          ...(vistoria.historico || []),

          {
            data: agora,
            descricao:
              "Vistoria cancelada",
          },

        ],

      };

    })
  );

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
    ${vistoria.unidade || ""}
    ${vistoria.kitnet || ""}
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

});

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
                  onConcluir={concluirVistoria}
                  onCancelar={cancelarVistoria}
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

      </PageContainer>

    </Page>

  </MainLayout>

  );
}