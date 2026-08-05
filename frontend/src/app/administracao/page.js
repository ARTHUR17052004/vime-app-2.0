"use client";

import {
  Users,
  Shield,
  KeyRound,
  Activity,
  History,
  FileText,
} from "lucide-react";

import { useRouter } from "next/navigation";

import MainLayout from "../components/layout/MainLayout";

import FadeIn from "../components/ui/FadeIn";
import Page from "../components/ui/Page";
import PageContainer from "../components/ui/PageContainer";
import PageSection from "../components/ui/PageSection";
import Button from "../components/ui/Button";

import AdministracaoHeader from "../components/administracao/AdministracaoHeader";
import AdministracaoStats from "../components/administracao/AdministracaoStats";
import AdministracaoCard from "../components/administracao/AdministracaoCard";

export default function AdministracaoPage() {

  const router = useRouter();

  const cards = [

    {
      title: "Usuários",
      subtitle: "Usuários cadastrados",
      value: 12,
      icon: Users,
      color: "emerald",
    },

    {
      title: "Perfis",
      subtitle: "Perfis cadastrados",
      value: 3,
      icon: Shield,
      color: "blue",
    },

    {
      title: "Permissões",
      subtitle: "Permissões",
      value: 78,
      icon: KeyRound,
      color: "yellow",
    },

    {
      title: "Sessões",
      subtitle: "Usuários Online",
      value: 2,
      icon: Activity,
      color: "purple",
    },

    {
      title: "Auditorias",
      subtitle: "Registros",
      value: 15,
      icon: History,
      color: "emerald",
    },

    {
      title: "Logs",
      subtitle: "Eventos",
      value: 9,
      icon: FileText,
      color: "red",
    },

  ];

  return (

    <MainLayout>

      <Page>

        <PageContainer>

          <FadeIn>

            <AdministracaoHeader

              totalUsuarios={12}

              onNovoUsuario={() =>
                router.push("/administracao/usuarios")
              }

            />

          </FadeIn>

          <FadeIn delay={0.10}>

            <PageSection spacing="xl">

              <AdministracaoStats

                cards={cards}

              />

            </PageSection>

          </FadeIn>

          <FadeIn delay={0.20}>

            <PageSection spacing="xxl">

              <div className="grid lg:grid-cols-3 gap-6">

                <AdministracaoCard

                  title="Usuários"

                  subtitle="Gerenciar usuários"

                >

                  <Button

                    className="w-full"

                    onClick={() =>
                      router.push("/administracao/usuarios")
                    }

                  >

                    Abrir Usuários

                  </Button>

                </AdministracaoCard>

                <AdministracaoCard

                  title="Perfis"

                  subtitle="Perfis de acesso"

                >

                  <Button

                    className="w-full"

                    onClick={() =>
                      router.push("/administracao/perfis")
                    }

                  >

                    Abrir Perfis

                  </Button>

                </AdministracaoCard>

                <AdministracaoCard

                  title="Permissões"

                  subtitle="Controle de acesso"

                >

                  <Button

                    className="w-full"

                    onClick={() =>
                      router.push("/administracao/permissoes")
                    }

                  >

                    Abrir Permissões

                  </Button>

                </AdministracaoCard>

                <AdministracaoCard

                  title="Sessões"

                  subtitle="Usuários conectados"

                >

                  <Button

                    className="w-full"

                    onClick={() =>
                      router.push("/administracao/sessoes")
                    }

                  >

                    Abrir Sessões

                  </Button>

                </AdministracaoCard>

                <AdministracaoCard

                  title="Auditoria"

                  subtitle="Histórico do sistema"

                >

                  <Button

                    className="w-full"

                    onClick={() =>
                      router.push("/administracao/auditoria")
                    }

                  >

                    Abrir Auditoria

                  </Button>

                </AdministracaoCard>

                <AdministracaoCard

                  title="Logs"

                  subtitle="Logs internos"

                >

                  <Button

                    className="w-full"

                    onClick={() =>
                      router.push("/administracao/logs")
                    }

                  >

                    Abrir Logs

                  </Button>

                </AdministracaoCard>

              </div>

            </PageSection>

          </FadeIn>

        </PageContainer>

      </Page>

    </MainLayout>

  );

}