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

import { ContratoService } from "@/services/contratos.service";
import { usePermissao } from "../../../hooks/usePermissao";

// Contratos que já existiam de verdade (em papel/PDF) e só precisavam
// ficar organizados aqui, sem passar pela assinatura digital da
// Clicksign -- ver Contrato.origem = "MANUAL".
export default function ContratosArquivoPage() {

  const podeVisualizar = usePermissao("contratos.visualizar");
  const podeCriar = usePermissao("contratos.criar");

  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [residenciaSelecionada, setResidenciaSelecionada] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [contratoEditando, setContratoEditando] = useState(null);
  const [arquivoPendente, setArquivoPendente] = useState(null);

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

    try {

      await ContratoService.excluir(id);

      await carregarContratos();

    } catch (error) {

      console.error("Erro ao excluir contrato:", error);

      alert(error.message || "Erro ao excluir contrato.");

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

  const contratosFiltrados = useMemo(() => {

    const termo = search.toLowerCase();

    return contratos.filter((contrato) => {

      const nomeInquilino = (contrato.inquilino?.nome || contrato.inquilinoNome || "").toLowerCase();
      const nomeUnidade = (contrato.unidade?.nome || contrato.unidadeNome || "").toLowerCase();
      const nomeKitnet = (contrato.kitnet?.nome || contrato.kitnetNome || "").toLowerCase();

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

    });

  }, [contratos, search, residenciaSelecionada]);

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
                onBaixarArquivo={baixarArquivoDoContrato}
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

        </PageContainer>

      </Page>

    </MainLayout>

  );

}
