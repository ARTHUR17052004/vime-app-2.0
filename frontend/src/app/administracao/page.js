"use client";

import MainLayout from "../components/layout/MainLayout";

import FadeIn from "../components/ui/FadeIn";
import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import PageSection from "../components/ui/PageSection";

import AdministracaoHeader from "../components/administracao/AdministracaoHeader";
import AdministracaoStats from "../components/administracao/AdministracaoStats";
import AdministracaoTable from "../components/administracao/AdministracaoTable";

export default function AdministracaoPage() {

  const usuarios = [];

  const auditorias = [];

  const logs = [];

  return (

    <MainLayout>

      <Page>

        <PageContainer>

          <FadeIn>

            <AdministracaoHeader
              totalUsuarios={usuarios.length}
              onNovoUsuario={() => {}}
            />

          </FadeIn>

          <FadeIn delay={0.10}>

            <PageSection spacing="xl">

              <AdministracaoStats
                usuarios={12}
                perfis={3}
                permissoes={78}
                sessoes={2}
                auditorias={15}
                logs={9}
              />

            </PageSection>

          </FadeIn>

          <FadeIn delay={0.20}>

            <PageSection spacing="xxl">

              <AdministracaoTable
                loading={false}
                emptyMessage="Nenhum usuário encontrado."
                columns={[
                  {
                    key: "nome",
                    title: "Nome",
                  },
                  {
                    key: "perfil",
                    title: "Perfil",
                  },
                  {
                    key: "status",
                    title: "Status",
                  },
                  {
                    key: "ultimoAcesso",
                    title: "Último Acesso",
                  },
                ]}
                data={usuarios}
              />

            </PageSection>

          </FadeIn>

          <FadeIn delay={0.30}>

            <PageSection spacing="xxl">

              <AdministracaoTable
                loading={false}
                emptyMessage="Nenhuma auditoria encontrada."
                columns={[
                  {
                    key: "usuario",
                    title: "Usuário",
                  },
                  {
                    key: "modulo",
                    title: "Módulo",
                  },
                  {
                    key: "acao",
                    title: "Ação",
                  },
                  {
                    key: "data",
                    title: "Data",
                  },
                ]}
                data={auditorias}
              />

            </PageSection>

          </FadeIn>

          <FadeIn delay={0.40}>

            <PageSection spacing="xxl">

              <AdministracaoTable
                loading={false}
                emptyMessage="Nenhum log encontrado."
                columns={[
                  {
                    key: "tipo",
                    title: "Tipo",
                  },
                  {
                    key: "descricao",
                    title: "Descrição",
                  },
                  {
                    key: "status",
                    title: "Status",
                  },
                  {
                    key: "data",
                    title: "Data",
                  },
                ]}
                data={logs}
              />

            </PageSection>

          </FadeIn>

        </PageContainer>

      </Page>

    </MainLayout>

  );

}