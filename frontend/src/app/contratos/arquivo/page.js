"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import MainLayout from "../../components/layout/MainLayout";

import FadeIn from "../../components/ui/FadeIn";
import Page from "../../components/ui/Page";
import PageContainer from "../../components/ui/PageContainer";
import PageSection from "../../components/ui/PageSection";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import SemPermissao from "../../components/ui/SemPermissao";

import SearchInput from "../../components/common/SearchInput";
import ResidenciaFiltro from "../../components/common/ResidenciaFiltro";

import ContratoModal from "../../components/contratos/ContratoModal";
import ContratoForm from "../../components/contratos/ContratoForm";
import ContratoArquivoTable from "../../components/contratos/ContratoArquivoTable";
import ConfirmVistoriaEntregaModal from "../../components/common/ConfirmVistoriaEntregaModal";
import TerminoAntecipadoModal from "../../components/common/TerminoAntecipadoModal";

import { ContratoService } from "@/services/contratos.service";
import { usePermissao } from "../../../hooks/usePermissao";
import { normalizarBusca } from "../../../utils/busca";

// Contratos que já existiam de verdade (em papel/PDF) e só precisavam
// ficar organizados aqui, sem passar pela assinatura digital da
// Clicksign -- ver Contrato.origem = "MANUAL".
export default function ContratosArquivoPage() {

  const podeVisualizar = usePermissao("arquivoContratos.visualizar");
  const podeCriar = usePermissao("arquivoContratos.criar");

  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [residenciaSelecionada, setResidenciaSelecionada] = useState("");

  // Clique no cabeçalho ordena -- mesmo padrão de Contratos/Financeiro,
  // sem dropdown "Organizar por" separado.
  const [ordenacao, setOrdenacao] = useState("inicio-recente");

  const [modalOpen, setModalOpen] = useState(false);
  const [contratoEditando, setContratoEditando] = useState(null);

  const [vistoriaPendente, setVistoriaPendente] = useState(null);
  const [arquivoPendente, setArquivoPendente] = useState(null);

  // Excluir ou encerrar ANTES do fim do contrato (dataFim) é quebra de
  // contrato -- o backend recusa com requerConfirmacaoTerminoAntecipado:true
  // e essa tela abre o modal de motivo+observação+senha (ver
  // TerminoAntecipadoModal.jsx).
  const [terminoAntecipado, setTerminoAntecipado] = useState(null);

  async function carregarContratos() {

    try {

      setLoading(true);

      const resposta = await ContratoService.listar();
      const lista = Array.isArray(resposta) ? resposta : resposta.data || [];

      setContratos(lista.filter((c) => c.origem === "MANUAL"));

    } catch (error) {

      console.error("Erro ao carregar o arquivo de contratos:", error);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    carregarContratos();

  }, []);

  function novoContrato() {

    setContratoEditando(null);
    setArquivoPendente(null);
    setModalOpen(true);

  }

  function editarContrato(contrato) {

    setContratoEditando(contrato);
    setArquivoPendente(null);
    setModalOpen(true);

  }

  function fecharModal() {

    setModalOpen(false);
    setContratoEditando(null);
    setArquivoPendente(null);

  }

  async function salvarContrato(dados) {

    try {

      let contratoId = contratoEditando?.id;

      if (contratoEditando) {

        await ContratoService.atualizar(contratoEditando.id, dados);

      } else {

        const criado = await ContratoService.criar(dados);
        const contratoCriado = criado.data || criado;

        contratoId = contratoCriado.id;

      }

      if (arquivoPendente && contratoId) {

        try {

          await ContratoService.enviarArquivo(contratoId, arquivoPendente);

        } catch (erroArquivo) {

          console.error("Erro ao enviar arquivo do contrato:", erroArquivo);

          alert(
            erroArquivo.message ||
            "O contrato foi salvo, mas houve um erro ao enviar o arquivo. Tente anexar de novo editando o contrato."
          );

        }

      }

      await carregarContratos();

      fecharModal();

    } catch (error) {

      console.error("Erro ao salvar contrato:", error);

      alert(error.message || "Erro ao salvar contrato.");

      throw error;

    }

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

      console.error("Erro ao excluir contrato:", error);

      alert(error.message || "Erro ao excluir contrato.");

    }

  }

  async function encerrarContrato(id) {

    const confirmar = window.confirm("Encerrar este contrato agora?");

    if (!confirmar) return;

    try {

      await ContratoService.encerrar(id);

      await carregarContratos();

    } catch (error) {

      if (error.data?.requerConfirmacaoTerminoAntecipado) {
        setTerminoAntecipado({ id, tipo: "encerrar" });
        return;
      }

      console.error("Erro ao encerrar contrato:", error);

      alert(error.message || "Erro ao encerrar contrato.");

    }

  }

  async function baixarArquivoDoContrato(contrato) {

    try {

      const blob = await ContratoService.baixarArquivo(contrato.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = contrato.arquivoNomeOriginal || "contrato";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (err) {

      alert(err.message || "Erro ao baixar o arquivo.");

    }

  }

  async function baixarArquivoAtual() {

    if (!contratoEditando) return;

    await baixarArquivoDoContrato(contratoEditando);

  }

  async function removerArquivoAtual() {

    if (!contratoEditando) return;

    const confirmar = window.confirm(
      "Remover o arquivo anexado a este contrato?"
    );

    if (!confirmar) return;

    try {

      const resposta = await ContratoService.removerArquivo(contratoEditando.id);
      const atualizado = resposta.data || resposta;

      setContratoEditando(atualizado);

      await carregarContratos();

    } catch (err) {

      alert(err.message || "Erro ao remover o arquivo.");

    }

  }

  // Mesmas chaves de Contratos (page.js) -- é o mesmo model por baixo,
  // literalmente os mesmos critérios fazem sentido aqui.
  const COMPARADORES_CONTRATO = {
    "inicio-recente": (a, b) => new Date(b.dataInicio || 0) - new Date(a.dataInicio || 0),
    "inicio-antigo": (a, b) => new Date(a.dataInicio || 0) - new Date(b.dataInicio || 0),
    "inquilino-asc": (a, b) => (a.inquilino?.nome || a.inquilinoNome || "").localeCompare(b.inquilino?.nome || b.inquilinoNome || "", "pt-BR"),
    "inquilino-desc": (a, b) => (b.inquilino?.nome || b.inquilinoNome || "").localeCompare(a.inquilino?.nome || a.inquilinoNome || "", "pt-BR"),
    "residencia-asc": (a, b) => (a.unidade?.nome || a.unidadeNome || "").localeCompare(b.unidade?.nome || b.unidadeNome || "", "pt-BR"),
    "residencia-desc": (a, b) => (b.unidade?.nome || b.unidadeNome || "").localeCompare(a.unidade?.nome || a.unidadeNome || "", "pt-BR"),
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
    "status": (a, b) => (a.status || "").localeCompare(b.status || "", "pt-BR"),
  };

  const contratosFiltrados = useMemo(() => {

    const termo = normalizarBusca(search);

    return contratos.filter((contrato) => {

      const nomeInquilino = normalizarBusca(contrato.inquilino?.nome || contrato.inquilinoNome || "");
      const nomeUnidade = normalizarBusca(contrato.unidade?.nome || contrato.unidadeNome || "");
      const nomeKitnet = normalizarBusca(contrato.kitnet?.nome || contrato.kitnetNome || "");

      const busca =
        !termo ||
        nomeInquilino.includes(termo) ||
        nomeUnidade.includes(termo) ||
        nomeKitnet.includes(termo);

      if (!busca) return false;

      if (residenciaSelecionada && contrato.unidadeId !== residenciaSelecionada) {
        return false;
      }

      return true;

    }).sort(COMPARADORES_CONTRATO[ordenacao] || COMPARADORES_CONTRATO["inicio-recente"]);

  }, [contratos, search, residenciaSelecionada, ordenacao]);

  if (!podeVisualizar) {
    return <SemPermissao />;
  }

  if (loading) {

    return (

      <MainLayout>

        <Page>

          <PageContainer>

            <div className="flex justify-center items-center py-32">
              <p className="text-[var(--text-subtle)] text-lg">
                Carregando arquivo de contratos...
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

          <FadeIn>

            <Link
              href="/contratos"
              className="
                mb-4
                inline-flex
                items-center
                gap-2
                text-sm
                text-[var(--text-subtle)]
                hover:text-[var(--text)]
                transition
              "
            >
              <ArrowLeft size={14} />
              Voltar para Contratos
            </Link>

            <PageHeader
              title="Arquivo de Contratos"
              subtitle="Contratos registrados manualmente — já existiam de verdade e só precisavam ficar organizados aqui, sem passar pela assinatura digital."
              count={contratosFiltrados.length}
              countLabel="contrato(s) no arquivo"
              actions={
                podeCriar && (
                  <Button onClick={novoContrato}>
                    + Adicionar Contrato
                  </Button>
                )
              }
            />

          </FadeIn>

          <FadeIn delay={0.10}>

            <PageSection>

              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar por inquilino, residência ou kitnet..."
              />

              <div className="mt-4 max-w-sm">
                <ResidenciaFiltro
                  value={residenciaSelecionada}
                  onChange={setResidenciaSelecionada}
                />
              </div>

            </PageSection>

          </FadeIn>

          <FadeIn delay={0.20}>

            <PageSection>

              <ContratoArquivoTable
                contratos={contratosFiltrados}
                onEdit={editarContrato}
                onDelete={excluirContrato}
                onEncerrar={encerrarContrato}
                onBaixarArquivo={baixarArquivoDoContrato}
                ordenacao={ordenacao}
                onOrdenar={setOrdenacao}
              />

            </PageSection>

          </FadeIn>

          <ContratoModal isOpen={modalOpen} onClose={fecharModal}>

            <ContratoForm
              contrato={contratoEditando}
              onSave={salvarContrato}
              modoManual
              arquivoSelecionado={arquivoPendente}
              onArquivoSelecionado={setArquivoPendente}
              onBaixarArquivoAtual={baixarArquivoAtual}
              onRemoverArquivoAtual={removerArquivoAtual}
              onCancel={fecharModal}
            />

          </ContratoModal>

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
