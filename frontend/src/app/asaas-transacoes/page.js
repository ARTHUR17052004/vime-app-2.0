"use client";

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

export default function AsaasTransacoesPage() {

  return (

  <MainLayout>

    <Page>

      <PageContainer>

        <FadeIn>

          <PageHeader
            title="Asaas Transações"
            subtitle="Gerencie cobranças, recebimentos e sincronizações."
            count={1}
            countLabel="integração Asaas"
            actions={
              <Button>
                Nova Cobrança
              </Button>
            }
          />

        </FadeIn>

        <FadeIn delay={0.10}>

          <PageSection spacing="xl">

            <AsaasResumoCards />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.20}>

          <PageSection spacing="lg">

            <AsaasFiltros />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.30}>

          <PageSection spacing="xxl">

            <AsaasTabela />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.40}>

          <PageSection spacing="xxl">

            <AsaasExportar />

          </PageSection>

        </FadeIn>

        <AsaasDetalhesModal />

      </PageContainer>

    </Page>

  </MainLayout>

);
}