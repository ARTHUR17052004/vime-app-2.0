"use client";

import { useEffect, useState, useCallback } from "react";

import {
  House,
  Users,
  CheckCircle2,
  Wrench,
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";

import { KitnetService } from "../../services/kitnets.service";
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
import ResidenciaFiltro from "../components/common/ResidenciaFiltro";

export default function KitnetsPage() {

  const [modalOpen, setModalOpen] = useState(false);

  const [kitnets, setKitnets] = useState([]);

  const [loading, setLoading] = useState(true);

  const [erro, setErro] = useState("");

  const [kitnetEditando, setKitnetEditando] = useState(null);

  const [residenciaSelecionada, setResidenciaSelecionada] = useState("");

  /* ==========================================
     CARREGAR DADOS
  ========================================== */

  const carregarKitnets = useCallback(async () => {

    try {

      setLoading(true);

      const resposta = await KitnetService.listar();

      const lista = Array.isArray(resposta)
        ? resposta
        : resposta.data || [];

      setKitnets(lista);

    } catch (err) {

      console.error(err);

      setErro(
        err.message ||
        "Erro ao carregar kitnets."
      );

    } finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {

    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregarKitnets();

  }, [carregarKitnets]);

  /* ==========================================
     CRUD
  ========================================== */

  const salvarKitnet = async (dados) => {
      try {
        if (kitnetEditando) {
          await KitnetService.atualizar(
            kitnetEditando.id,
            dados
          );
        } else {
          await KitnetService.criar(dados);
        }

        await carregarKitnets();

        setKitnetEditando(null);
        setModalOpen(false);

      } catch (err) {
        console.error(err);

        alert(
          err.message ||
          "Erro ao salvar kitnet."
        );
      }
    };

  function editarKitnet(kitnet) {

    setKitnetEditando(kitnet);

    setModalOpen(true);

  }

  const excluirKitnet = async (id) => {
  const confirmar = window.confirm(
    "Deseja realmente excluir esta kitnet?"
  );

  if (!confirmar) return;

  try {
    await KitnetService.excluir(id);

    await carregarKitnets();

  } catch (err) {
    console.error(err);

    alert(
      err.message ||
      "Erro ao excluir kitnet."
    );
  }
};

  function novaKitnet() {

    setKitnetEditando(null);

    setModalOpen(true);

  }

  /* ==========================================
     DASHBOARD
  ========================================== */

  const totalKitnets = kitnets.length;

  const disponiveis = kitnets.filter(

    (k) => k.status === "DISPONIVEL"

  ).length;

  const ocupadas = kitnets.filter(

    (k) => k.status === "OCUPADA"

  ).length;

  const manutencao = kitnets.filter(

    (k) => k.status === "MANUTENCAO"

  ).length;

  const kitnetsFiltradas = residenciaSelecionada
    ? kitnets.filter(
        (k) => k.unidadeId === residenciaSelecionada
      )
    : kitnets;

  if (loading) {

    return (

      <MainLayout>

        <Page>

          <PageContainer>

            <div className="flex items-center justify-center py-32">

              <p className="text-gray-400 text-lg">

                Carregando kitnets...

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

        <FadeIn delay={0.15}>

          <PageSection>

            <ResidenciaFiltro
              value={residenciaSelecionada}
              onChange={setResidenciaSelecionada}
            />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.20}>

          <PageSection spacing="xxl">

            <KitnetTable
              kitnets={kitnetsFiltradas}
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