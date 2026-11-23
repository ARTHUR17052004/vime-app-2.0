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
import ConfirmVistoriaEntregaModal from "../components/common/ConfirmVistoriaEntregaModal";
import TerminoAntecipadoModal from "../components/common/TerminoAntecipadoModal";
import SemPermissao from "../components/ui/SemPermissao";
import InquilinosMobile from "../components/inquilinos/mobile/InquilinosMobile";

import { InquilinoService } from "../../services/inquilinos.service";
import ResidenciaFiltro from "../components/common/ResidenciaFiltro";
import { usePermissao } from "../../hooks/usePermissao";
import { useIsMobile } from "../../hooks/useIsMobile";
import { normalizarBusca } from "../../utils/busca";

export default function InquilinosPage() {

  const podeVisualizar = usePermissao("inquilinos.visualizar");
  const podeCriar = usePermissao("inquilinos.criar");
  const isMobile = useIsMobile();

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

  const [vistoriaPendente, setVistoriaPendente] =
    useState(null);

  // Exclusão ANTES do fim do contrato (dataFim) é quebra de contrato --
  // o backend recusa com requerConfirmacaoTerminoAntecipado:true e essa
  // tela abre o modal de motivo+observação+senha em vez do alert comum
  // (ver TerminoAntecipadoModal.jsx).
  const [terminoAntecipado, setTerminoAntecipado] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [erro, setErro] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [residenciaSelecionada, setResidenciaSelecionada] =
    useState("");

  const [statusFiltro, setStatusFiltro] =
    useState("");

  const [ordenacao, setOrdenacao] =
    useState("nome-asc");

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

    const inquilino = inquilinos.find((i) => i.id === id);

    setVistoriaPendente({
      id,
      kitnetNome: inquilino?.kitnet?.nome || inquilino?.kitnet?.numero || null,
    });

  };

  const confirmarExclusaoInquilino = async (gerarVistoriaEntrega) => {

    const pendente = vistoriaPendente;

    setVistoriaPendente(null);

    if (!pendente) return;

    try {

      await InquilinoService.excluir(pendente.id, { gerarVistoriaEntrega });

      await carregarInquilinos();

    } catch (err) {

      if (err.data?.requerConfirmacaoTerminoAntecipado) {
        setTerminoAntecipado({ id: pendente.id, gerarVistoriaEntrega });
        return;
      }

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

  function nomeKitnetOrdenavel(inquilino) {
    const unidade = inquilino.kitnet?.unidade?.nome || inquilino.unidadeNome || "";
    const kitnet = inquilino.kitnet?.nome || inquilino.kitnet?.numero || inquilino.kitnetNome || "";
    return `${unidade} ${kitnet}`.trim().toLowerCase();
  }

  const COMPARADORES = {
    "nome-asc": (a, b) => (a.nome || "").localeCompare(b.nome || "", "pt-BR"),
    "nome-desc": (a, b) => (b.nome || "").localeCompare(a.nome || "", "pt-BR"),
    "kitnet-asc": (a, b) => nomeKitnetOrdenavel(a).localeCompare(nomeKitnetOrdenavel(b), "pt-BR"),
    "kitnet-desc": (a, b) => nomeKitnetOrdenavel(b).localeCompare(nomeKitnetOrdenavel(a), "pt-BR"),
    "contato-asc": (a, b) => (a.email || "").localeCompare(b.email || "", "pt-BR"),
    "contato-desc": (a, b) => (b.email || "").localeCompare(a.email || "", "pt-BR"),
    "contrato-recente": (a, b) => new Date(b.dataFimContrato || 0) - new Date(a.dataFimContrato || 0),
    "contrato-antigo": (a, b) => new Date(a.dataFimContrato || 0) - new Date(b.dataFimContrato || 0),
    "status-asc": (a, b) => (b.ativo === true) - (a.ativo === true) || (a.nome || "").localeCompare(b.nome || "", "pt-BR"),
    "status-desc": (a, b) => (a.ativo === true) - (b.ativo === true) || (a.nome || "").localeCompare(b.nome || "", "pt-BR"),
  };

  const inquilinosFiltrados = useMemo(() => {

    const termo = normalizarBusca(search);

    const filtrados = inquilinos.filter((inquilino) => {

      const correspondeTexto =

        normalizarBusca(inquilino.nome).includes(termo) ||

        normalizarBusca(inquilino.email).includes(termo) ||

        normalizarBusca(inquilino.telefone).includes(termo) ||

        normalizarBusca(inquilino.cpf).includes(termo);

      if (!correspondeTexto) return false;

      if (
        residenciaSelecionada &&
        inquilino.kitnet?.unidadeId !== residenciaSelecionada
      )
        return false;

      if (statusFiltro === "ATIVO" && !inquilino.ativo) return false;
      if (statusFiltro === "INATIVO" && inquilino.ativo) return false;

      return true;

    });

    const comparador = COMPARADORES[ordenacao] || COMPARADORES["nome-asc"];

    return [...filtrados].sort(comparador);

  }, [inquilinos, search, residenciaSelecionada, statusFiltro, ordenacao]);

  const totalAtivos = inquilinos.filter((i) => i.ativo).length;
  const totalInativos = inquilinos.length - totalAtivos;

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

            <InquilinosMobile
              inquilinos={inquilinosFiltrados}
              totalInquilinos={inquilinos.length}
              ativos={totalAtivos}
              inativos={totalInativos}
              podeCriar={podeCriar}
              onNovoInquilino={abrirExplicacao}
              onEdit={editarInquilino}
              onDelete={excluirInquilino}
              residenciaSelecionada={residenciaSelecionada}
              onResidenciaChange={setResidenciaSelecionada}
              statusFiltro={statusFiltro}
              onStatusChange={setStatusFiltro}
              ordenacao={ordenacao}
              onOrdenacaoChange={setOrdenacao}
            />

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

            <ConfirmVistoriaEntregaModal
              isOpen={!!vistoriaPendente}
              nomeKitnet={vistoriaPendente?.kitnetNome}
              onEscolher={confirmarExclusaoInquilino}
            />

            <TerminoAntecipadoModal
              isOpen={!!terminoAntecipado}
              onClose={() => setTerminoAntecipado(null)}
              titulo="Quebra de contrato -- excluir inquilino"
              contexto="O contrato desse inquilino ainda não chegou no fim. O inquilino não será excluído -- o contrato vai ser encerrado, a kitnet liberada, e tudo fica registrado no histórico."
              acao={async (extra) => {
                await InquilinoService.excluir(terminoAntecipado.id, {
                  gerarVistoriaEntrega: terminoAntecipado.gerarVistoriaEntrega,
                  ...extra,
                });
                await carregarInquilinos();
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

            </PageSection>

          </FadeIn>

          <FadeIn delay={0.15}>

            <PageSection>

              {/* Mesma caixa/estilo do cartão de filtros do mobile
                  (InquilinosMobile.jsx) -- só o layout muda (linha
                  aqui, empilhado lá), a aparência das caixas é igual.
                  Pedido do usuário em 23/11/2026. */}
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
                  <option value="ATIVO" className="bg-[#1b2430]">Ativo</option>
                  <option value="INATIVO" className="bg-[#1b2430]">Inativo</option>
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
                  <option value="nome-asc" className="bg-[#1b2430]">Nome (A-Z)</option>
                  <option value="nome-desc" className="bg-[#1b2430]">Nome (Z-A)</option>
                  <option value="kitnet-asc" className="bg-[#1b2430]">Kitnet</option>
                  <option value="contrato-recente" className="bg-[#1b2430]">Contrato (mais recente)</option>
                  <option value="contrato-antigo" className="bg-[#1b2430]">Contrato (mais antigo)</option>
                  <option value="status-asc" className="bg-[#1b2430]">Status (ativos primeiro)</option>
                </select>

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
                ordenacao={ordenacao}
                onOrdenar={setOrdenacao}
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

          <ConfirmVistoriaEntregaModal
            isOpen={!!vistoriaPendente}
            nomeKitnet={vistoriaPendente?.kitnetNome}
            onEscolher={confirmarExclusaoInquilino}
          />

          <TerminoAntecipadoModal
            isOpen={!!terminoAntecipado}
            onClose={() => setTerminoAntecipado(null)}
            titulo="Quebra de contrato -- excluir inquilino"
            contexto="O contrato desse inquilino ainda não chegou no fim. O inquilino não será excluído -- o contrato vai ser encerrado, a kitnet liberada, e tudo fica registrado no histórico."
            acao={async (extra) => {
              await InquilinoService.excluir(terminoAntecipado.id, {
                gerarVistoriaEntrega: terminoAntecipado.gerarVistoriaEntrega,
                ...extra,
              });
              await carregarInquilinos();
            }}
          />

        </PageContainer>

      </Page>

    </MainLayout>

  );

}