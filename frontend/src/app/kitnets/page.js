"use client";

import { useEffect, useState } from "react";

import {
  House,
  Users,
  CheckCircle2,
  Wrench,
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";

import FadeIn from "../components/ui/FadeIn";
import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import PageSection from "../components/ui/PageSection";
import PageGrid from "../components/ui/PageGrid";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";

import DashboardStatsCard from "../components/dashboard/DashboardStatsCard";

import KitnetModal from "../components/kitnets/KitnetModal";
import KitnetForm from "../components/kitnets/KitnetForm";
import KitnetTable from "../components/kitnets/KitnetTable";

export default function KitnetsPage() {

  const [modalOpen, setModalOpen] = useState(false);

  const [kitnets, setKitnets] = useState([]);

  const [carregado, setCarregado] =
    useState(false);

  const [kitnetEditando, setKitnetEditando] =
    useState(null);

  useEffect(() => {

    const dados = JSON.parse(

      localStorage.getItem("vime-kitnets") || "[]"

    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setKitnets(dados);

    setCarregado(true);

  }, []);

  useEffect(() => {

    if (!carregado) return;

    localStorage.setItem(

      "vime-kitnets",

      JSON.stringify(kitnets)

    );

  }, [kitnets, carregado]);

  function salvarKitnet(dados) {

    if (kitnetEditando) {

      setKitnets((prev) =>

        prev.map((item) =>

          item.id === kitnetEditando.id

            ? {

                ...item,

                ...dados,

              }

            : item

        )

      );

    } else {

      setKitnets((prev) => [

        ...prev,

        {

          id: Date.now(),

          ...dados,

        },

      ]);

    }

    setKitnetEditando(null);

    setModalOpen(false);

  }

  function editarKitnet(kitnet) {

    setKitnetEditando(kitnet);

    setModalOpen(true);

  }

  function excluirKitnet(id) {

    if (

      !window.confirm(

        "Deseja realmente excluir esta kitnet?"

      )

    ) {

      return;

    }

    setKitnets((prev) =>

      prev.filter((item) => item.id !== id)

    );

  }

  function novaKitnet() {

    setKitnetEditando(null);

    setModalOpen(true);

  }
  

  const totalKitnets = kitnets.length;

  const disponiveis = kitnets.filter(

    (k) => k.status === "Disponível"

  ).length;

  const ocupadas = kitnets.filter(

    (k) => k.status === "Ocupada"

  ).length;

  const manutencao = kitnets.filter(

    (k) => k.status === "Manutenção"

  ).length;

  return (

    <MainLayout>

      <Page>

        <PageContainer>

          <FadeIn>

            <PageHeader
              title="Kitnets"
              subtitle="Gerencie todas as kitnets cadastradas."
              count={totalKitnets}
              countLabel="kitnet(s) cadastrada(s)"
              actions={
                <Button onClick={novaKitnet}>
                  + Nova Kitnet
                </Button>
              }
            />

          </FadeIn>

          <FadeIn delay={0.10}>

            <PageSection spacing="xl">

              <PageGrid cols={4}>

                <DashboardStatsCard
                  title="Total"
                  value={totalKitnets}
                  subtitle="Kitnets cadastradas"
                  icon={House}
                />

                <DashboardStatsCard
                  title="Disponíveis"
                  value={disponiveis}
                  subtitle="Prontas para locação"
                  icon={CheckCircle2}
                />

                <DashboardStatsCard
                  title="Ocupadas"
                  value={ocupadas}
                  subtitle="Atualmente alugadas"
                  icon={Users}
                />

                <DashboardStatsCard
                  title="Manutenção"
                  value={manutencao}
                  subtitle="Indisponíveis"
                  icon={Wrench}
                />

              </PageGrid>

            </PageSection>

          </FadeIn>

          <FadeIn delay={0.20}>

            <PageSection spacing="xxl">

              <KitnetTable

                kitnets={kitnets}

                onEdit={editarKitnet}

                onDelete={excluirKitnet}

              />

            </PageSection>

          </FadeIn>
                    <KitnetModal
            isOpen={modalOpen}
            kitnet={kitnetEditando}
            onClose={() => {
              setKitnetEditando(null);
              setModalOpen(false);
            }}
          >

            <KitnetForm
              kitnet={kitnetEditando}
              onSave={salvarKitnet}
              onCancel={() => {
                setKitnetEditando(null);
                setModalOpen(false);
              }}
            />

          </KitnetModal>

        </PageContainer>

      </Page>

    </MainLayout>

  );

}