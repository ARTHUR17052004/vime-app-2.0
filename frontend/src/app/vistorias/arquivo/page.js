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
import Table from "../../components/ui/Table";
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

  const podeVisualizar = usePermissao("arquivoVistorias.visualizar");

  const [missoes, setMissoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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

      const alvo = `
        ${m.vistoria?.titulo || ""}
        ${m.unidade?.nome || ""}
        ${m.realizadoPor || ""}
      `.toLowerCase();

      return alvo.includes(texto);

    });

  }, [missoes, search]);

  const colunas = [
    { key: "vistoria", title: "Vistoria", render: (m) => m.vistoria?.titulo || "-" },
    { key: "unidade", title: "Residência", render: (m) => m.unidade?.nome || "-" },
    { key: "ciclo", title: "Ciclo" },
    { key: "dataRealizacao", title: "Data/Hora Realizada", render: (m) => formatDateTime(m.dataRealizacao) },
    { key: "realizadoPor", title: "Responsável", render: (m) => m.realizadoPor || "-" },
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

        </PageContainer>

      </Page>

    </MainLayout>

  );

}
