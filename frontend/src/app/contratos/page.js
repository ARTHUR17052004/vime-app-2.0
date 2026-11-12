/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import MainLayout from "../components/layout/MainLayout";

import FadeIn from "../components/ui/FadeIn";
import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import PageSection from "../components/ui/PageSection";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import SemPermissao from "../components/ui/SemPermissao";

import SearchInput from "../components/common/SearchInput";

import ContratoTabs from "../components/contratos/ContratoTabs";
import ContratoDashboard from "../components/contratos/ContratoDashboard";
import ContratoProximosVencimentos from "../components/contratos/ContratoProximosVencimentos";
import ContratoRelatorios from "../components/contratos/ContratoRelatorios";
import ContratoModal from "../components/contratos/ContratoModal";
import ContratoForm from "../components/contratos/ContratoForm";
import ContratoStats from "../components/contratos/ContratoStats";
import ContratoFilters from "../components/contratos/ContratoFilters";
import ContratoTable from "../components/contratos/ContratoTable";
import ContratoClicksignOrfaos from "../components/contratos/ContratoClicksignOrfaos";
import ContratoDemonstrativoModal from "../components/contratos/ContratoDemonstrativoModal";
import ConfirmVistoriaEntregaModal from "../components/common/ConfirmVistoriaEntregaModal";
import TerminoAntecipadoModal from "../components/common/TerminoAntecipadoModal";
import ResidenciaFiltro from "../components/common/ResidenciaFiltro";

import { ContratoService } from "@/services/contratos.service";
import { usePermissao } from "../../hooks/usePermissao";
import { socket } from "../../services/socket";
import { normalizarBusca } from "../../utils/busca";

export default function ContratosPage() {
  return (
    <Suspense fallback={null}>
      <ContratosPageConteudo />
    </Suspense>
  );
}

