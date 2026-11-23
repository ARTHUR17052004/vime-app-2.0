"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";

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
import SemPermissao from "../components/ui/SemPermissao";

import DashboardStatsCard from "../components/dashboard/DashboardStatsCard";

import KitnetModal from "../components/kitnets/KitnetModal";
import KitnetForm from "../components/kitnets/KitnetForm";
import KitnetTable from "../components/kitnets/KitnetTable";
import KitnetsMobile from "../components/kitnets/mobile/KitnetsMobile";
import ResidenciaFiltro from "../components/common/ResidenciaFiltro";
import SearchInput from "../components/common/SearchInput";
import TerminoAntecipadoModal from "../components/common/TerminoAntecipadoModal";

import { usePermissao } from "../../hooks/usePermissao";
import { useIsMobile } from "../../hooks/useIsMobile";
import { normalizarBusca } from "../../utils/busca";

export default function KitnetsPage() {
  return (
    <Suspense fallback={null}>
      <KitnetsPageConteudo />
    </Suspense>
  );
}

// useSearchParams() (lido aqui pra pré-aplicar o filtro que vem do VIME
// Insights) só funciona dentro de um Suspense -- sem isso o build de
// produção do Next recusa gerar a página.
function KitnetsPageConteudo() {

  const podeVisualizar = usePermissao("kitnets.visualizar");
  const podeCriar = usePermissao("kitnets.criar");
  const isMobile = useIsMobile();

  const [modalOpen, setModalOpen] = useState(false);

  const [kitnets, setKitnets] = useState([]);

  const [loading, setLoading] = useState(true);

  const [erro, setErro] = useState("");

  const [kitnetEditando, setKitnetEditando] = useState(null);

  // Excluir ANTES do fim do contrato ativo nessa kitnet (dataFim) é
  // quebra de contrato -- o backend recusa com
  // requerConfirmacaoTerminoAntecipado:true e essa tela abre o modal de
  // motivo+observação+senha (ver TerminoAntecipadoModal.jsx).
  const [terminoAntecipado, setTerminoAntecipado] = useState(null);

  const [search, setSearch] = useState("");

  const [residenciaSelecionada, setResidenciaSelecionada] = useState("");

  const [ordenacao, setOrdenacao] = useState("numero-asc");

  const [statusFiltro, setStatusFiltro] = useState("");

  // Chegou aqui vindo do VIME Insights (ex.: "kitnets ocupadas" -> clica
  // -> abre já filtrado)? Lê o status da URL uma vez, na entrada.
  const searchParams = useSearchParams();

  useEffect(() => {

    const status = searchParams.get("status");
    if (status) setStatusFiltro(status);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    if (err.data?.requerConfirmacaoTerminoAntecipado) {
      setTerminoAntecipado({ id });
      return;
    }

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

  const COMPARADORES_KITNET = {
    "numero-asc": (a, b) => (a.numero || a.nome || "").localeCompare(b.numero || b.nome || "", "pt-BR", { numeric: true }),
    "numero-desc": (a, b) => (b.numero || b.nome || "").localeCompare(a.numero || a.nome || "", "pt-BR", { numeric: true }),
    "residencia-asc": (a, b) => (a.unidade?.nome || a.unidadeNome || "").localeCompare(b.unidade?.nome || b.unidadeNome || "", "pt-BR"),
    "aluguel-maior": (a, b) => (b.aluguel || 0) - (a.aluguel || 0),
    "aluguel-menor": (a, b) => (a.aluguel || 0) - (b.aluguel || 0),
    "status": (a, b) => (a.status || "").localeCompare(b.status || "", "pt-BR"),
  };

  const termoBusca = normalizarBusca(search);

  const kitnetsFiltradas = kitnets
    .filter((k) => {
      if (!termoBusca) return true;
      const texto = normalizarBusca(`
        ${k.numero || ""}
        ${k.nome || ""}
        ${k.unidade?.nome || k.unidadeNome || ""}
      `);
      return texto.includes(termoBusca);
    })
    .filter((k) => !residenciaSelecionada || k.unidadeId === residenciaSelecionada)
    .filter((k) => !statusFiltro || k.status === statusFiltro)
    .slice()
    .sort(COMPARADORES_KITNET[ordenacao] || COMPARADORES_KITNET["numero-asc"]);

  if (!podeVisualizar) {
    return <SemPermissao />;
  }

  if (loading) {

    return (

      <MainLayout>

        <Page>

          <PageContainer>

            <div className="flex items-center justify-center py-32">

              <p className="text-[var(--text-subtle)] text-lg">

                Carregando kitnets...

              </p>

            </div>

          </PageContainer>

        </Page>

      </MainLayout>

    );

  }

  if (isMobile) {

    return (

      <MainLayout>

        <Page>

          <PageContainer>

            {erro && (

              <div
                className="
                  mb-4
                  rounded-2xl
                  border
                  border-red-500/20
                  bg-red-500/10
                  px-4
                  py-3
                  text-sm
                  text-red-300
                "
              >
                {erro}
              </div>

            )}

            <KitnetsMobile
              kitnets={kitnetsFiltradas}
              totalKitnets={totalKitnets}
              disponiveis={disponiveis}
              ocupadas={ocupadas}
              manutencao={manutencao}
              podeCriar={podeCriar}
              onNovaKitnet={novaKitnet}
              onEdit={editarKitnet}
              onDelete={excluirKitnet}
              residenciaSelecionada={residenciaSelecionada}
              onResidenciaChange={setResidenciaSelecionada}
              statusFiltro={statusFiltro}
              onStatusChange={setStatusFiltro}
              ordenacao={ordenacao}
              onOrdenacaoChange={setOrdenacao}
            />

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

            <TerminoAntecipadoModal
              isOpen={!!terminoAntecipado}
              onClose={() => setTerminoAntecipado(null)}
              titulo="Quebra de contrato -- excluir kitnet"
              contexto="Essa kitnet tem um contrato ativo que ainda não chegou no fim. A kitnet não será excluída -- o contrato vai ser encerrado e ela fica liberada (disponível) em vez de apagada."
              acao={async (extra) => {
                await KitnetService.excluir(terminoAntecipado.id, extra);
                await carregarKitnets();
              }}
            />

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
              podeCriar && (
                <Button onClick={novaKitnet}>
                  + Nova Kitnet
                </Button>
              )
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
                title="Vazias"
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

        <FadeIn delay={0.12}>

          <PageSection>

            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar kitnet..."
            />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.15}>

          <PageSection>

            {/* Mesma caixa/estilo do cartão de filtros do mobile
                (KitnetsMobile.jsx) -- só o layout muda (linha aqui,
                empilhado lá), a aparência das caixas é igual. Pedido
                do usuário em 23/11/2026. */}
            <div
              className="
                rounded-2xl
                border
                border-[var(--border-token)]
                bg-[var(--surface)]
                backdrop-blur-xl
                p-4
                flex
                flex-wrap
                gap-3
              "
            >

              <div className="flex-1 min-w-[220px]">
                <ResidenciaFiltro
                  compact
                  value={residenciaSelecionada}
                  onChange={setResidenciaSelecionada}
                />
              </div>

              <select
                value={statusFiltro}
                onChange={(e) => setStatusFiltro(e.target.value)}
                className="
                  rounded-xl
                  border border-[var(--border-token)]
                  bg-[var(--surface-2)]
                  text-[var(--text)]
                  px-3 py-2.5
                  text-sm
                "
              >
                <option value="" className="bg-[#1b2430]">Todos os status</option>
                <option value="DISPONIVEL" className="bg-[#1b2430]">Disponível</option>
                <option value="OCUPADA" className="bg-[#1b2430]">Ocupada</option>
                <option value="MANUTENCAO" className="bg-[#1b2430]">Manutenção</option>
              </select>

              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
                className="
                  rounded-xl
                  border border-[var(--border-token)]
                  bg-[var(--surface-2)]
                  text-[var(--text)]
                  px-3 py-2.5
                  text-sm
                "
              >
                <option value="numero-asc" className="bg-[#1b2430]">Número (A-Z)</option>
                <option value="numero-desc" className="bg-[#1b2430]">Número (Z-A)</option>
                <option value="residencia-asc" className="bg-[#1b2430]">Residência</option>
                <option value="aluguel-maior" className="bg-[#1b2430]">Aluguel (maior)</option>
                <option value="aluguel-menor" className="bg-[#1b2430]">Aluguel (menor)</option>
                <option value="status" className="bg-[#1b2430]">Status</option>
              </select>

            </div>

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

        <TerminoAntecipadoModal
          isOpen={!!terminoAntecipado}
          onClose={() => setTerminoAntecipado(null)}
          titulo="Quebra de contrato -- excluir kitnet"
          contexto="Essa kitnet tem um contrato ativo que ainda não chegou no fim. A kitnet não será excluída -- o contrato vai ser encerrado e ela fica liberada (disponível) em vez de apagada."
          acao={async (extra) => {
            await KitnetService.excluir(terminoAntecipado.id, extra);
            await carregarKitnets();
          }}
        />

      </PageContainer>

    </Page>

  </MainLayout>

);

}