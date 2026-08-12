/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useEffect, useMemo, useState } from "react";

import MainLayout from "../components/layout/MainLayout";

import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import FadeIn from "../components/ui/FadeIn";
import PageHeader from "../components/ui/PageHeader";
import PageSection from "../components/ui/PageSection";
import Button from "../components/ui/Button";

import AsaasResumoCards from "../components/asaas-transacoes/AsaasResumoCards";
import AsaasFiltros from "../components/asaas-transacoes/AsaasFiltros";
import AsaasTabela from "../components/asaas-transacoes/AsaasTabela";
import AsaasExportar from "../components/asaas-transacoes/AsaasExportar";
import AsaasDetalhesModal from "../components/asaas-transacoes/AsaasDetalhesModal";
import AsaasNovaCobrancaModal from "../components/asaas-transacoes/AsaasNovaCobrancaModal";

import { AsaasService } from "@/services/asaas.service";

const STATUS_ROTULO_PARA_VALOR = {
  Recebido: "PAGA",
  Pendente: "PENDENTE",
  Atrasado: "ATRASADA",
  Cancelado: "CANCELADA",
};

export default function AsaasTransacoesPage() {

  const [transacoes, setTransacoes] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [filtros, setFiltros] =
    useState(null);

  const [enviandoId, setEnviandoId] =
    useState(null);

  const [transacaoSelecionada, setTransacaoSelecionada] =
    useState(null);

  const [detalhesOpen, setDetalhesOpen] =
    useState(false);

  const [novaCobrancaOpen, setNovaCobrancaOpen] =
    useState(false);

  async function carregarTransacoes() {

    try {

      setLoading(true);

      const resposta = await AsaasService.listarTransacoes();

      const lista = Array.isArray(resposta)
        ? resposta
        : resposta.data || [];

      setTransacoes(lista);

    } catch (error) {

      console.error("Erro ao carregar transações Asaas:", error);

    } finally {

      setLoading(false);

    }

  }

  useEffect(() => {

    carregarTransacoes();

  }, []);

  async function enviarCobranca(transacao) {

    try {

      setEnviandoId(transacao.id);

      await AsaasService.enviarCobranca(transacao.id);

      await carregarTransacoes();

    } catch (error) {

      console.error("Erro ao enviar cobrança ao Asaas:", error);

      alert(error.message || "Erro ao enviar cobrança ao Asaas.");

    } finally {

      setEnviandoId(null);

    }

  }

  function abrirDetalhes(transacao) {

    setTransacaoSelecionada(transacao);
    setDetalhesOpen(true);

  }

  const transacoesFiltradas = useMemo(() => {

    if (!filtros) return transacoes;

    return transacoes.filter((item) => {

      const termo = filtros.busca?.toLowerCase().trim();

      if (termo) {

        const alvo = `${item.cliente || ""}`.toLowerCase();

        if (!alvo.includes(termo)) return false;

      }

      if (filtros.status && filtros.status !== "Todos") {

        const statusEsperado =
          STATUS_ROTULO_PARA_VALOR[filtros.status];

        if (item.status !== statusEsperado) return false;

      }

      if (filtros.forma && filtros.forma !== "Todas") {

        if (
          (item.formaPagamento || "").toLowerCase() !==
          filtros.forma.toLowerCase()
        )
          return false;

      }

      if (filtros.periodo) {

        if (!item.vencimento) return false;

        const vencimento = new Date(item.vencimento)
          .toISOString()
          .slice(0, 10);

        if (vencimento > filtros.periodo) return false;

      }

      return true;

    });

  }, [transacoes, filtros]);

  return (

  <MainLayout>

    <Page>

      <PageContainer>

        <FadeIn>

          <PageHeader
            title="Asaas Transações"
            subtitle="Gerencie cobranças, recebimentos e sincronizações."
            count={transacoes.length}
            countLabel="cobrança(s)"
            actions={
              <Button onClick={() => setNovaCobrancaOpen(true)}>
                Nova Cobrança
              </Button>
            }
          />

        </FadeIn>

        <FadeIn delay={0.10}>

          <PageSection spacing="xl">

            <AsaasResumoCards transacoes={transacoes} />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.20}>

          <PageSection spacing="lg">

            <AsaasFiltros
              onFiltrar={setFiltros}
              onLimpar={() => setFiltros(null)}
            />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.30}>

          <PageSection spacing="xxl">

            <AsaasTabela
              transacoes={transacoesFiltradas}
              loading={loading}
              onVisualizar={abrirDetalhes}
              onDetalhes={abrirDetalhes}
              onEnviar={enviarCobranca}
              enviandoId={enviandoId}
            />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.40}>

          <PageSection spacing="xxl">

            <AsaasExportar transacoes={transacoesFiltradas} />

          </PageSection>

        </FadeIn>

        <AsaasDetalhesModal
          open={detalhesOpen}
          onClose={() => setDetalhesOpen(false)}
          transacao={transacaoSelecionada}
        />

        <AsaasNovaCobrancaModal
          open={novaCobrancaOpen}
          onClose={() => setNovaCobrancaOpen(false)}
          onCriada={() => {

            setNovaCobrancaOpen(false);

            carregarTransacoes();

          }}
        />

      </PageContainer>

    </Page>

  </MainLayout>

);
}
