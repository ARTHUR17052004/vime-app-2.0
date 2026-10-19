"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Eye, ImageIcon } from "lucide-react";

import MainLayout from "../../components/layout/MainLayout";

import FadeIn from "../../components/ui/FadeIn";
import Page from "../../components/ui/Page";
import PageContainer from "../../components/ui/PageContainer";
import PageSection from "../../components/ui/PageSection";
import PageHeader from "../../components/ui/PageHeader";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import SemPermissao from "../../components/ui/SemPermissao";

import SearchInput from "../../components/common/SearchInput";

import { VistoriaService } from "@/services/vistoria.service";
import { formatDateTime } from "@/utils/formatDate";
import { usePermissao } from "../../../hooks/usePermissao";

// Histórico de missões (uma linha = uma residência vistoriada, numa
// rodada, de uma vistoria "Geral") -- ver vistoriaService.concluirMissoes
// no backend: quando todas as residências ativas de um ciclo são
// batidas, a vistoria fecha a rodada e abre a próxima sozinha.
export default function VistoriaArquivoPage() {
  return (
    <Suspense fallback={null}>
      <VistoriaArquivoConteudo />
    </Suspense>
  );
}

function VistoriaArquivoConteudo() {

  const podeVisualizar = usePermissao("arquivoVistorias.visualizar");

  const searchParams = useSearchParams();
  const vistoriaIdFiltro = searchParams.get("vistoriaId") || "";

  const [missoes, setMissoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [detalhe, setDetalhe] = useState(null);

  useEffect(() => {

    async function carregar() {

      try {

        setLoading(true);
        const resposta = await VistoriaService.listarArquivoMissoes();
        setMissoes(Array.isArray(resposta) ? resposta : []);

      } catch (error) {

        console.error("Erro ao carregar o arquivo de vistorias realizadas:", error);

      } finally {

        setLoading(false);

      }

    }

    carregar();

  }, []);

  const missoesFiltradas = useMemo(() => {

    const texto = search.toLowerCase();

    return missoes.filter((m) => {

      if (vistoriaIdFiltro && m.vistoriaId !== vistoriaIdFiltro) return false;

      const alvo = `
        ${m.vistoria?.titulo || ""}
        ${m.unidade?.nome || ""}
        ${m.realizadoPor || ""}
      `.toLowerCase();

      return alvo.includes(texto);

    });

  }, [missoes, search, vistoriaIdFiltro]);

  const colunas = [
    { key: "vistoria", title: "Vistoria", render: (m) => m.vistoria?.titulo || "-" },
    { key: "unidade", title: "Residência", render: (m) => m.unidade?.nome || "-" },
    { key: "ciclo", title: "Ciclo" },
    { key: "dataRealizacao", title: "Data/Hora Realizada", render: (m) => formatDateTime(m.dataRealizacao) },
    { key: "realizadoPor", title: "Responsável", render: (m) => m.realizadoPor || "-" },
    {
      key: "fotos",
      title: "Fotos",
      render: (m) => (
        m.fotos?.length > 0
          ? (
            <span className="inline-flex items-center gap-1 text-[var(--text-subtle)]">
              <ImageIcon size={14} />
              {m.fotos.length}
            </span>
          )
          : "-"
      ),
    },
    {
      key: "acoes",
      title: "",
      render: (m) => (
        <button
          onClick={() => setDetalhe(m)}
          className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-sm font-medium"
        >
          <Eye size={15} />
          Ver
        </button>
      ),
    },
  ];

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
                Carregando arquivo de vistorias realizadas...
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
              href="/vistorias"
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
              Voltar para Vistorias
            </Link>

            <PageHeader
              title="Arquivo de Vistorias Realizadas"
              subtitle="Cada residência vistoriada numa rodada de uma vistoria 'Geral' vira um registro aqui -- quando todas as residências ativas de um ciclo são concluídas, a vistoria fecha a rodada e renova sozinha para a próxima data."
              count={missoesFiltradas.length}
              countLabel="registro(s) no arquivo"
            />

          </FadeIn>

          <FadeIn delay={0.10}>

            <PageSection>

              <SearchInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar por vistoria, residência ou responsável..."
              />

              {vistoriaIdFiltro && (
                <p className="mt-3 text-sm text-[var(--text-subtle)]">
                  Mostrando só os registros de <strong className="text-[var(--text)]">{missoes.find((m) => m.vistoriaId === vistoriaIdFiltro)?.vistoria?.titulo || "uma vistoria"}</strong>.
                  {" "}
                  <Link href="/vistorias/arquivo" className="text-emerald-400 hover:underline">
                    Ver tudo
                  </Link>
                </p>
              )}

            </PageSection>

          </FadeIn>

          <FadeIn delay={0.20}>

            <PageSection>

              <Table
                columns={colunas}
                data={missoesFiltradas}
                emptyMessage="Nenhuma vistoria realizada ainda."
              />

            </PageSection>

          </FadeIn>

          <Modal
            open={!!detalhe}
            onClose={() => setDetalhe(null)}
            title={detalhe?.unidade?.nome || "Detalhes"}
            subtitle={detalhe?.vistoria?.titulo}
            size="md"
          >

            {detalhe && (

              <div className="space-y-5">

                <div className="grid grid-cols-2 gap-4 text-sm">

                  <div>
                    <p className="text-[var(--text-faint)] uppercase text-xs mb-1">Data/Hora Realizada</p>
                    <p className="text-[var(--text)] font-medium">{formatDateTime(detalhe.dataRealizacao)}</p>
                  </div>

                  <div>
                    <p className="text-[var(--text-faint)] uppercase text-xs mb-1">Responsável</p>
                    <p className="text-[var(--text)] font-medium">{detalhe.realizadoPor || "-"}</p>
                  </div>

                  <div>
                    <p className="text-[var(--text-faint)] uppercase text-xs mb-1">Residência</p>
                    <p className="text-[var(--text)] font-medium">{detalhe.unidade?.nome || "-"}</p>
                  </div>

                  <div>
                    <p className="text-[var(--text-faint)] uppercase text-xs mb-1">Ciclo</p>
                    <p className="text-[var(--text)] font-medium">{detalhe.ciclo}</p>
                  </div>

                </div>

                {detalhe.observacoes && (
                  <div>
                    <p className="text-[var(--text-faint)] uppercase text-xs mb-1">Observações</p>
                    <p className="text-[var(--text-muted)] whitespace-pre-wrap">{detalhe.observacoes}</p>
                  </div>
                )}

                {detalhe.fotos?.length > 0 && (
                  <div>
                    <p className="text-[var(--text-faint)] uppercase text-xs mb-2">Fotos e Vídeos</p>
                    <div className="grid grid-cols-3 gap-3">
                      {detalhe.fotos.map((midia, index) =>
                        midia.startsWith("data:video") ? (
                          <video
                            key={index}
                            src={midia}
                            controls
                            className="w-full h-24 object-cover rounded-xl border border-[var(--border-token)]"
                          />
                        ) : (
                          <img
                            key={index}
                            src={midia}
                            alt={`Mídia ${index + 1}`}
                            className="w-full h-24 object-cover rounded-xl border border-[var(--border-token)]"
                          />
                        )
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button variant="secondary" onClick={() => setDetalhe(null)}>
                    Fechar
                  </Button>
                </div>

              </div>

            )}

          </Modal>

        </PageContainer>

      </Page>

    </MainLayout>

  );

}
