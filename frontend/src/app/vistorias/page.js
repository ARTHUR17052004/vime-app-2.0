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
import SemPermissao from "../components/ui/SemPermissao";

import { usePermissao } from "../../hooks/usePermissao";

// Um passo da periodicidade (null = "Única", não repete). Mora fora do
// componente porque é puro -- não depende de nada daqui.
function avancarUmaVez(data, periodicidade) {

  const nova = new Date(data);

  switch (periodicidade) {

    case "Diária": nova.setDate(nova.getDate() + 1); break;
    case "Semanal": nova.setDate(nova.getDate() + 7); break;
    case "Quinzenal": nova.setDate(nova.getDate() + 15); break;
    case "Mensal": nova.setMonth(nova.getMonth() + 1); break;
    case "Bimestral": nova.setMonth(nova.getMonth() + 2); break;
    case "Trimestral": nova.setMonth(nova.getMonth() + 3); break;
    case "Semestral": nova.setMonth(nova.getMonth() + 6); break;
    case "Anual": nova.setFullYear(nova.getFullYear() + 1); break;
    default: return null;

  }

  return nova;

}

export default function VistoriasPage() {

  const podeVisualizar = usePermissao("vistorias.visualizar");
  const podeCriar = usePermissao("vistorias.criar");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [abaSelecionada, setAbaSelecionada] =
    useState("visao-geral");

  const [filtroSelecionado, setFiltroSelecionado] =
    useState("Todos");

  const [residenciaSelecionada, setResidenciaSelecionada] =
    useState("");

  const [ordenacao, setOrdenacao] =
    useState("data-proxima");

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
          // null = vistoria "Geral" (toda a residência, sem kitnet específica).
          kitnetNome: vistoria.kitnet?.nome || vistoria.kitnet?.numero || (vistoria.unidadeId ? "Geral" : ""),
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
    // Quem cria a vistoria (Operador, Gerência...) não é quem a
    // executa -- o campo é um seletor de zelador (ver VistoriaForm),
    // nunca preenchido com quem está logado.
    responsavel: dados.responsavel || null,
    dataUltima: dados.dataUltima || null,
    dataProxima: dados.dataProxima || null,
    status: dados.status,
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

  // Avança a partir da data que JÁ estava programada (não de quando foi
  // concluída de verdade) -- assim "todo dia 10" continua caindo dia 10
  // pra sempre, mesmo concluindo atrasado ou adiantado. Só usa a data de
  // conclusão como base se a vistoria nunca teve uma próxima data.
  const baseAncora = vistoria?.dataProxima ? new Date(vistoria.dataProxima) : dataEscolhida;

  let proximaData = avancarUmaVez(baseAncora, vistoria?.periodicidade);
  const recorrente = proximaData !== null;

  if (recorrente) {

    // Concluiu bem atrasado (ex.: 2 meses depois)? Pula pras próximas
    // ocorrências até achar uma data ainda no futuro, sem perder o dia
    // fixo do ciclo.
    const agora = new Date();
    while (proximaData <= agora) {
      proximaData = avancarUmaVez(proximaData, vistoria.periodicidade);
    }

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
     const COMPARADORES_VISTORIA = {
       "data-proxima": (a, b) => new Date(a.dataProxima || 0) - new Date(b.dataProxima || 0),
       "data-distante": (a, b) => new Date(b.dataProxima || 0) - new Date(a.dataProxima || 0),
       "titulo-asc": (a, b) => (a.titulo || "").localeCompare(b.titulo || "", "pt-BR"),
       "responsavel-asc": (a, b) => (a.responsavel || "").localeCompare(b.responsavel || "", "pt-BR"),
       "criticidade": (a, b) => (a.criticidade || "").localeCompare(b.criticidade || "", "pt-BR"),
       "residencia-asc": (a, b) => (a.unidadeNome || "").localeCompare(b.unidadeNome || "", "pt-BR"),
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

}).sort((a, b) => {

  const fixadoDiff = (b.fixado ? 1 : 0) - (a.fixado ? 1 : 0);

  if (fixadoDiff !== 0) return fixadoDiff;

  return (COMPARADORES_VISTORIA[ordenacao] || COMPARADORES_VISTORIA["data-proxima"])(a, b);

});

  if (!podeVisualizar) {
    return <SemPermissao />;
  }

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
              podeCriar && (
                <Button onClick={novaVistoria}>
                  + Nova Vistoria
                </Button>
              )
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

            <div className="mt-4 flex flex-wrap gap-4 items-center">

              <div className="flex-1 min-w-[220px]">
                <ResidenciaFiltro
                  value={residenciaSelecionada}
                  onChange={setResidenciaSelecionada}
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-[var(--text-subtle)] whitespace-nowrap">
                  Organizar por
                </label>
                <select
                  value={ordenacao}
                  onChange={(e) => setOrdenacao(e.target.value)}
                  className="border border-[var(--border-token)] bg-[var(--surface-2)] text-[var(--text)] rounded-lg px-3 py-2 text-sm"
                >
                  <option value="data-proxima" className="bg-[#1b2430]">Data (mais próxima)</option>
                  <option value="data-distante" className="bg-[#1b2430]">Data (mais distante)</option>
                  <option value="titulo-asc" className="bg-[#1b2430]">Título (A-Z)</option>
                  <option value="responsavel-asc" className="bg-[#1b2430]">Responsável</option>
                  <option value="criticidade" className="bg-[#1b2430]">Criticidade</option>
                  <option value="residencia-asc" className="bg-[#1b2430]">Residência</option>
                </select>
              </div>

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