// useSearchParams() (lido aqui pra pré-aplicar o filtro que vem do VIME
// Insights) só funciona dentro de um Suspense -- sem isso o build de
// produção do Next recusa gerar a página.
function ContratosPageConteudo() {

  const podeVisualizar = usePermissao("contratos.visualizar");
  const podeCriar = usePermissao("contratos.criar");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [abaSelecionada, setAbaSelecionada] =
    useState("visao-geral");

  const [filtroSelecionado, setFiltroSelecionado] =
    useState("Todos");

  // Chegou aqui vindo do VIME Insights (ex.: "contratos vigentes" ->
  // clica -> abre já filtrado)? Lê o status da URL uma vez, na entrada.
  const searchParams = useSearchParams();

  useEffect(() => {

    const status = searchParams.get("status");
    if (status) setFiltroSelecionado(status);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [residenciaSelecionada, setResidenciaSelecionada] =
    useState("");

  const [ordenacao, setOrdenacao] =
    useState("inicio-recente");

  const [demonstrativoContratoId, setDemonstrativoContratoId] =
    useState(null);

  const [vistoriaPendente, setVistoriaPendente] =
    useState(null);

  // Excluir ou encerrar ANTES do fim do contrato (dataFim) é quebra de
  // contrato -- o backend recusa com requerConfirmacaoTerminoAntecipado:true
  // e essa tela abre o modal de motivo+observação+senha (ver
  // TerminoAntecipadoModal.jsx).
  const [terminoAntecipado, setTerminoAntecipado] =
    useState(null);

  const [contratos, setContratos] =
    useState([]);

  const [contratoEditando, setContratoEditando] =
    useState(null);

  const [search, setSearch] =
    useState("");

  async function carregarContratos() {

    try {

      const resposta =
        await ContratoService.listar();

      const lista = Array.isArray(resposta)
        ? resposta
        : resposta.data || [];

      setContratos(lista);

    } catch (error) {

      console.error(
        "Erro ao carregar contratos:",
        error
      );

    }

  }

  useEffect(() => {

    carregarContratos();

    // Contrato pode virar ATIVO sozinho (assinatura confirmada na
    // Clicksign) sem ninguém clicar em nada nesta tela -- sem isso, só
    // aparecia atualizado depois de dar F5.
    function aoAtualizar(evento) {
      if (evento?.tipo === "contrato") {
        carregarContratos();
      }
    }

    socket.on("dados:atualizados", aoAtualizar);

    return () => {
      socket.off("dados:atualizados", aoAtualizar);
    };

  }, []);

  function novoContrato() {

    setContratoEditando(null);

    setModalOpen(true);

  }

  async function salvarContrato(dados) {

    try {

      if (contratoEditando) {

        await ContratoService.atualizar(

          contratoEditando.id,

          dados

        );

      } else {

        const criado = await ContratoService.criar(dados);

        const contratoCriado = criado.data || criado;

        setDemonstrativoContratoId(contratoCriado.id);

      }

      await carregarContratos();

      setContratoEditando(null);

      setModalOpen(false);

    } catch (error) {

      console.error(
        "Erro ao salvar contrato:",
        error
      );

      alert(
        error.message ||
        "Erro ao salvar contrato."
      );

      throw error;

    }

  }

  async function gerarPdfContrato(contratoId) {

    try {

      const blob = await ContratoService.baixarPdf(contratoId);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `contrato-${contratoId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {

      console.error("Erro ao gerar PDF do contrato:", err);

      alert(err.message || "Erro ao gerar PDF do contrato.");

    }

  }

  function editarContrato(contrato) {

    setContratoEditando(contrato);

    setModalOpen(true);

  }

  async function excluirContrato(id) {

    const confirmar = window.confirm(
      "Deseja realmente excluir este contrato?"
    );

    if (!confirmar) return;

    const contrato = contratos.find((c) => c.id === id);

    setVistoriaPendente({
      id,
      kitnetNome: contrato?.kitnet?.nome || contrato?.kitnetNome || null,
    });

  }

  async function confirmarExclusaoContrato(gerarVistoriaEntrega) {

    const pendente = vistoriaPendente;

    setVistoriaPendente(null);

    if (!pendente) return;

    try {

      await ContratoService.excluir(pendente.id, { gerarVistoriaEntrega });

      await carregarContratos();

    } catch (error) {

      if (error.data?.requerConfirmacaoTerminoAntecipado) {
        setTerminoAntecipado({ id: pendente.id, tipo: "excluir", gerarVistoriaEntrega });
        return;
      }

      console.error(
        "Erro ao excluir contrato:",
        error
      );

      alert(error.message || "Erro ao excluir contrato.");

    }

  }

  async function encerrarContrato(id) {

    const confirmar = window.confirm(
      "Encerrar este contrato agora?"
    );

    if (!confirmar) return;

    try {

      await ContratoService.encerrar(id);

      await carregarContratos();

    } catch (error) {

      if (error.data?.requerConfirmacaoTerminoAntecipado) {
        setTerminoAntecipado({ id, tipo: "encerrar" });
        return;
      }

      console.error(
        "Erro ao encerrar contrato:",
        error
      );

      alert(error.message || "Erro ao encerrar contrato.");

    }

  }

  async function renovarContrato(id) {

    const confirmar = window.confirm(
      "Renovar este contrato por mais 4 meses a partir de hoje?"
    );

    if (!confirmar) return;

    try {

      await ContratoService.renovar(id);

      await carregarContratos();

    } catch (error) {

      console.error(
        "Erro ao renovar contrato:",
        error
      );

      alert(error.message || "Erro ao renovar contrato.");

    }

  }
    const COMPARADORES_CONTRATO = {
      "inicio-recente": (a, b) => new Date(b.dataInicio || 0) - new Date(a.dataInicio || 0),
      "inicio-antigo": (a, b) => new Date(a.dataInicio || 0) - new Date(b.dataInicio || 0),
      "inquilino-asc": (a, b) => (a.inquilino?.nome || a.inquilinoNome || "").localeCompare(b.inquilino?.nome || b.inquilinoNome || "", "pt-BR"),
      "inquilino-desc": (a, b) => (b.inquilino?.nome || b.inquilinoNome || "").localeCompare(a.inquilino?.nome || a.inquilinoNome || "", "pt-BR"),
      "residencia-asc": (a, b) => (a.unidade?.nome || a.unidadeNome || "").localeCompare(b.unidade?.nome || b.unidadeNome || "", "pt-BR"),
      "residencia-desc": (a, b) => (b.unidade?.nome || b.unidadeNome || "").localeCompare(a.unidade?.nome || a.unidadeNome || "", "pt-BR"),
      // Mesma ideia do Financeiro: agrupa por Residência primeiro, pra
      // não misturar kitnet 3 da VIME I com kitnet 3 da VIME II.
      "kitnet": (a, b) => {
        const unidadeA = a.unidade?.nome || a.unidadeNome || "";
        const unidadeB = b.unidade?.nome || b.unidadeNome || "";
        const porResidencia = unidadeA.localeCompare(unidadeB, "pt-BR");
        if (porResidencia !== 0) return porResidencia;
        const numeroA = a.kitnet?.numero ?? "";
        const numeroB = b.kitnet?.numero ?? "";
        return String(numeroA).localeCompare(String(numeroB), undefined, { numeric: true, sensitivity: "base" });
      },
      "aluguel-maior": (a, b) => (b.valorAluguel || 0) - (a.valorAluguel || 0),
      "aluguel-menor": (a, b) => (a.valorAluguel || 0) - (b.valorAluguel || 0),
      "vencimento-dia": (a, b) => (a.diaVencimento || 0) - (b.diaVencimento || 0),
      "status": (a, b) => (a.status || "").localeCompare(b.status || "", "pt-BR"),
    };

    const contratosFiltrados = contratos.filter(
    (contrato) => {

      const termo =
        normalizarBusca(search);

      const nomeInquilino = normalizarBusca(
        contrato.inquilino?.nome ||
        contrato.inquilinoNome ||
        ""
      );

      const nomeLocador = normalizarBusca(
        contrato.locador?.nome ||
        contrato.locadorNome ||
        ""
      );

      const nomeUnidade = normalizarBusca(
        contrato.unidade?.nome ||
        contrato.unidadeNome ||
        ""
      );

      const nomeKitnet = normalizarBusca(
        contrato.kitnet?.nome ||
        contrato.kitnetNome ||
        ""
      );

      const busca =
        !termo ||
        nomeInquilino.includes(termo) ||
        nomeLocador.includes(termo) ||
        nomeUnidade.includes(termo) ||
        nomeKitnet.includes(termo);

      if (!busca) return false;

      if (
        residenciaSelecionada &&
        contrato.unidadeId !== residenciaSelecionada
      )
        return false;

      if (
        filtroSelecionado ===
        "Todos"
      )
        return true;

      // Os botões de filtro mostram o rótulo em português/plural
      // ("Ativos", "Pendentes", "Encerrados"), mas o status gravado no
      // contrato é o enum em maiúsculas ("ATIVO", "PENDENTE",
      // "ENCERRADO") -- sem esse mapa a comparação direta nunca batia
      // e todo filtro (menos "Todos") voltava vazio.
      const STATUS_POR_FILTRO = {
        Ativos: "ATIVO",
        Pendentes: "PENDENTE",
        Encerrados: "ENCERRADO",
      };

      return (
        contrato.status ===
        STATUS_POR_FILTRO[filtroSelecionado]
      );

    }
  ).slice().sort(COMPARADORES_CONTRATO[ordenacao] || COMPARADORES_CONTRATO["inicio-recente"]);

  const totalContratos =
    contratos.length;

  const ativos =
    contratos.filter(
      (c) => c.status === "ATIVO"
    ).length;

  const encerrados =
    contratos.filter(
      (c) => c.status === "ENCERRADO"
    ).length;

  const vencendo =
    contratos.filter(
      (c) => c.status === "VENCENDO"
    ).length;

  if (!podeVisualizar) {
    return <SemPermissao />;
  }

  return (

  <MainLayout>

    <Page>

      <PageContainer>

        <FadeIn>

          <PageHeader
            title="Contratos"
            subtitle="Gerencie todos os contratos do sistema."
            count={totalContratos}
            countLabel="contrato(s) cadastrado(s)"
            actions={

              podeCriar && (
                <Button
                  onClick={novoContrato}
                >

                  + Novo Contrato

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
              placeholder="Pesquisar contrato..."
            />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.20}>

          <PageSection>

            <ContratoFilters
              filtroSelecionado={
                filtroSelecionado
              }
              setFiltroSelecionado={
                setFiltroSelecionado
              }
            />

            <div className="mt-4 flex flex-wrap gap-4 items-center">

              <div className="flex-1 min-w-[220px]">
                <ResidenciaFiltro
                  value={residenciaSelecionada}
                  onChange={setResidenciaSelecionada}
                />
              </div>

            </div>

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.25}>

          <PageSection>

            <ContratoTabs
              abaSelecionada={
                abaSelecionada
              }
              setAbaSelecionada={
                setAbaSelecionada
              }
            />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.30}>

          <PageSection>

            {abaSelecionada === "visao-geral" ? (

              <ContratoDashboard
                contratos={contratosFiltrados}
              />

            ) : abaSelecionada === "contratos" ? (

              <>
                <ContratoTable
                  contratos={contratosFiltrados}
                  onEdit={editarContrato}
                  onDelete={excluirContrato}
                  onBaixarPdf={gerarPdfContrato}
                  onEnviarClicksign={setDemonstrativoContratoId}
                  onRenovar={renovarContrato}
                  onEncerrar={encerrarContrato}
                  ordenacao={ordenacao}
                  onOrdenar={setOrdenacao}
                />

                <ContratoClicksignOrfaos contratosLocais={contratos} />
              </>

            ) : abaSelecionada === "vencimentos" ? (

              <ContratoProximosVencimentos
                contratos={contratos}
              />

            ) : (

              <ContratoRelatorios
                contratos={contratos}
              />

            )}

          </PageSection>

        </FadeIn>

        <ContratoModal
          isOpen={modalOpen}
          onClose={() => {

            setModalOpen(false);

            setContratoEditando(null);

          }}
        >

          <ContratoForm
            contrato={contratoEditando}
            onSave={salvarContrato}
            onCancel={() => {

              setModalOpen(false);

              setContratoEditando(null);

            }}
          />

        </ContratoModal>

        <ContratoDemonstrativoModal
          open={!!demonstrativoContratoId}
          contratoId={demonstrativoContratoId}
          onClose={() => setDemonstrativoContratoId(null)}
          onEnviado={carregarContratos}
        />

        <ConfirmVistoriaEntregaModal
          isOpen={!!vistoriaPendente}
          nomeKitnet={vistoriaPendente?.kitnetNome}
          onEscolher={confirmarExclusaoContrato}
        />

        <TerminoAntecipadoModal
          isOpen={!!terminoAntecipado}
          onClose={() => setTerminoAntecipado(null)}
          titulo={`Quebra de contrato -- ${terminoAntecipado?.tipo === "encerrar" ? "encerrar" : "excluir"} contrato`}
          contexto="Esse contrato ainda não chegou no fim (dataFim). Ele não será excluído -- vai ser encerrado, com o motivo registrado, pra manter o histórico."
          acao={async (extra) => {
            if (terminoAntecipado.tipo === "encerrar") {
              await ContratoService.encerrar(terminoAntecipado.id, extra);
            } else {
              await ContratoService.excluir(terminoAntecipado.id, {
                gerarVistoriaEntrega: terminoAntecipado.gerarVistoriaEntrega,
                ...extra,
              });
            }
            await carregarContratos();
          }}
        />

      </PageContainer>

    </Page>

  </MainLayout>

);

}