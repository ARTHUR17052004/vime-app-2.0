"use client";

import MainLayout from "../components/layout/MainLayout";

import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";


import AsaasWizard from "../components/asaas/AsaasWizard";
import AsaasStatusCard from "../components/asaas/AsaasStatusCard";
import AsaasConfiguracaoForm from "../components/asaas/AsaasConfiguracaoForm";
import AsaasWebhookCard from "../components/asaas/AsaasWebhookCard";
import AsaasDiagnostico from "../components/asaas/AsaasDiagnostico";
import AsaasTutorial from "../components/asaas/AsaasTutorial";
import FadeIn from "../components/ui/FadeIn";
import PageHeader from "../components/ui/PageHeader";
import PageSection from "../components/ui/PageSection";

export default function AsaasConfigPage() {

 return (

  <MainLayout>

    <Page>

      <PageContainer>

        <FadeIn>

          <PageHeader
            title="Configuração Asaas"
            subtitle="Configure toda a integração do VIME com o Asaas."
            count={1}
            countLabel="integração financeira"
          />

        </FadeIn>

        <FadeIn delay={0.10}>

          <PageSection spacing="xl">

            <AsaasWizard />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.20}>

          <PageSection spacing="xxl">

            <AsaasStatusCard />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.30}>

          <PageSection spacing="xxl">

            <AsaasConfiguracaoForm />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.40}>

          <PageSection spacing="xxl">

            <AsaasWebhookCard />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.50}>

          <PageSection spacing="xxl">

            <AsaasDiagnostico />

          </PageSection>

        </FadeIn>

        <FadeIn delay={0.60}>

          <PageSection spacing="xxl">

            <AsaasTutorial />

          </PageSection>

        </FadeIn>

      </PageContainer>

    </Page>

  </MainLayout>

);
}